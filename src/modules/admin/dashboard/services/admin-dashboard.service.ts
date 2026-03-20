import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SubscriptionStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";

export type AdminDashboardOverview = {
  totalTenants: number;
  totalActiveTenants: number;
  totalTrialTenants: number;
  totalCanceledSubscriptions: number;
  totalPersonalUsers: number;
  totalAdminUsers: number;
  recentTenants: Array<{
    id: string;
    businessName: string;
    personalName: string;
    email: string | null;
    createdAt: Date;
    createdAtLabel: string;
    subscriptionStatus: SubscriptionStatus | null;
  }>;
  subscriptionsExpiringSoon: Array<{
    id: string;
    tenantId: string;
    businessName: string;
    planName: string;
    status: SubscriptionStatus;
    currentPeriodEnd: Date;
    currentPeriodEndLabel: string;
  }>;
};

export const AdminDashboardService = {
  async getOverview(): Promise<AdminDashboardOverview> {
    const now = new Date();
    const soonThreshold = addDays(now, 14);

    const [
      totalTenants,
      totalActiveTenants,
      totalTrialTenants,
      totalCanceledSubscriptions,
      totalPersonalUsers,
      totalAdminUsers,
      recentTenants,
      subscriptionsExpiringSoon
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({
        where: {
          isActive: true
        }
      }),
      prisma.saaSSubscription.count({
        where: {
          status: SubscriptionStatus.TRIAL
        }
      }),
      prisma.saaSSubscription.count({
        where: {
          status: SubscriptionStatus.CANCELED
        }
      }),
      prisma.user.count({
        where: {
          role: UserRole.PERSONAL
        }
      }),
      prisma.user.count({
        where: {
          role: UserRole.ADMIN
        }
      }),
      prisma.tenant.findMany({
        orderBy: {
          createdAt: "desc"
        },
        take: 5,
        select: {
          id: true,
          businessName: true,
          personalName: true,
          email: true,
          isActive: true,
          createdAt: true,
          saasSubscription: {
            select: {
              status: true
            }
          }
        }
      }),
      prisma.saaSSubscription.findMany({
        where: {
          currentPeriodEnd: {
            not: null,
            gte: now,
            lte: soonThreshold
          },
          status: {
            in: [SubscriptionStatus.TRIAL, SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE]
          }
        },
        orderBy: {
          currentPeriodEnd: "asc"
        },
        take: 8,
        select: {
          id: true,
          tenantId: true,
          planName: true,
          status: true,
          currentPeriodEnd: true,
          tenant: {
            select: {
              businessName: true
            }
          }
        }
      })
    ]);

    return {
      totalTenants,
      totalActiveTenants,
      totalTrialTenants,
      totalCanceledSubscriptions,
      totalPersonalUsers,
      totalAdminUsers,
      recentTenants: recentTenants.map((tenant) => ({
        id: tenant.id,
        businessName: tenant.businessName,
        personalName: tenant.personalName,
        email: tenant.email,
        createdAt: tenant.createdAt,
        createdAtLabel: format(tenant.createdAt, "dd/MM/yyyy", { locale: ptBR }),
        subscriptionStatus: tenant.saasSubscription?.status ?? null
      })),
      subscriptionsExpiringSoon: subscriptionsExpiringSoon
        .filter(
          (subscription): subscription is typeof subscription & { currentPeriodEnd: Date } =>
            Boolean(subscription.currentPeriodEnd)
        )
        .map((subscription) => ({
          id: subscription.id,
          tenantId: subscription.tenantId,
          businessName: subscription.tenant.businessName,
          planName: subscription.planName,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          currentPeriodEndLabel: format(subscription.currentPeriodEnd, "dd/MM/yyyy", {
            locale: ptBR
          })
        }))
    };
  }
};
