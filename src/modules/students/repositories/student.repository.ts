import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";

type DbClient = PrismaClient | Prisma.TransactionClient;

const studentWithUserSelect = {
  user: {
    select: {
      id: true,
      email: true
    }
  }
} satisfies Prisma.StudentInclude;

export const StudentRepository = {
  async findManyByTenant(tenantId: string, search?: string) {
    return prisma.student.findMany({
      where: {
        tenantId,
        ...(search
          ? {
              name: {
                contains: search,
                mode: "insensitive"
              }
            }
          : {})
      },
      include: studentWithUserSelect,
      orderBy: [{ createdAt: "desc" }]
    });
  },

  async findByIdAndTenant(id: string, tenantId: string) {
    return prisma.student.findFirst({
      where: {
        id,
        tenantId
      },
      include: studentWithUserSelect
    });
  },

  async findByUserId(userId: string) {
    return prisma.student.findFirst({
      where: {
        userId
      },
      include: studentWithUserSelect
    });
  },

  async create(
    data: {
      tenantId: string;
      name: string;
      email?: string;
      phone?: string;
      birthDate?: Date;
      goal?: string;
      notes?: string;
      status: Prisma.StudentCreateInput["status"];
    },
    db: DbClient = prisma
  ) {
    return db.student.create({
      data
    });
  },

  async updateByIdAndTenant(
    id: string,
    tenantId: string,
    data: {
      name: string;
      email?: string;
      phone?: string;
      birthDate?: Date | null;
      goal?: string;
      notes?: string;
      status: Prisma.StudentUpdateInput["status"];
    }
  ) {
    return prisma.student.updateMany({
      where: {
        id,
        tenantId
      },
      data
    });
  }
};