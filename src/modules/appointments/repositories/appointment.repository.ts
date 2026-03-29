import type {
  AppointmentStatus,
  Prisma,
  PrismaClient,
  StudentAppointmentResponseStatus
} from "@prisma/client";
import { prisma } from "@/lib/db";

type DbClient = PrismaClient | Prisma.TransactionClient;

export const AppointmentRepository = {
  async findManyByTenant(
    tenantId: string,
    filters?: {
      status?: AppointmentStatus;
    }
  ) {
    return prisma.appointment.findMany({
      where: {
        tenantId,
        ...(filters?.status ? { status: filters.status } : {})
      },
      include: {
        student: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [{ startsAt: "asc" }, { createdAt: "desc" }]
    });
  },

  async findByIdAndTenant(id: string, tenantId: string) {
    return prisma.appointment.findFirst({
      where: {
        id,
        tenantId
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            tenantId: true
          }
        }
      }
    });
  },

  async findByIdAndStudent(id: string, studentId: string) {
    return prisma.appointment.findFirst({
      where: {
        id,
        studentId
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            tenantId: true
          }
        }
      }
    });
  },

  async findOverlappingByTenant(
    tenantId: string,
    startsAt: Date,
    endsAt: Date,
    excludeId?: string
  ) {
    return prisma.appointment.findFirst({
      where: {
        tenantId,
        status: {
          not: "CANCELED"
        },
        ...(excludeId
          ? {
              id: {
                not: excludeId
              }
            }
          : {}),
        startsAt: {
          lt: endsAt
        },
        endsAt: {
          gt: startsAt
        }
      },
      include: {
        student: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        startsAt: "asc"
      }
    });
  },

  async create(
    data: {
      tenantId: string;
      studentId: string;
      title: string;
      startsAt: Date;
      endsAt: Date;
      status: Prisma.AppointmentCreateInput["status"];
      notes?: string;
    },
    db: DbClient = prisma
  ) {
    return db.appointment.create({
      data
    });
  },

  async updateByIdAndTenant(
    id: string,
    tenantId: string,
    data: {
      studentId: string;
      title: string;
      startsAt: Date;
      endsAt: Date;
      status: Prisma.AppointmentUpdateInput["status"];
      notes?: string | null;
      studentResponseStatus?: StudentAppointmentResponseStatus;
      studentRespondedAt?: Date | null;
      studentResponseNote?: string | null;
    }
  ) {
    return prisma.appointment.updateMany({
      where: {
        id,
        tenantId
      },
      data
    });
  },

  async updateStudentResponseByIdAndStudent(
    id: string,
    studentId: string,
    data: {
      studentResponseStatus: StudentAppointmentResponseStatus;
      studentRespondedAt: Date;
      studentResponseNote?: string | null;
    }
  ) {
    return prisma.appointment.updateMany({
      where: {
        id,
        studentId
      },
      data
    });
  }
};