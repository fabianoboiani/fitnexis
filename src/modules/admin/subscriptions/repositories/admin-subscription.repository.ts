import { prisma } from "@/lib/db";
import type { SubscriptionStatus } from "@prisma/client";

export const AdminSubscriptionRepository = {
  async findMany(filters?: {
    status?: SubscriptionStatus;
    planName?: string;
    tenantId?: string;
  }) {
    return prisma.saaSSubscription.findMany({
      where: {
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.planName
          ? {
              planName: {
                contains: filters.planName,
                mode: "insensitive"
              }
            }
          : {}),
        ...(filters?.tenantId ? { tenantId: filters.tenantId } : {})
      },
      include: {
        tenant: {
          select: {
            id: true,
            businessName: true,
            personalName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: [{ updatedAt: "desc" }]
    });
  },

  async findById(id: string) {
    return prisma.saaSSubscription.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            businessName: true,
            personalName: true,
            email: true,
            phone: true
          }
        }
      }
    });
  },

  async updateById(
    id: string,
    data: {
      planName: string;
      status: SubscriptionStatus;
      currentPeriodEnd?: Date | null;
      stripeCustomerId?: string | null;
      stripeSubscriptionId?: string | null;
    }
  ) {
    return prisma.saaSSubscription.update({
      where: { id },
      data
    });
  }
};
