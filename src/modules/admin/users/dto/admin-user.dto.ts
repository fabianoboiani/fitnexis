import type { SubscriptionStatus, UserRole } from "@prisma/client";

export type AdminUserListItemDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  tenantId: string | null;
  tenantBusinessName: string | null;
};

export type AdminUserDetailsDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  tenant: {
    id: string;
    businessName: string;
    personalName: string;
    email: string | null;
    phone: string | null;
  } | null;
  subscription: {
    id: string;
    planName: string;
    status: SubscriptionStatus;
    currentPeriodEnd: Date | null;
  } | null;
};

export type AdminUserFormValuesDto = {
  name: string;
  role: UserRole;
};
