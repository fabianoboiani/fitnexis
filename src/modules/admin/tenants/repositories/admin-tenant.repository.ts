import { SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export const AdminTenantRepository = {
  async findMany(filters?: {
    businessName?: string;
    personalName?: string;
    email?: string;
  }) {
    const businessName = filters?.businessName?.trim();
    const personalName = filters?.personalName?.trim();
    const email = filters?.email?.trim();

    return prisma.tenant.findMany({
      where: {
        ...(businessName
          ? {
              businessName: {
                contains: businessName,
                mode: "insensitive"
              }
            }
          : {}),
        ...(personalName
          ? {
              personalName: {
                contains: personalName,
                mode: "insensitive"
              }
            }
          : {}),
        ...(email
          ? {
              OR: [
                {
                  email: {
                    contains: email,
                    mode: "insensitive"
                  }
                },
                {
                  ownerUser: {
                    email: {
                      contains: email,
                      mode: "insensitive"
                    }
                  }
                }
              ]
            }
          : {})
      },
      include: {
        ownerUser: {
          select: {
            email: true
          }
        },
        saasSubscription: {
          select: {
            status: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  },

  async findById(id: string) {
    return prisma.tenant.findUnique({
      where: { id },
      include: {
        ownerUser: true,
        saasSubscription: true,
        _count: {
          select: {
            students: true,
            payments: true,
            appointments: true,
            progressRecords: true
          }
        }
      }
    });
  },

  async updateTenant(
    id: string,
    data: {
      businessName: string;
      personalName: string;
      phone?: string;
      email?: string;
      isActive: boolean;
    }
  ) {
    return prisma.tenant.update({
      where: { id },
      data
    });
  },

  async updateSubscriptionStatus(tenantId: string, status: SubscriptionStatus) {
    const existing = await prisma.saaSSubscription.findUnique({
      where: { tenantId }
    });

    if (!existing) {
      return prisma.saaSSubscription.create({
        data: {
          tenantId,
          planName: "Manual",
          status
        }
      });
    }

    return prisma.saaSSubscription.update({
      where: { tenantId },
      data: {
        status
      }
    });
  }
};
