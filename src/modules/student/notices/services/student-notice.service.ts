import {
  AppointmentStatus,
  PaymentStatus,
  StudentAppointmentResponseStatus,
  StudentNoticeCategory,
  StudentNoticeEntityType,
  StudentNoticeKind,
  StudentNoticePriority
} from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/db";
import type {
  StudentNoticeFilter,
  StudentNoticeItem
} from "@/modules/student/notices/dto/student-notice.dto";
import { StudentNoticeRepository } from "@/modules/student/notices/repositories/student-notice.repository";
import {
  CreateManualStudentNoticeSchema,
  type CreateManualStudentNoticeInput
} from "@/modules/student/notices/schemas/student-notice.schema";

function mapKind(kind: StudentNoticeKind): StudentNoticeItem["kind"] {
  if (kind === StudentNoticeKind.SUCCESS) return "success";
  if (kind === StudentNoticeKind.WARNING) return "warning";
  return "info";
}

function mapPriority(priority: StudentNoticePriority): StudentNoticeItem["priority"] {
  if (priority === StudentNoticePriority.HIGH) return "high";
  if (priority === StudentNoticePriority.MEDIUM) return "medium";
  return "low";
}

function mapCategory(
  category: StudentNoticeCategory,
  entityType: StudentNoticeEntityType | null
): StudentNoticeItem["category"] {
  if (category === StudentNoticeCategory.SYSTEM && entityType === StudentNoticeEntityType.STUDENT) {
    return "Comunicado do personal";
  }

  switch (category) {
    case StudentNoticeCategory.SESSION_REMINDER:
      return "Lembrete de sessão";
    case StudentNoticeCategory.SCHEDULE_CHANGE:
      return "Alteração de horário";
    case StudentNoticeCategory.PENDING_REQUEST:
      return "Solicitação pendente";
    case StudentNoticeCategory.CONFIRMATION_REQUIRED:
      return "Confirmação pendente";
    case StudentNoticeCategory.PAYMENT_ALERT:
      return "Aviso financeiro";
    case StudentNoticeCategory.PROGRESS_UPDATE:
      return "Atualização de evolução";
    default:
      return "Aviso do sistema";
  }
}

function getRelatedHref(entityType: StudentNoticeEntityType | null) {
  if (entityType === StudentNoticeEntityType.APPOINTMENT) {
    return {
      href: "/student/agenda",
      label: "Abrir agenda"
    };
  }

  if (entityType === StudentNoticeEntityType.PROGRESS_RECORD) {
    return {
      href: "/student/progress",
      label: "Ver evolução"
    };
  }

  if (entityType === StudentNoticeEntityType.STUDENT) {
    return {
      href: "/student/profile",
      label: "Abrir perfil"
    };
  }

  return undefined;
}

function mapNoticeItem(
  notice: Awaited<ReturnType<typeof StudentNoticeRepository.findManyByStudent>>[number]
): StudentNoticeItem {
  const related = getRelatedHref(notice.relatedEntityType);

  return {
    id: notice.id,
    title: notice.title,
    description: notice.description,
    details: notice.details,
    createdAt: notice.createdAt,
    kind: mapKind(notice.kind),
    category: mapCategory(notice.category, notice.relatedEntityType),
    priority: mapPriority(notice.priority),
    isRead: notice.isRead,
    relatedHref: related?.href,
    relatedLabel: related?.label
  };
}

function manualPriorityToDb(priority: CreateManualStudentNoticeInput["priority"]) {
  switch (priority) {
    case "high":
      return StudentNoticePriority.HIGH;
    case "medium":
      return StudentNoticePriority.MEDIUM;
    default:
      return StudentNoticePriority.LOW;
  }
}

export class StudentNoticeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StudentNoticeError";
  }
}

export const StudentNoticeService = {
  async listByStudent(studentId: string, filter: StudentNoticeFilter = "all"): Promise<StudentNoticeItem[]> {
    await this.syncForStudent(studentId);

    const notices = await StudentNoticeRepository.findManyByStudent(studentId, {
      isRead: filter === "unread" ? false : undefined,
      priority: filter === "high-priority" ? StudentNoticePriority.HIGH : undefined
    });

    return notices.map(mapNoticeItem);
  },

  async markAsRead(studentId: string, noticeId: string) {
    const result = await StudentNoticeRepository.markAsRead(studentId, noticeId);

    if (result.count === 0) {
      throw new StudentNoticeError("Aviso não encontrado para este aluno.");
    }
  },

  async createManualNoticeForStudent(tenantId: string, studentId: string, input: CreateManualStudentNoticeInput) {
    const parsed = CreateManualStudentNoticeSchema.parse(input);

    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        tenantId
      },
      select: {
        id: true,
        tenantId: true
      }
    });

    if (!student) {
      throw new StudentNoticeError("Aluno não encontrado no tenant atual.");
    }

    await StudentNoticeRepository.create({
      externalKey: `manual:${student.id}:${Date.now()}`,
      tenantId,
      studentId: student.id,
      kind: StudentNoticeKind.INFO,
      category: StudentNoticeCategory.SYSTEM,
      title: parsed.title,
      description: parsed.description,
      details: parsed.details,
      priority: manualPriorityToDb(parsed.priority),
      relatedEntityType: StudentNoticeEntityType.STUDENT,
      relatedEntityId: student.id,
      createdAt: new Date()
    });
  },

  async syncForStudent(studentId: string) {
    const [appointments, payments, progressRecords] = await Promise.all([
      prisma.appointment.findMany({
        where: { studentId },
        select: { id: true }
      }),
      prisma.payment.findMany({
        where: { studentId },
        select: { id: true }
      }),
      prisma.progressRecord.findMany({
        where: { studentId },
        orderBy: { recordedAt: "desc" },
        select: { id: true },
        take: 10
      })
    ]);

    await Promise.all([
      ...appointments.map((appointment) => this.syncAppointmentNoticeById(appointment.id)),
      ...payments.map((payment) => this.syncPaymentNoticeById(payment.id)),
      ...progressRecords.map((record) => this.syncProgressNoticeById(record.id))
    ]);
  },

  async syncAppointmentNoticeById(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        tenant: {
          select: {
            personalName: true
          }
        },
        student: {
          select: {
            id: true,
            tenantId: true
          }
        }
      }
    });

    if (!appointment) {
      return;
    }

    const externalKey = `appointment:${appointment.id}`;

    if (appointment.status === AppointmentStatus.COMPLETED || appointment.status === AppointmentStatus.MISSED) {
      await StudentNoticeRepository.deleteByExternalKey(externalKey);
      return;
    }

    const sessionDateLabel = format(appointment.startsAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    let kind: StudentNoticeKind = StudentNoticeKind.INFO;
    let category: StudentNoticeCategory = StudentNoticeCategory.CONFIRMATION_REQUIRED;
    let priority: StudentNoticePriority = StudentNoticePriority.MEDIUM;
    let title = "Confirmação pendente da sessão";
    let description = `Seu atendimento com ${appointment.tenant.personalName} está previsto para ${sessionDateLabel}.`;
    let details =
      appointment.notes ??
      "Revise os detalhes da sessão na agenda e confirme sua presença quando fizer sentido.";

    if (appointment.status === AppointmentStatus.CANCELED) {
      kind = StudentNoticeKind.WARNING;
      category = StudentNoticeCategory.SCHEDULE_CHANGE;
      priority = StudentNoticePriority.HIGH;
      title = "Sessão alterada ou cancelada";
      description = `Houve uma alteração no compromisso previsto para ${sessionDateLabel}.`;
      details = appointment.notes ?? "Consulte a agenda para verificar o novo contexto desta sessão.";
    } else if (appointment.studentResponseStatus === StudentAppointmentResponseStatus.CONFIRMED) {
      kind = StudentNoticeKind.SUCCESS;
      category = StudentNoticeCategory.SESSION_REMINDER;
      title = "Sessão confirmada na agenda";
      description = `Sua presença foi confirmada para a sessão de ${sessionDateLabel}.`;
      details =
        appointment.studentResponseNote ??
        appointment.notes ??
        "Seu personal já consegue visualizar essa confirmação no painel.";
    } else if (appointment.studentResponseStatus === StudentAppointmentResponseStatus.RESCHEDULE_REQUESTED) {
      kind = StudentNoticeKind.WARNING;
      category = StudentNoticeCategory.PENDING_REQUEST;
      priority = StudentNoticePriority.HIGH;
      title = "Solicitação de reagendamento enviada";
      description = `Seu pedido de reagendamento para a sessão de ${sessionDateLabel} está pendente de análise.`;
      details =
        appointment.studentResponseNote ??
        "O personal foi notificado e poderá ajustar a agenda a partir da sua solicitação.";
    } else if (appointment.studentResponseStatus === StudentAppointmentResponseStatus.CANCELED) {
      kind = StudentNoticeKind.WARNING;
      category = StudentNoticeCategory.PENDING_REQUEST;
      priority = StudentNoticePriority.HIGH;
      title = "Solicitação de cancelamento enviada";
      description = `Seu pedido de cancelamento da sessão de ${sessionDateLabel} foi registrado.`;
      details =
        appointment.studentResponseNote ??
        "O personal consegue visualizar esse pedido e decidir os próximos passos.";
    } else {
      const daysToSession = Math.max(
        0,
        Math.floor((appointment.startsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      );

      if (daysToSession <= 1) {
        kind = StudentNoticeKind.WARNING;
        category = StudentNoticeCategory.SESSION_REMINDER;
        priority = StudentNoticePriority.HIGH;
        title = "Lembrete da próxima sessão";
        details =
          appointment.notes ??
          "Confira os detalhes da sessão e organize sua rotina para chegar preparado.";
      }
    }

    await StudentNoticeRepository.upsertByExternalKey({
      externalKey,
      tenantId: appointment.student.tenantId,
      studentId: appointment.student.id,
      kind,
      category,
      title,
      description,
      details,
      priority,
      relatedEntityType: StudentNoticeEntityType.APPOINTMENT,
      relatedEntityId: appointment.id,
      createdAt: appointment.updatedAt
    });
  },

  async syncPaymentNoticeById(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        tenant: {
          select: {
            personalName: true
          }
        },
        student: {
          select: {
            id: true,
            tenantId: true
          }
        }
      }
    });

    if (!payment) {
      return;
    }

    const externalKey = `payment:${payment.id}`;

    if (payment.status === PaymentStatus.CANCELED) {
      await StudentNoticeRepository.deleteByExternalKey(externalKey);
      return;
    }

    const isOverdue = payment.status === PaymentStatus.OVERDUE || payment.dueDate < new Date();

    if (payment.status === PaymentStatus.PAID) {
      await StudentNoticeRepository.upsertByExternalKey({
        externalKey,
        tenantId: payment.student.tenantId,
        studentId: payment.student.id,
        kind: StudentNoticeKind.SUCCESS,
        category: StudentNoticeCategory.PAYMENT_ALERT,
        title: "Pagamento confirmado",
        description: `O pagamento com vencimento em ${format(payment.dueDate, "dd/MM/yyyy", { locale: ptBR })} foi confirmado no sistema.`,
        details:
          payment.notes ??
          `Seu personal ${payment.tenant.personalName} já registrou esse pagamento como concluído.`,
        priority: StudentNoticePriority.LOW,
        relatedEntityType: StudentNoticeEntityType.PAYMENT,
        relatedEntityId: payment.id,
        createdAt: payment.updatedAt
      });
      return;
    }

    await StudentNoticeRepository.upsertByExternalKey({
      externalKey,
      tenantId: payment.student.tenantId,
      studentId: payment.student.id,
      kind: isOverdue ? StudentNoticeKind.WARNING : StudentNoticeKind.INFO,
      category: StudentNoticeCategory.PAYMENT_ALERT,
      title: isOverdue ? "Pagamento em aberto" : "Pagamento pendente registrado",
      description: `Existe um registro financeiro com vencimento em ${format(payment.dueDate, "dd/MM/yyyy", { locale: ptBR })}.`,
      details:
        payment.notes ??
        (isOverdue
          ? `Acompanhe essa pendência com ${payment.tenant.personalName} para manter seu plano organizado.`
          : "O pagamento já está registrado no sistema e pode ser acompanhado junto ao seu personal."),
      priority: isOverdue ? StudentNoticePriority.HIGH : StudentNoticePriority.MEDIUM,
      relatedEntityType: StudentNoticeEntityType.PAYMENT,
      relatedEntityId: payment.id,
      createdAt: payment.updatedAt
    });
  },

  async syncProgressNoticeById(progressRecordId: string) {
    const progressRecord = await prisma.progressRecord.findUnique({
      where: { id: progressRecordId },
      include: {
        tenant: {
          select: {
            personalName: true
          }
        },
        student: {
          select: {
            id: true,
            tenantId: true
          }
        }
      }
    });

    if (!progressRecord) {
      return;
    }

    await StudentNoticeRepository.upsertByExternalKey({
      externalKey: `progress:${progressRecord.id}`,
      tenantId: progressRecord.student.tenantId,
      studentId: progressRecord.student.id,
      kind: StudentNoticeKind.SUCCESS,
      category: StudentNoticeCategory.PROGRESS_UPDATE,
      title: "Novo registro de evolução disponível",
      description: `Seu acompanhamento recebeu uma atualização em ${format(progressRecord.recordedAt, "dd/MM/yyyy", { locale: ptBR })}.`,
      details:
        progressRecord.notes ??
        `Há um novo registro lançado por ${progressRecord.tenant.personalName} para você acompanhar no painel.`,
      priority: StudentNoticePriority.MEDIUM,
      relatedEntityType: StudentNoticeEntityType.PROGRESS_RECORD,
      relatedEntityId: progressRecord.id,
      createdAt: progressRecord.updatedAt
    });
  }
};