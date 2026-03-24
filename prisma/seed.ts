import bcrypt from "bcrypt";
import {
  AppointmentStatus,
  PaymentMethod,
  PaymentStatus,
  PrismaClient,
  StudentStatus,
  SubscriptionStatus,
  UserRole
} from "@prisma/client";

const prisma = new PrismaClient();

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


  const studentUser = await prisma.user.upsert({
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
      planName: "Trial",
      status: SubscriptionStatus.TRIAL
    },
    create: {
      tenantId: tenant.id,
      planName: "Trial",
      status: SubscriptionStatus.TRIAL
    }
  });

  const studentsData = [
    {
      id: "seed-student-fitnexis-01",
      name: "Marina Costa",
      email: "marina@fitnexis.local",
      phone: "+55 11 98888-1001",
      goal: "Hipertrofia",
      notes: "Treina 4x por semana.",
      status: StudentStatus.ACTIVE,
      birthDate: new Date("1993-05-12")
    },
    {
      id: "seed-student-fitnexis-02",
      name: "Lucas Andrade",
      email: "lucas@fitnexis.local",
      phone: "+55 11 98888-1002",
      goal: "Emagrecimento",
      notes: "Prefere treinos funcionais.",
      status: StudentStatus.ACTIVE,
      birthDate: new Date("1989-09-02")
    },
    {
      id: "seed-student-fitnexis-03",
      name: "Camila Ribeiro",
      email: "camila@fitnexis.local",
      phone: "+55 11 98888-1003",
      goal: "Condicionamento",
      notes: "Retornando apos pausa de 3 meses.",
      status: StudentStatus.ACTIVE,
      birthDate: new Date("1998-01-26")
    },
    {
      id: "seed-student-fitnexis-04",
      name: "Rafael Souza",
      email: "rafael@fitnexis.local",
      phone: "+55 11 98888-1004",
      goal: "Fortalecimento",
      notes: "Acompanhamento pos-lesao.",
      status: StudentStatus.PAUSED,
      birthDate: new Date("1985-07-19")
    },
    {
      id: "seed-student-fitnexis-05",
      name: "Fernanda Lima",
      email: "fernanda@fitnexis.local",
      phone: "+55 11 98888-1005",
      goal: "Definicao",
      notes: "Mensalidade em atraso.",
      status: StudentStatus.DELINQUENT,
      birthDate: new Date("1991-11-08")
    }
  ] as const;

  const students: Array<{ id: string }> = [];

  for (const studentData of studentsData) {
    const student = await prisma.student.upsert({
      where: { id: studentData.id },
      update: {
        tenantId: tenant.id,
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
        name: studentData.name,
        email: studentData.email,
        phone: studentData.phone,
        goal: studentData.goal,
        notes: studentData.notes,
        status: studentData.status,
        birthDate: studentData.birthDate
      }
    });

    students.push(student);
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const paymentSeeds = [
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
      notes: "Aguardando confirmacao"
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
      notes: "Proxima mensalidade"
    }
  ] as const;

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

  const appointmentSeeds = [
    {
      id: "seed-appointment-01",
      studentId: students[0].id,
      title: "Treino de inferiores",
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 7, 0),
      endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 0),
      status: AppointmentStatus.SCHEDULED,
      notes: "Foco em forca"
    },
    {
      id: "seed-appointment-02",
      studentId: students[1].id,
      title: "Sessao funcional",
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 18, 30),
      endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 19, 30),
      status: AppointmentStatus.SCHEDULED,
      notes: "Circuito metabolico"
    },
    {
      id: "seed-appointment-03",
      studentId: students[2].id,
      title: "Avaliacao fisica",
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 9, 0),
      endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 10, 0),
      status: AppointmentStatus.SCHEDULED,
      notes: "Atualizar medidas"
    },
    {
      id: "seed-appointment-04",
      studentId: students[0].id,
      title: "Treino de superiores",
      startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 7, 0),
      endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 8, 0),
      status: AppointmentStatus.COMPLETED,
      notes: "Sessao concluida"
    }
  ] as const;

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
        notes: appointmentSeed.notes
      }
    });
  }

  const progressSeeds = [
    {
      id: "seed-progress-01",
      studentId: students[0].id,
      recordedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10),
      weight: "64.20",
      bodyFat: "21.50",
      notes: "Boa evolucao nas cargas"
    },
    {
      id: "seed-progress-02",
      studentId: students[1].id,
      recordedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
      weight: "82.40",
      bodyFat: "24.10",
      notes: "Reduziu circunferencia abdominal"
    },
    {
      id: "seed-progress-03",
      studentId: students[2].id,
      recordedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
      weight: "58.90",
      bodyFat: "19.30",
      notes: "Retomando rotina"
    }
  ] as const;

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

  console.info("Seed finalizado com sucesso.");
  console.info(`Admin: ${admin.email}`);
  console.info(`Personal: ${personal.email}`);
  console.info(`Aluno: ${studentUser.email}`);
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
