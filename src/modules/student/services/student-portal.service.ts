import {
  addDays,
  endOfMonth,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
  subWeeks
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AppointmentStatus,
  PaymentStatus,
  StudentAppointmentResponseStatus,
  StudentStatus
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { PasswordService } from "@/modules/auth/services/password.service";
import type {
  StudentNoticeFilter,
  StudentNoticeItem
} from "@/modules/student/notices/dto/student-notice.dto";
import { StudentNoticeService } from "@/modules/student/notices/services/student-notice.service";
import {
  ChangeStudentPasswordSchema,
  type ChangeStudentPasswordInput,
  UpdateStudentProfileSchema,
  type UpdateStudentProfileInput
} from "@/modules/student/schemas/student-profile.schema";

export const studentAgendaStatuses = [
  "Agendado",
  "Confirmado",
  "Pendente",
  "Cancelado",
  "Conclu\u00EDdo",
  "Reagendamento solicitado"
] as const;

export type StudentAppointmentStatus = (typeof studentAgendaStatuses)[number];
export type StudentAttendanceStatus = "Presen\u00E7a confirmada" | "Presente" | "Ausente justificado";
export type StudentHistoryPeriod = "all" | "30d" | "90d";
export type StudentHistoryAttendanceFilter = "all" | "present" | "absent";
export type { StudentNoticeFilter, StudentNoticeItem } from "@/modules/student/notices/dto/student-notice.dto";

export type StudentAppointmentHistoryItem = {
  id: string;
  status: StudentAppointmentStatus | "Criado";
  occurredAt: Date;
  description: string;
};

export type StudentUpcomingAppointment = {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  coach: string;
  location: string;
  format: string;
  status: StudentAppointmentStatus;
  notes?: string;
  preparationInstructions?: string;
  history: StudentAppointmentHistoryItem[];
};

export type StudentHistoryItem = {
  id: string;
  title: string;
  category: string;
  date: Date;
  startsAt: Date;
  endsAt: Date;
  finalStatus: "Conclu\u00EDdo" | "Registrado";
  attendance: StudentAttendanceStatus;
  note: string;
  coach: string;
  location: string;
  insights: string[];
};

export type StudentProgressItem = {
  id: string;
  recordedAt: Date;
  title: string;
  value: string;
  note: string;
};

export type StudentProgressMetric = {
  id: string;
  label: string;
  value: string;
  description: string;
};

export type StudentProgressTrendPoint = {
  id: string;
  label: string;
  value: number;
  rawValue: number;
};

export type StudentDashboardStat = {
  id: string;
  label: string;
  value: string;
  description: string;
};

export type StudentQuickAction = {
  id: string;
  label: string;
  description: string;
  href: string;
};

type StudentContext = Awaited<ReturnType<typeof getStudentContext>>;
type StudentAppointmentRecord = Awaited<ReturnType<typeof getStudentAppointments>>[number];

export class StudentProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StudentProfileError";
  }
}

async function getStudentContext(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: {
        select: {
          id: true,
          email: true,

        }
      },
      tenant: {
        select: {
          id: true,
          businessName: true,
          personalName: true,
          saasSubscription: {
            select: {
              planName: true,
              status: true
            }
          }
        }
      }
    }
  });

  if (!student) {
    throw new StudentProfileError("Aluno nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o encontrado.");
  }

  return student;
}

function buildLocationLabel(context: StudentContext) {
  return context.tenant.businessName;
}

function buildFormatLabel() {
  return "SessÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o com acompanhamento do personal";
}

function mapStudentVisibleStatus(
  appointmentStatus: AppointmentStatus,
  responseStatus: StudentAppointmentResponseStatus
): StudentAppointmentStatus {
  if (appointmentStatus === AppointmentStatus.COMPLETED) return "Conclu\u00EDdo";
  if (appointmentStatus === AppointmentStatus.CANCELED || appointmentStatus === AppointmentStatus.MISSED) {
    return "Cancelado";
  }

  if (responseStatus === StudentAppointmentResponseStatus.CONFIRMED) return "Confirmado";
  if (responseStatus === StudentAppointmentResponseStatus.RESCHEDULE_REQUESTED) {
    return "Reagendamento solicitado";
  }
  if (responseStatus === StudentAppointmentResponseStatus.CANCELED) return "Cancelado";

  return "Pendente";
}

function mapAttendanceStatus(
  appointmentStatus: AppointmentStatus,
  responseStatus: StudentAppointmentResponseStatus
): StudentAttendanceStatus {
  if (appointmentStatus === AppointmentStatus.COMPLETED) return "Presente";
  if (responseStatus === StudentAppointmentResponseStatus.CONFIRMED) return "Presen\u00E7a confirmada";
  return "Ausente justificado";
}

function buildAppointmentHistory(appointment: StudentAppointmentRecord): StudentAppointmentHistoryItem[] {
  const items: StudentAppointmentHistoryItem[] = [
    {
      id: `${appointment.id}-created`,
      status: "Criado",
      occurredAt: appointment.createdAt,
      description: "SessÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o adicionada ao seu acompanhamento pelo personal."
    }
  ];

  if (appointment.studentRespondedAt) {
    const responseStatus = mapStudentVisibleStatus(appointment.status, appointment.studentResponseStatus);

    items.push({
      id: `${appointment.id}-student-response`,
      status: responseStatus,
      occurredAt: appointment.studentRespondedAt,
      description:
        appointment.studentResponseNote ??
        (responseStatus === "Confirmado"
          ? "VocÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âª confirmou presenÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§a nesta sessÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o."
          : responseStatus === "Reagendamento solicitado"
            ? "VocÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âª solicitou reagendamento e o personal precisa analisar esse pedido."
            : "VocÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âª registrou uma solicitaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o de cancelamento para esta sessÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o.")
    });
  }

  items.push({
    id: `${appointment.id}-updated`,
    status: mapStudentVisibleStatus(appointment.status, appointment.studentResponseStatus),
    occurredAt: appointment.updatedAt,
    description:
      appointment.status === AppointmentStatus.COMPLETED
        ? "SessÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o concluÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­da e registrada no histÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³rico do seu acompanhamento."
        : appointment.status === AppointmentStatus.CANCELED || appointment.status === AppointmentStatus.MISSED
          ? "SessÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o encerrada ou cancelada no planejamento atual."
          : "SessÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o mantida na agenda do seu acompanhamento."
  });

  return items.sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
}

async function getStudentAppointments(studentId: string) {
  return prisma.appointment.findMany({
    where: {
      studentId
    },
    orderBy: {
      startsAt: "asc"
    }
  });
}

async function getStudentPayments(studentId: string) {
  return prisma.payment.findMany({
    where: {
      studentId
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }]
  });
}

async function getStudentProgressRecords(studentId: string) {
  return prisma.progressRecord.findMany({
    where: {
      studentId
    },
    orderBy: {
      recordedAt: "desc"
    }
  });
}

export const StudentPortalService = {
  async getDashboardOverview(studentId: string) {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [context, appointments, payments, progressRecords, notices] = await Promise.all([
      getStudentContext(studentId),
      getStudentAppointments(studentId),
      getStudentPayments(studentId),
      getStudentProgressRecords(studentId),
      StudentNoticeService.listByStudent(studentId)
    ]);

    const nextSessionRecord = appointments.find(
      (appointment) =>
        appointment.startsAt >= now &&
        appointment.status === AppointmentStatus.SCHEDULED
    );

    const upcomingAppointments = appointments
      .filter((appointment) => appointment.startsAt >= now)
      .slice(0, 4)
      .map((appointment) => ({
        id: appointment.id,
        title: appointment.title,
        startsAt: appointment.startsAt,
        endsAt: appointment.endsAt,
        coach: context.tenant.personalName,
        location: buildLocationLabel(context),
        format: buildFormatLabel(),
        status: mapStudentVisibleStatus(appointment.status, appointment.studentResponseStatus),
        notes: appointment.notes ?? undefined,
        preparationInstructions: appointment.notes ?? undefined,
        history: buildAppointmentHistory(appointment)
      }));

    const nextSession = nextSessionRecord
      ? {
          id: nextSessionRecord.id,
          title: nextSessionRecord.title,
          startsAt: nextSessionRecord.startsAt,
          endsAt: nextSessionRecord.endsAt,
          coach: context.tenant.personalName,
          location: buildLocationLabel(context),
          format: buildFormatLabel(),
          status: mapStudentVisibleStatus(
            nextSessionRecord.status,
            nextSessionRecord.studentResponseStatus
          ),
          notes: nextSessionRecord.notes ?? undefined,
          preparationInstructions: nextSessionRecord.notes ?? undefined,
          history: buildAppointmentHistory(nextSessionRecord)
        }
      : null;

    const sessionsThisWeek = appointments.filter(
      (appointment) => appointment.startsAt >= weekStart && appointment.startsAt <= addDays(weekStart, 6)
    ).length;

    const completedThisWeek = appointments.filter(
      (appointment) => appointment.status === AppointmentStatus.COMPLETED && appointment.startsAt >= weekStart
    ).length;

    const pendingPayments = payments.filter(
      (payment) =>
        payment.status === PaymentStatus.PENDING ||
        payment.status === PaymentStatus.OVERDUE ||
        (payment.status !== PaymentStatus.PAID && payment.status !== PaymentStatus.CANCELED && payment.dueDate < now)
    );

    const sessionsThisMonth = appointments.filter(
      (appointment) =>
        appointment.status === AppointmentStatus.COMPLETED &&
        appointment.startsAt >= monthStart &&
        appointment.startsAt <= monthEnd
    ).length;

    const sessionsLastFourWeeks = appointments.filter(
      (appointment) =>
        appointment.status === AppointmentStatus.COMPLETED &&
        appointment.startsAt >= subDays(now, 28)
    ).length;

    const frequencyPerWeek = (sessionsLastFourWeeks / 4).toFixed(1).replace(".", ",");
    const latestProgress = progressRecords[0] ?? null;
    const latestPayment = payments.find((payment) => payment.status === PaymentStatus.PAID) ?? payments[0] ?? null;

    return {
      greetingMessage:
        "Seu painel reflete os dados reais lanÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ados pelo seu personal, com agenda, evoluÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o e financeiro organizados no mesmo ambiente.",
      nextSession,
      weeklySummary: [
        {
          id: "scheduled",
          label: "SessÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âµes agendadas",
          value: String(sessionsThisWeek),
          description: "Compromissos previstos para a sua semana atual."
        },
        {
          id: "completed",
          label: "SessÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âµes concluÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­das",
          value: String(completedThisWeek),
          description: "Treinos finalizados recentemente no seu acompanhamento."
        },
        {
          id: "payments",
          label: "Pagamentos pendentes",
          value: String(pendingPayments.length),
          description: "Registros financeiros vinculados ao seu plano atual."
        },
        {
          id: "alerts",
          label: "Avisos importantes",
          value: String(notices.filter((notice) => notice.priority !== "low").length),
          description: "AtualizaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âµes que merecem sua atenÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o hoje."
        }
      ] satisfies StudentDashboardStat[],
      quickActions: [
        {
          id: "full-agenda",
          label: "Ver agenda completa",
          description: "Acesse seus prÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³ximos horÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡rios e o histÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³rico de sessÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âµes.",
          href: "/student/agenda"
        },
        {
          id: "progress",
          label: "Acompanhar evoluÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o",
          description: "Consulte registros recentes e indicadores do seu progresso.",
          href: "/student/progress"
        },
        {
          id: "notices",
          label: "Ver avisos",
          description: "Centralize lembretes, mudanÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§as e atualizaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âµes do acompanhamento.",
          href: "/student/notices"
        },
        {
          id: "profile",
          label: "Acessar perfil",
          description: "Revise seus dados e mantenha seu cadastro atualizado.",
          href: "/student/profile"
        }
      ] satisfies StudentQuickAction[],
      notices: notices.slice(0, 3),
      progressSummary: [
        {
          id: "month-sessions",
          label: "SessÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âµes no mÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âªs",
          value: String(sessionsThisMonth),
          description: "Atendimentos concluÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­dos no ciclo atual."
        },
        {
          id: "attendance",
          label: "FrequÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âªncia recente",
          value: `${frequencyPerWeek}x por semana`,
          description: "MÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©dia das ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âºltimas quatro semanas com base nas sessÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âµes concluÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­das."
        },
        {
          id: "evolution",
          label: "ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ltimo registro",
          value: latestProgress
            ? format(latestProgress.recordedAt, "dd/MM", { locale: ptBR })
            : "Sem registros",
          description: latestProgress
            ? "Seu progresso jÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ tem um histÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³rico real no sistema."
            : "Ainda nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o hÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ registros de evoluÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o lanÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ados."
        }
      ] satisfies StudentDashboardStat[],
      activePlan: context.tenant.saasSubscription?.planName ?? "Plano ativo",
      nextSessionLabel: nextSession
        ? format(nextSession.startsAt, "EEEE, dd 'de' MMMM", { locale: ptBR })
        : null,
      weeklySessions: sessionsThisWeek,
      completedSessions: sessionsThisMonth,
      lastUpdateLabel: latestProgress
        ? format(latestProgress.recordedAt, "dd/MM/yyyy", { locale: ptBR })
        : format(context.updatedAt, "dd/MM/yyyy", { locale: ptBR }),
      upcomingAppointments,
      noticesPreview: notices.slice(0, 2),
      paymentSummary: {
        pendingCount: pendingPayments.length,
        latestPaymentStatus: latestPayment ? latestPayment.status : null,
        latestPaymentDueDate: latestPayment?.dueDate ?? null
      }
    };
  },

  async getAgenda(studentId: string, status?: StudentAppointmentStatus | "Todos") {
    const context = await getStudentContext(studentId);
    const appointments = await getStudentAppointments(studentId);

    const mappedAppointments = appointments.map((appointment) => ({
      id: appointment.id,
      title: appointment.title,
      startsAt: appointment.startsAt,
      endsAt: appointment.endsAt,
      coach: context.tenant.personalName,
      location: buildLocationLabel(context),
      format: buildFormatLabel(),
      status: mapStudentVisibleStatus(appointment.status, appointment.studentResponseStatus),
      notes: appointment.notes ?? undefined,
      preparationInstructions: appointment.notes ?? undefined,
      history: buildAppointmentHistory(appointment)
    }));

    if (!status || status === "Todos") {
      return mappedAppointments;
    }

    return mappedAppointments.filter((appointment) => appointment.status === status);
  },

  getAgendaStatusOptions() {
    return ["Todos", ...studentAgendaStatuses] as const;
  },

  async getHistory(
    studentId: string,
    filters?: {
      period?: StudentHistoryPeriod;
      attendance?: StudentHistoryAttendanceFilter;
    }
  ) {
    const now = new Date();
    const context = await getStudentContext(studentId);
    const appointments = await prisma.appointment.findMany({
      where: {
        studentId,
        OR: [
          { startsAt: { lt: now } },
          { status: AppointmentStatus.COMPLETED },
          { status: AppointmentStatus.CANCELED },
          { status: AppointmentStatus.MISSED }
        ]
      },
      orderBy: {
        startsAt: "desc"
      }
    });

    const items = appointments.map((appointment): StudentHistoryItem => {
      const attendance = mapAttendanceStatus(appointment.status, appointment.studentResponseStatus);

      return {
        id: appointment.id,
        title: appointment.title,
        category: "Sess\u00E3o",
        date: appointment.startsAt,
        startsAt: appointment.startsAt,
        endsAt: appointment.endsAt,
        finalStatus: appointment.status === AppointmentStatus.COMPLETED ? "Conclu\u00EDdo" : "Registrado",
        attendance,
        note: appointment.notes ?? "Sess\u00E3o registrada no hist\u00F3rico do acompanhamento.",
        coach: context.tenant.personalName,
        location: buildLocationLabel(context),
        insights: [
          `Status final registrado: ${mapStudentVisibleStatus(appointment.status, appointment.studentResponseStatus)}.`,
          `Atendimento vinculado ao acompanhamento de ${context.tenant.personalName}.`
        ]
      };
    });

    return items.filter((item) => {
      const periodMatches =
        !filters?.period ||
        filters.period === "all" ||
        (filters.period === "30d" && item.date >= subDays(now, 30)) ||
        (filters.period === "90d" && item.date >= subDays(now, 90));

      const attendanceMatches =
        !filters?.attendance ||
        filters.attendance === "all" ||
        (filters.attendance === "present" && item.attendance !== "Ausente justificado") ||
        (filters.attendance === "absent" && item.attendance === "Ausente justificado");

      return periodMatches && attendanceMatches;
    });
  },

  getHistoryFilterOptions() {
    return {
      period: [
        { value: "all", label: "Todo o histÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³rico" },
        { value: "30d", label: "ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ltimos 30 dias" },
        { value: "90d", label: "ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ltimos 90 dias" }
      ] as const,
      attendance: [
        { value: "all", label: "Todas as presenÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§as" },
        { value: "present", label: "SessÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âµes com presenÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§a" },
        { value: "absent", label: "AusÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âªncias registradas" }
      ] as const
    };
  },

  async getProgressOverview(studentId: string) {
    const now = new Date();
    const context = await getStudentContext(studentId);
    const [records, appointments] = await Promise.all([
      getStudentProgressRecords(studentId),
      prisma.appointment.findMany({
        where: { studentId },
        orderBy: { startsAt: "desc" }
      })
    ]);

    const sessionsThisMonth = appointments.filter(
      (appointment) =>
        appointment.status === AppointmentStatus.COMPLETED &&
        appointment.startsAt >= startOfMonth(now)
    ).length;

    const currentWindow = appointments.filter(
      (appointment) =>
        appointment.status === AppointmentStatus.COMPLETED &&
        appointment.startsAt >= subDays(now, 30)
    ).length;

    const previousWindow = appointments.filter(
      (appointment) =>
        appointment.status === AppointmentStatus.COMPLETED &&
        appointment.startsAt >= subDays(now, 60) &&
        appointment.startsAt < subDays(now, 30)
    ).length;

    const comparison = currentWindow - previousWindow;

    const weeklyBuckets = [3, 2, 1, 0].map((offset) => {
      const from = startOfWeek(subWeeks(now, offset), { weekStartsOn: 1 });
      const to = addDays(from, 6);
      const count = appointments.filter(
        (appointment) =>
          appointment.status === AppointmentStatus.COMPLETED &&
          appointment.startsAt >= from &&
          appointment.startsAt <= to
      ).length;

      return {
        id: `week-${offset}`,
        label: `Sem ${4 - offset}`,
        rawValue: count
      };
    });

    const maxBucket = Math.max(...weeklyBuckets.map((bucket) => bucket.rawValue), 1);

    const trend = weeklyBuckets.map((bucket) => ({
      id: bucket.id,
      label: bucket.label,
      rawValue: bucket.rawValue,
      value: Math.max(18, Math.round((bucket.rawValue / maxBucket) * 100))
    }));

    const latestRecord = records[0] ?? null;
    const previousRecord = records[1] ?? null;
    const notes = latestRecord
      ? [latestRecord.notes ?? "HÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ um registro recente de evoluÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o disponÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­vel no seu acompanhamento."]
      : ["Seu personal ainda nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o lanÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ou registros de evoluÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o neste perfil."];

    if (previousRecord && latestRecord?.weight && previousRecord.weight) {
      notes.push(
        `Comparativo recente de peso: ${Number(latestRecord.weight).toFixed(1).replace(".", ",")} kg agora contra ${Number(previousRecord.weight).toFixed(1).replace(".", ",")} kg no registro anterior.`
      );
    }

    return {
      metrics: [
        {
          id: "sessions-month",
          label: "SessÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âµes realizadas no mÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âªs",
          value: String(sessionsThisMonth),
          description: "Treinos concluÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­dos no mÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âªs atual com base na agenda real."
        },
        {
          id: "weekly-frequency",
          label: "FrequÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âªncia semanal",
          value: `${(currentWindow / 4).toFixed(1).replace(".", ",")}x por semana`,
          description: "MÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©dia das ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âºltimas quatro semanas com base nas sessÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âµes concluÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­das."
        },
        {
          id: "comparison",
          label: "Comparativo simples do perÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­odo",
          value:
            comparison === 0
              ? "EstÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡vel"
              : `${comparison > 0 ? "+" : ""}${comparison} sessÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o${Math.abs(comparison) === 1 ? "" : "ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âµes"}`,
          description: "ComparaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o entre os ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âºltimos 30 dias e o perÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­odo imediatamente anterior."
        }
      ] satisfies StudentProgressMetric[],
      trend,
      highlights: [
        `Registros reais do acompanhamento de ${context.tenant.personalName}.`,
        latestRecord
          ? `ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ltima atualizaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o registrada em ${format(latestRecord.recordedAt, "dd/MM/yyyy", { locale: ptBR })}.`
          : "Ainda nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o existem registros de evoluÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o lanÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ados."
      ],
      notes,
      records: records.map((record) => ({
        id: record.id,
        recordedAt: record.recordedAt,
        title:
          record.weight && record.bodyFat
            ? "Peso e composiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o"
            : record.weight
              ? "Peso corporal"
              : record.bodyFat
                ? "Percentual de gordura"
                : "Registro de evoluÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â§ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o",
        value:
          record.weight && record.bodyFat
            ? `${Number(record.weight).toFixed(1).replace(".", ",")} kg ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ ${Number(record.bodyFat).toFixed(1).replace(".", ",")}%`
            : record.weight
              ? `${Number(record.weight).toFixed(1).replace(".", ",")} kg`
              : record.bodyFat
                ? `${Number(record.bodyFat).toFixed(1).replace(".", ",")}%`
                : format(record.recordedAt, "dd/MM/yyyy", { locale: ptBR }),
        note: record.notes ?? "Registro salvo no histÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³rico do acompanhamento."
      }))
    };
  },

  async getNotices(studentId: string, filter: StudentNoticeFilter = "all") {
    return StudentNoticeService.listByStudent(studentId, filter);
  },

  getNoticeFilterOptions() {
    return [
      { value: "all", label: "Todos os avisos" },
      { value: "unread", label: "NÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o lidos" },
      { value: "high-priority", label: "Prioridade alta" }
    ] as const;
  },

  async getProfile(studentId: string) {
    const context = await getStudentContext(studentId);
    const nextAppointment = await prisma.appointment.findFirst({
      where: {
        studentId,
        startsAt: {
          gte: new Date()
        },
        status: AppointmentStatus.SCHEDULED
      },
      orderBy: {
        startsAt: "asc"
      }
    });

    return {
      editableProfile: {
        name: context.name,
        email: context.user?.email ?? context.email ?? "",
        phone: context.phone ?? "",
        birthDate: context.birthDate ? context.birthDate.toISOString().slice(0, 10) : "",
        goal: context.goal ?? "",
        notes: context.notes ?? ""
      },
      accountSummary: {
        memberSince: format(context.createdAt, "dd/MM/yyyy", { locale: ptBR }),
        accountStatus: context.status === StudentStatus.ACTIVE ? "Conta ativa" : "Conta com acesso limitado",
        coach: context.tenant.personalName,
        plan: context.tenant.saasSubscription?.planName ?? "Plano ativo",
        nextCheckIn: nextAppointment
          ? format(nextAppointment.startsAt, "dd/MM/yyyy", { locale: ptBR })
          : "Sem sessÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â£o futura"
      }
    };
  },

  async updateProfile(studentId: string, input: UpdateStudentProfileInput) {
    const parsed = UpdateStudentProfileSchema.parse(input);
    const context = await getStudentContext(studentId);

    await prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id: context.id },
        data: {
          name: parsed.name,
          phone: parsed.phone || null,
          birthDate: parsed.birthDate ? new Date(`${parsed.birthDate}T00:00:00`) : null,
          goal: parsed.goal || null,
          notes: parsed.notes || null
        }
      });

      if (context.user) {
        await tx.user.update({
          where: { id: context.user.id },
          data: {
            name: parsed.name
          }
        });
      }
    });
  },

  async changePassword(studentId: string, input: ChangeStudentPasswordInput) {
    const parsed = ChangeStudentPasswordSchema.parse(input);
    const context = await getStudentContext(studentId);

    if (!context.user) {
      throw new StudentProfileError("Este aluno nÃƒÆ’Ã‚Â£o possui um usuÃƒÆ’Ã‚Â¡rio de acesso vinculado.");
    }

    const userCredentials = await prisma.user.findUnique({
      where: { id: context.user.id },
      select: {
        passwordHash: true
      }
    });

    if (!userCredentials) {
      throw new StudentProfileError("Usu\u00E1rio de acesso do aluno n\u00E3o encontrado.");
    }

    const passwordMatches = await PasswordService.compare(parsed.currentPassword, userCredentials.passwordHash);
    if (!passwordMatches) {
      throw new StudentProfileError("A senha atual informada estÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ incorreta.");
    }

    const newPasswordHash = await PasswordService.hash(parsed.newPassword);

    await prisma.user.update({
      where: { id: context.user.id },
      data: {
        passwordHash: newPasswordHash
      }
    });
  }
};
