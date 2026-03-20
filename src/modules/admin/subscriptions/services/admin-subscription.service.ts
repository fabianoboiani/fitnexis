import { notFound } from "next/navigation";
import type {
  AdminSubscriptionDetailsDto,
  AdminSubscriptionFormValuesDto,
  AdminSubscriptionListItemDto
} from "@/modules/admin/subscriptions/dto/admin-subscription.dto";
import { AdminSubscriptionRepository } from "@/modules/admin/subscriptions/repositories/admin-subscription.repository";
import {
  UpdateAdminSubscriptionSchema,
  type UpdateAdminSubscriptionInput
} from "@/modules/admin/subscriptions/schemas/admin-subscription.schema";

function parseDate(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

export const AdminSubscriptionService = {
  async list(filters?: {
    status?: UpdateAdminSubscriptionInput["status"];
    planName?: string;
    tenantId?: string;
  }): Promise<AdminSubscriptionListItemDto[]> {
    const subscriptions = await AdminSubscriptionRepository.findMany(filters);

    return subscriptions.map((subscription) => ({
      id: subscription.id,
      tenantId: subscription.tenantId,
      tenantBusinessName: subscription.tenant.businessName,
      tenantPersonalName: subscription.tenant.personalName,
      planName: subscription.planName,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt
    }));
  },

  async getById(id: string): Promise<AdminSubscriptionDetailsDto | null> {
    const subscription = await AdminSubscriptionRepository.findById(id);

    if (!subscription) {
      return null;
    }

    return {
      id: subscription.id,
      tenantId: subscription.tenantId,
      tenantBusinessName: subscription.tenant.businessName,
      tenantPersonalName: subscription.tenant.personalName,
      tenantEmail: subscription.tenant.email,
      tenantPhone: subscription.tenant.phone,
      planName: subscription.planName,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt
    };
  },

  async getByIdOrThrow(id: string): Promise<AdminSubscriptionDetailsDto> {
    const subscription = await this.getById(id);

    if (!subscription) {
      notFound();
    }

    return subscription;
  },

  async update(id: string, input: UpdateAdminSubscriptionInput) {
    const parsed = UpdateAdminSubscriptionSchema.parse(input);

    return AdminSubscriptionRepository.updateById(id, {
      planName: parsed.planName,
      status: parsed.status,
      currentPeriodEnd: parseDate(parsed.currentPeriodEnd),
      stripeCustomerId: parsed.stripeCustomerId ?? null,
      stripeSubscriptionId: parsed.stripeSubscriptionId ?? null
    });
  },

  getFormValues(subscription: AdminSubscriptionDetailsDto): AdminSubscriptionFormValuesDto {
    return {
      planName: subscription.planName,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd
        ? subscription.currentPeriodEnd.toISOString().slice(0, 10)
        : "",
      stripeCustomerId: subscription.stripeCustomerId ?? "",
      stripeSubscriptionId: subscription.stripeSubscriptionId ?? ""
    };
  }
};
