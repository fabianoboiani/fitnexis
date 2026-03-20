import type { SubscriptionStatus, UserRole } from "@prisma/client";

export type AdminTenantListItemDto = {
  id: string;
  businessName: string;
  personalName: string;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  ownerUserEmail: string;
  isActive: boolean;
  subscriptionStatus: SubscriptionStatus | null;
};

export type AdminTenantDetailsDto = {
  id: string;
  businessName: string;
  personalName: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  ownerUser: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: Date;
  };
  subscription: {
    id: string;
    planName: string;
    status: SubscriptionStatus;
    currentPeriodEnd: Date | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
  } | null;
  counts: {
    students: number;
    payments: number;
    appointments: number;
    progressRecords: number;
  };
};

export type AdminTenantFormValuesDto = {
  businessName: string;
  personalName: string;
  phone: string;
  email: string;
  isActive: "true" | "false";
};
