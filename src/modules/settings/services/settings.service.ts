import type { SubscriptionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { TenantService } from "@/modules/tenants/services/tenant.service";
import {
  UpdateTenantProfileSchema,
  type UpdateTenantProfileInput
} from "@/modules/settings/schemas/profile-settings.schema";

export type TenantProfileDto = {
  id: string;
  personalName: string;
  businessName: string;
  phone: string;
  email: string;
};

export type BillingDetailsDto = {
  planName: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
};

export const SettingsService = {
  async getTenantProfile(tenantId: string): Promise<TenantProfileDto | null> {
    const tenant = await TenantService.findById(tenantId);

    if (!tenant) {
      return null;
    }

    return {
      id: tenant.id,
      personalName: tenant.personalName,
      businessName: tenant.businessName,
      phone: tenant.phone ?? "",
      email: tenant.email ?? ""
    };
  },

  async updateTenantProfile(tenantId: string, input: UpdateTenantProfileInput) {
    const parsed = UpdateTenantProfileSchema.parse(input);

    return TenantService.updateById(tenantId, {
      personalName: parsed.personalName,
      businessName: parsed.businessName,
      phone: parsed.phone,
      email: parsed.email
    });
  },

  async getBillingDetails(tenantId: string): Promise<BillingDetailsDto | null> {
    const subscription = await prisma.saaSSubscription.findUnique({
      where: {
        tenantId
      }
    });

    if (!subscription) {
      return null;
    }

    return {
      planName: subscription.planName,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId
    };
  }
};
