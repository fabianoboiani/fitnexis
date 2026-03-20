import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";

export const AdminUserRepository = {
  async findMany(filters?: {
    name?: string;
    email?: string;
    role?: UserRole;
  }) {
    return prisma.user.findMany({
      where: {
        ...(filters?.name
          ? {
              name: {
                contains: filters.name,
                mode: "insensitive"
              }
            }
          : {}),
        ...(filters?.email
          ? {
              email: {
                contains: filters.email,
                mode: "insensitive"
              }
            }
          : {}),
        ...(filters?.role ? { role: filters.role } : {})
      },
      include: {
        ownedTenant: {
          select: {
            id: true,
            businessName: true
          }
        }
      },
      orderBy: [{ createdAt: "desc" }]
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        ownedTenant: {
          include: {
            saasSubscription: {
              select: {
                id: true,
                planName: true,
                status: true,
                currentPeriodEnd: true
              }
            }
          }
        }
      }
    });
  },

  async countAdmins() {
    return prisma.user.count({
      where: {
        role: "ADMIN"
      }
    });
  },

  async updateById(
    id: string,
    data: {
      name: string;
      role: UserRole;
    }
  ) {
    return prisma.user.update({
      where: { id },
      data
    });
  }
};
