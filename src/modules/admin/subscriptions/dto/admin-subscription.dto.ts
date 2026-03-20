import type { SubscriptionStatus } from "@prisma/client";

export type AdminSubscriptionListItemDto = {
  id: string;
  tenantId: string;
  tenantBusinessName: string;
  tenantPersonalName: string;
  planName: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminSubscriptionDetailsDto = AdminSubscriptionListItemDto & {
  tenantEmail: string | null;
  tenantPhone: string | null;
};

export type AdminSubscriptionFormValuesDto = {
  planName: string;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
};
