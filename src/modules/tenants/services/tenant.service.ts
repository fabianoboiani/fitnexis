import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";

type DbClient = PrismaClient | Prisma.TransactionClient;

export type TenantContext = {
  tenantId: string;
  ownerUserId: string;
};

export const TenantService = {
  async createForOwner(
    input: {
      ownerUserId: string;
      businessName: string;
      personalName: string;
      phone?: string;
      email?: string;
      isActive?: boolean;
    },
    db: DbClient = prisma
  ) {
    return db.tenant.create({
      data: input
    });
  },
  async findByOwnerUserId(ownerUserId: string) {
    return prisma.tenant.findUnique({
      where: { ownerUserId }
    });
  },
  async findById(id: string) {
    return prisma.tenant.findUnique({
      where: { id }
    });
  },
  async updateById(
    id: string,
    data: {
      businessName: string;
      personalName: string;
      phone?: string;
      email?: string;
      isActive?: boolean;
    }
  ) {
    return prisma.tenant.update({
      where: { id },
      data
    });
  },
  async resolveCurrentTenant(): Promise<TenantContext | null> {
    return null;
  }
};
