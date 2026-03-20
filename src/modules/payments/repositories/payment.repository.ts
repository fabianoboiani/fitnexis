import type { Prisma, PrismaClient } from "@prisma/client";
import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

type DbClient = PrismaClient | Prisma.TransactionClient;

export const PaymentRepository = {
  async findManyByTenant(
    tenantId: string,
    filters?: {
      status?: PaymentStatus | "OVERDUE";
      studentId?: string;
    }
  ) {
    const now = new Date();

    return prisma.payment.findMany({
      where: {
        tenantId,
        ...(filters?.studentId ? { studentId: filters.studentId } : {}),
        ...(filters?.status
          ? filters.status === "OVERDUE"
            ? {
                dueDate: {
                  lt: now
                },
                status: {
                  in: [PaymentStatus.PENDING, PaymentStatus.OVERDUE]
                }
              }
            : {
                status: filters.status
              }
          : {})
      },
      include: {
        student: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }]
    });
  },

  async findByIdAndTenant(id: string, tenantId: string) {
    return prisma.payment.findFirst({
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

  async create(
    data: {
      tenantId: string;
      studentId: string;
      amount: Prisma.PaymentCreateInput["amount"];
      dueDate: Date;
      paidAt?: Date;
      status: Prisma.PaymentCreateInput["status"];
      paymentMethod?: Prisma.PaymentCreateInput["paymentMethod"];
      notes?: string;
    },
    db: DbClient = prisma
  ) {
    return db.payment.create({
      data
    });
  },

  async updateByIdAndTenant(
    id: string,
    tenantId: string,
    data: {
      studentId: string;
      amount: Prisma.PaymentUpdateInput["amount"];
      dueDate: Date;
      paidAt?: Date | null;
      status: Prisma.PaymentUpdateInput["status"];
      paymentMethod?: Prisma.PaymentUpdateInput["paymentMethod"] | null;
      notes?: string | null;
    }
  ) {
    return prisma.payment.updateMany({
      where: {
        id,
        tenantId
      },
      data
    });
  }
};
