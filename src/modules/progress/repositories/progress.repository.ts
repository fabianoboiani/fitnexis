import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";

type DbClient = PrismaClient | Prisma.TransactionClient;

export const ProgressRepository = {
  async findManyByTenant(tenantId: string, studentId?: string) {
    return prisma.progressRecord.findMany({
      where: {
        tenantId,
        ...(studentId ? { studentId } : {})
      },
      include: {
        student: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { recordedAt: "desc" }
    });
  },

  async create(
    data: {
      tenantId: string;
      studentId: string;
      recordedAt: Date;
      weight?: Prisma.ProgressRecordCreateInput["weight"];
      bodyFat?: Prisma.ProgressRecordCreateInput["bodyFat"];
      notes?: string;
    },
    db: DbClient = prisma
  ) {
    return db.progressRecord.create({
      data
    });
  }
};
