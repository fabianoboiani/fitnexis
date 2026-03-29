import bcrypt from "bcrypt";
import {
  AppointmentStatus,
  PaymentMethod,
  PaymentStatus,
  PrismaClient,
  StudentAppointmentResponseStatus,
  StudentNoticeCategory,
  StudentNoticeEntityType,
  StudentNoticeKind,
  StudentNoticePriority,
  StudentStatus,
  SubscriptionStatus,
  UserRole
} from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const prisma = new PrismaClient();

type StudentSeed = {
  id: string;
  name: string;
  email: string;
  phone: string;
  goal: string;
  notes: string;
  status: StudentStatus;
  birthDate: Date;
};

type PaymentSeed = {
  id: string;
  studentId: string;
  amount: string;
  dueDate: Date;
  paidAt: Date | null;
  status: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  notes: string;
};

type AppointmentSeed = {
  id: string;
  studentId: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  status: AppointmentStatus;
  studentResponseStatus: StudentAppointmentResponseStatus;
  studentRespondedAt: Date | null;
  studentResponseNote: string | null;
  notes: string;
};

type ProgressSeed = {
  id: string;
  studentId: string;
  recordedAt: Date;
  weight: string;
  bodyFat: string;
  notes: string;
};

function buildAppointmentNoticeSeed(appointment: AppointmentSeed, tenantId: string, personalName: string) {
  const externalKey = `appointment:${appointment.id}`;

  if (appointment.status === AppointmentStatus.COMPLETED || appointment.status === AppointmentStatus.MISSED) {
    return null;
  }

  const sessionDateLabel = format(appointment.startsAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  let kind: StudentNoticeKind = StudentNoticeKind.INFO;
  let category: StudentNoticeCategory = StudentNoticeCategory.CONFIRMATION_REQUIRED;
  let priority: StudentNoticePriority = StudentNoticePriority.MEDIUM;
  let title = "Confirmação pendente da sessão";
  let description = `Seu atendimento com ${personalName} está previsto para ${sessionDateLabel}.`;
  let details = appointment.notes || "Revise os detalhes da sessão na agenda e confirme sua presença quando fizer sentido.";
  let createdAt = appointment.studentRespondedAt ?? appointment.startsAt;

  if (appointment.status === AppointmentStatus.CANCELED) {
    kind = StudentNoticeKind.WARNING;
    category = StudentNoticeCategory.SCHEDULE_CHANGE;
    priority = StudentNoticePriority.HIGH;
    title = "Sessão alterada ou cancelada";
    description = `Houve uma alteração no compromisso previsto para ${sessionDateLabel}.`;
    details = appointment.notes || "Consulte a agenda para verificar o novo contexto desta sessão.";
  } else if (appointment.studentResponseStatus === StudentAppointmentResponseStatus.CONFIRMED) {
    kind = StudentNoticeKind.SUCCESS;
    category = StudentNoticeCategory.SESSION_REMINDER;
    title = "Sessão confirmada na agenda";
    description = `Sua presença foi confirmada para a sessão de ${sessionDateLabel}.`;
    details = appointment.studentResponseNote || appointment.notes || "Seu personal já consegue visualizar essa confirmação no painel.";
    createdAt = appointment.studentRespondedAt ?? appointment.startsAt;
  } else if (appointment.studentResponseStatus === StudentAppointmentResponseStatus.RESCHEDULE_REQUESTED) {
    kind = StudentNoticeKind.WARNING;
    category = StudentNoticeCategory.PENDING_REQUEST;
    priority = StudentNoticePriority.HIGH;
    title = "Solicitação de reagendamento enviada";
    description = `Seu pedido de reagendamento para a sessão de ${sessionDateLabel} está pendente de análise.`;
    details = appointment.studentResponseNote || "O personal foi notificado e poderá ajustar a agenda a partir da sua solicitação.";
    createdAt = appointment.studentRespondedAt ?? appointment.startsAt;
  } else if (appointment.studentResponseStatus === StudentAppointmentResponseStatus.CANCELED) {
    kind = StudentNoticeKind.WARNING;
    category = StudentNoticeCategory.PENDING_REQUEST;
    priority = StudentNoticePriority.HIGH;
    title = "Solicitação de cancelamento enviada";
    description = `Seu pedido de cancelamento da sessão de ${sessionDateLabel} foi registrado.`;
    details = appointment.studentResponseNote || "O personal consegue visualizar esse pedido e decidir os próximos passos.";
    createdAt = appointment.studentRespondedAt ?? appointment.startsAt;
  }

  return {
    externalKey,
    tenantId,
    studentId: appointment.studentId,
    kind,
    category,
    title,
    description,
    details,
    priority,
    relatedEntityType: StudentNoticeEntityType.APPOINTMENT,
    relatedEntityId: appointment.id,
    createdAt
  };
}

function buildPaymentNoticeSeed(payment: PaymentSeed, tenantId: string, personalName: string) {
  const externalKey = `payment:${payment.id}`;

  if (payment.status === PaymentStatus.CANCELED) {
    return null;
  }

  if (payment.status === PaymentStatus.PAID) {
    return {
      externalKey,
      tenantId,
      studentId: payment.studentId,
      kind: StudentNoticeKind.SUCCESS,
      category: StudentNoticeCategory.PAYMENT_ALERT,
      title: "Pagamento confirmado",
      description: `O pagamento com vencimento em ${format(payment.dueDate, "dd/MM/yyyy", { locale: ptBR })} foi confirmado no sistema.`,
      details: payment.notes || `Seu personal ${personalName} já registrou esse pagamento como concluído.`,
      priority: StudentNoticePriority.LOW,
      relatedEntityType: StudentNoticeEntityType.PAYMENT,
      relatedEntityId: payment.id,
      createdAt: payment.paidAt ?? payment.dueDate
    };
  }

  const isOverdue = payment.status === PaymentStatus.OVERDUE;

  return {
    externalKey,
    tenantId,
    studentId: payment.studentId,
    kind: isOverdue ? StudentNoticeKind.WARNING : StudentNoticeKind.INFO,
    category: StudentNoticeCategory.PAYMENT_ALERT,
    title: isOverdue ? "Pagamento em aberto" : "Pagamento pendente registrado",
    description: `Existe um registro financeiro com vencimento em ${format(payment.dueDate, "dd/MM/yyyy", { locale: ptBR })}.`,
    details: payment.notes || (isOverdue
      ? `Acompanhe essa pendência com ${personalName} para manter seu plano organizado.`
      : "O pagamento já está registrado no sistema e pode ser acompanhado junto ao seu personal."),
    priority: isOverdue ? StudentNoticePriority.HIGH : StudentNoticePriority.MEDIUM,
    relatedEntityType: StudentNoticeEntityType.PAYMENT,
    relatedEntityId: payment.id,
    createdAt: payment.dueDate
  };
}

function buildProgressNoticeSeed(progress: ProgressSeed, tenantId: string, personalName: string) {
  return {
    externalKey: `progress:${progress.id}`,
    tenantId,
    studentId: progress.studentId,
    kind: StudentNoticeKind.SUCCESS,
    category: StudentNoticeCategory.PROGRESS_UPDATE,
    title: "Novo registro de evolução disponível",
    description: `Seu acompanhamento recebeu uma atualização em ${format(progress.recordedAt, "dd/MM/yyyy", { locale: ptBR })}.`,
    details: progress.notes || `Há um novo registro lançado por ${personalName} para você acompanhar no painel.`,
    priority: StudentNoticePriority.MEDIUM,
    relatedEntityType: StudentNoticeEntityType.PROGRESS_RECORD,
    relatedEntityId: progress.id,
    createdAt: progress.recordedAt
  };
}

async function main() {
  const defaultPasswordHash = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@fitnexis.local" },
    update: {
      name: "Admin Plataforma",
      passwordHash: defaultPasswordHash,
      role: UserRole.ADMIN
    },
    create: {
      name: "Admin Plataforma",
      email: "admin@fitnexis.local",
      passwordHash: defaultPasswordHash,
      role: UserRole.ADMIN
    }
  });

  const personal = await prisma.user.upsert({
    where: { email: "personal@fitnexis.local" },
    update: {
      name: "Fabio Trainer",
      passwordHash: defaultPasswordHash,
      role: UserRole.PERSONAL
    },
    create: {
      name: "Fabio Trainer",
      email: "personal@fitnexis.local",
      passwordHash: defaultPasswordHash,
      role: UserRole.PERSONAL
    }
  });

  const studentPortalUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: "aluno@fitnexis.local" },
      update: {
        name: "Marina Costa",
        passwordHash: defaultPasswordHash,
        role: UserRole.STUDENT
      },
      create: {
        name: "Marina Costa",
        email: "aluno@fitnexis.local",
        passwordHash: defaultPasswordHash,
        role: UserRole.STUDENT
      }
    }),
    prisma.user.upsert({
      where: { email: "lucas.aluno@fitnexis.local" },
      update: {
        name: "Lucas Andrade",
        passwordHash: defaultPasswordHash,
        role: UserRole.STUDENT
      },
      create: {
        name: "Lucas Andrade",
        email: "lucas.aluno@fitnexis.local",
        passwordHash: defaultPasswordHash,
        role: UserRole.STUDENT
      }
    })
  ]);

  const studentUserBySeedId = new Map<string, string>([
    ["seed-student-fitnexis-01", studentPortalUsers[0].id],
    ["seed-student-fitnexis-02", studentPortalUsers[1].id]
  ]);

  const tenant = await prisma.tenant.upsert({
    where: { ownerUserId: personal.id },
    update: {
      businessName: "Fitnexis Performance",
      personalName: "Fabio Trainer",
      phone: "+55 11 99999-9999",
      email: "personal@fitnexis.local",
      isActive: true
    },
    create: {
      ownerUserId: personal.id,
      businessName: "Fitnexis Performance",
      personalName: "Fabio Trainer",
      phone: "+55 11 99999-9999",
      email: "personal@fitnexis.local",
      isActive: true
    }
  });

  await prisma.saaSSubscription.upsert({
    where: { tenantId: tenant.id },
    update: {
      planName: "Plano Professional",
      status: SubscriptionStatus.TRIAL,
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      stripeCustomerId: "cus_fitnexis_demo",
      stripeSubscriptionId: "sub_fitnexis_demo"
    },
    create: {
      tenantId: tenant.id,
      planName: "Plano Professional",
      status: SubscriptionStatus.TRIAL,
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      stripeCustomerId: "cus_fitnexis_demo",
      stripeSubscriptionId: "sub_fitnexis_demo"
    }
  });

  const studentsData: readonly StudentSeed[] = [
    {
      id: "seed-student-fitnexis-01",
      name: "Marina Costa",
      email: "marina@fitnexis.local",
      phone: "+55 11 98888-1001",
      goal: "Hipertrofia",
      notes: "Treina 4x por semana e utiliza o portal do aluno.",
      status: StudentStatus.ACTIVE,
      birthDate: new Date("1993-05-12")
    },
    {
      id: "seed-student-fitnexis-02",
      name: "Lucas Andrade",
      email: "lucas@fitnexis.local",
      phone: "+55 11 98888-1002",
      goal: "Emagrecimento",
      notes: "Prefere treinos funcionais e já acompanha a agenda pelo portal.",
      status: StudentStatus.ACTIVE,
      birthDate: new Date("1989-09-02")
    },
    {
      id: "seed-student-fitnexis-03",
      name: "Camila Ribeiro",
      email: "camila@fitnexis.local",
      phone: "+55 11 98888-1003",
      goal: "Condicionamento",
      notes: "Retornando após pausa de 3 meses.",
      status: StudentStatus.ACTIVE,
      birthDate: new Date("1998-01-26")
    },
    {
      id: "seed-student-fitnexis-04",
      name: "Rafael Souza",
      email: "rafael@fitnexis.local",
      phone: "+55 11 98888-1004",
      goal: "Fortalecimento",
      notes: "Acompanhamento pós-lesão.",
      status: StudentStatus.PAUSED,
      birthDate: new Date("1985-07-19")
    },
    {
      id: "seed-student-fitnexis-05",
      name: "Fernanda Lima",
      email: "fernanda@fitnexis.local",
      phone: "+55 11 98888-1005",
      goal: "Definição",
      notes: "Mensalidade em atraso.",
      status: StudentStatus.DELINQUENT,
      birthDate: new Date("1991-11-08")
    }
  ];

  const students: Array<{ id: string; name: string }> = [];

  for (const studentData of studentsData) {
    const linkedUserId = studentUserBySeedId.get(studentData.id) ?? null;

    const student = await prisma.student.upsert({
      where: { id: studentData.id },
      update: {
        tenantId: tenant.id,
        userId: linkedUserId,
        portalAccessEnabled: linkedUserId !== null,
        name: studentData.name,
        email: studentData.email,
        phone: studentData.phone,
        goal: studentData.goal,
        notes: studentData.notes,
        status: studentData.status,
        birthDate: studentData.birthDate
      },
      create: {
        id: studentData.id,
        tenantId: tenant.id,
        userId: linkedUserId,
        portalAccessEnabled: linkedUserId !== null,
        name: studentData.name,
        email: studentData.email,
        phone: studentData.phone,
        goal: studentData.goal,
        notes: studentData.notes,
        status: studentData.status,
        birthDate: studentData.birthDate
      }
    });

    students.push({ id: student.id, name: student.name });
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const paymentSeeds: readonly PaymentSeed[] = [
    {
      id: "seed-payment-01",
      studentId: students[0].id,
      amount: "220.00",
      dueDate: new Date(currentYear, currentMonth, 5),
      paidAt: new Date(currentYear, currentMonth, 5, 10, 15),
      status: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.PIX,
      notes: "Plano mensal premium"
    },
    {
      id: "seed-payment-02",
      studentId: students[1].id,
      amount: "180.00",
      dueDate: new Date(currentYear, currentMonth, 8),
      paidAt: new Date(currentYear, currentMonth, 9, 8, 30),
      status: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.CARD,
      notes: "Mensalidade recorrente"
    },
    {
      id: "seed-payment-03",
      studentId: students[2].id,
      amount: "200.00",
      dueDate: new Date(currentYear, currentMonth, 18),
      paidAt: null,
      status: PaymentStatus.PENDING,
      paymentMethod: null,
      notes: "Aguardando confirmação"
    },
    {
      id: "seed-payment-04",
      studentId: students[4].id,
      amount: "160.00",
      dueDate: new Date(currentYear, currentMonth, 10),
      paidAt: null,
      status: PaymentStatus.OVERDUE,
      paymentMethod: null,
      notes: "Mensalidade em atraso"
    },
    {
      id: "seed-payment-05",
      studentId: students[0].id,
      amount: "220.00",
      dueDate: new Date(currentYear, currentMonth, 28),
      paidAt: null,
      status: PaymentStatus.PENDING,
      paymentMethod: null,
      notes: "Próxima mensalidade"
    },
    {
      id: "seed-payment-06",
      studentId: students[1].id,
      amount: "180.00",
      dueDate: new Date(currentYear, currentMonth, 27),
      paidAt: null,
      status: PaymentStatus.PENDING,
      paymentMethod: null,
      notes: "Mensalidade aberta no portal"
    }
  ];

  for (const paymentSeed of paymentSeeds) {
    await prisma.payment.upsert({
      where: { id: paymentSeed.id },
      update: {
        tenantId: tenant.id,
        studentId: paymentSeed.studentId,
        amount: paymentSeed.amount,
        dueDate: paymentSeed.dueDate,
        paidAt: paymentSeed.paidAt,
        status: paymentSeed.status,
        paymentMethod: paymentSeed.paymentMethod,
        notes: paymentSeed.notes
      },
      create: {
        id: paymentSeed.id,
        tenantId: tenant.id,
        studentId: paymentSeed.studentId,
        amount: paymentSeed.amount,
        dueDate: paymentSeed.dueDate,
        paidAt: paymentSeed.paidAt,
        status: paymentSeed.status,
        paymentMethod: paymentSeed.paymentMethod,
        notes: paymentSeed.notes
      }
    });
  }

  const appointmentSeeds: readonly AppointmentSeed[] = [
    {
      id: "seed-appointment-01",
      studentId: students[0].id,
      title: "Treino de inferiores",
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 7, 0),
      endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 0),
      status: AppointmentStatus.SCHEDULED,
      studentResponseStatus: StudentAppointmentResponseStatus.CONFIRMED,
      studentRespondedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0),
      studentResponseNote: "Presença confirmada pelo aluno.",
      notes: "Foco em força"
    },
    {
      id: "seed-appointment-02",
      studentId: students[1].id,
      title: "Sessão funcional",
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 18, 30),
      endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 19, 30),
      status: AppointmentStatus.SCHEDULED,
      studentResponseStatus: StudentAppointmentResponseStatus.RESCHEDULE_REQUESTED,
      studentRespondedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 15),
      studentResponseNote: "Aluno pediu reagendamento para o fim da tarde.",
      notes: "Circuito metabólico"
    },
    {
      id: "seed-appointment-03",
      studentId: students[2].id,
      title: "Avaliação física",
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 9, 0),
      endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 10, 0),
      status: AppointmentStatus.SCHEDULED,
      studentResponseStatus: StudentAppointmentResponseStatus.PENDING,
      studentRespondedAt: null,
      studentResponseNote: null,
      notes: "Atualizar medidas"
    },
    {
      id: "seed-appointment-04",
      studentId: students[0].id,
      title: "Treino de superiores",
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 7, 0),
      endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 8, 0),
      status: AppointmentStatus.COMPLETED,
      studentResponseStatus: StudentAppointmentResponseStatus.CONFIRMED,
      studentRespondedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 18, 30),
      studentResponseNote: "Sessão confirmada previamente.",
      notes: "Sessão concluída"
    },
    {
      id: "seed-appointment-05",
      studentId: students[1].id,
      title: "Mobilidade e core",
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 6, 30),
      endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 7, 30),
      status: AppointmentStatus.SCHEDULED,
      studentResponseStatus: StudentAppointmentResponseStatus.PENDING,
      studentRespondedAt: null,
      studentResponseNote: null,
      notes: "Treino leve para recuperar a semana"
    }
  ];

  for (const appointmentSeed of appointmentSeeds) {
    await prisma.appointment.upsert({
      where: { id: appointmentSeed.id },
      update: {
        tenantId: tenant.id,
        studentId: appointmentSeed.studentId,
        title: appointmentSeed.title,
        startsAt: appointmentSeed.startsAt,
        endsAt: appointmentSeed.endsAt,
        status: appointmentSeed.status,
        studentResponseStatus: appointmentSeed.studentResponseStatus,
        studentRespondedAt: appointmentSeed.studentRespondedAt,
        studentResponseNote: appointmentSeed.studentResponseNote,
        notes: appointmentSeed.notes
      },
      create: {
        id: appointmentSeed.id,
        tenantId: tenant.id,
        studentId: appointmentSeed.studentId,
        title: appointmentSeed.title,
        startsAt: appointmentSeed.startsAt,
        endsAt: appointmentSeed.endsAt,
        status: appointmentSeed.status,
        studentResponseStatus: appointmentSeed.studentResponseStatus,
        studentRespondedAt: appointmentSeed.studentRespondedAt,
        studentResponseNote: appointmentSeed.studentResponseNote,
        notes: appointmentSeed.notes
      }
    });
  }

  const progressSeeds: readonly ProgressSeed[] = [
    {
      id: "seed-progress-01",
      studentId: students[0].id,
      recordedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10),
      weight: "64.20",
      bodyFat: "21.50",
      notes: "Boa evolução nas cargas"
    },
    {
      id: "seed-progress-02",
      studentId: students[1].id,
      recordedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
      weight: "82.40",
      bodyFat: "24.10",
      notes: "Reduziu circunferência abdominal"
    },
    {
      id: "seed-progress-03",
      studentId: students[2].id,
      recordedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
      weight: "58.90",
      bodyFat: "19.30",
      notes: "Retomando rotina"
    },
    {
      id: "seed-progress-04",
      studentId: students[0].id,
      recordedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
      weight: "63.80",
      bodyFat: "20.90",
      notes: "Melhora de ritmo e constância nas sessões"
    }
  ];

  for (const progressSeed of progressSeeds) {
    await prisma.progressRecord.upsert({
      where: { id: progressSeed.id },
      update: {
        tenantId: tenant.id,
        studentId: progressSeed.studentId,
        recordedAt: progressSeed.recordedAt,
        weight: progressSeed.weight,
        bodyFat: progressSeed.bodyFat,
        notes: progressSeed.notes
      },
      create: {
        id: progressSeed.id,
        tenantId: tenant.id,
        studentId: progressSeed.studentId,
        recordedAt: progressSeed.recordedAt,
        weight: progressSeed.weight,
        bodyFat: progressSeed.bodyFat,
        notes: progressSeed.notes
      }
    });
  }

  const noticeSeeds = [
    ...appointmentSeeds
      .map((appointment) => buildAppointmentNoticeSeed(appointment, tenant.id, tenant.personalName))
      .filter((notice) => notice !== null),
    ...paymentSeeds
      .map((payment) => buildPaymentNoticeSeed(payment, tenant.id, tenant.personalName))
      .filter((notice) => notice !== null),
    ...progressSeeds.map((progress) => buildProgressNoticeSeed(progress, tenant.id, tenant.personalName))
  ];

  await prisma.studentNotice.deleteMany({
    where: {
      tenantId: tenant.id
    }
  });

  await prisma.studentNotice.createMany({
    data: noticeSeeds,
    skipDuplicates: true
  });

  console.info("Seed finalizado com sucesso.");
  console.info(`Admin: ${admin.email}`);
  console.info(`Personal: ${personal.email}`);
  console.info(`Aluno 1: ${studentPortalUsers[0].email}`);
  console.info(`Aluno 2: ${studentPortalUsers[1].email}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });