import { notFound } from "next/navigation";
import type {
  AdminTenantDetailsDto,
  AdminTenantFormValuesDto,
  AdminTenantListItemDto
} from "@/modules/admin/tenants/dto/admin-tenant.dto";
import { AdminTenantRepository } from "@/modules/admin/tenants/repositories/admin-tenant.repository";
import {
  UpdateAdminSubscriptionSchema,
  UpdateAdminTenantSchema,
  type UpdateAdminSubscriptionInput,
  type UpdateAdminTenantInput
} from "@/modules/admin/tenants/schemas/admin-tenant.schema";

export const AdminTenantService = {
  async list(filters?: {
    businessName?: string;
    personalName?: string;
    email?: string;
  }): Promise<AdminTenantListItemDto[]> {
    const tenants = await AdminTenantRepository.findMany(filters);

    return tenants.map((tenant) => ({
      id: tenant.id,
      businessName: tenant.businessName,
      personalName: tenant.personalName,
      email: tenant.email,
      phone: tenant.phone,
      createdAt: tenant.createdAt,
      ownerUserEmail: tenant.ownerUser.email,
      isActive: tenant.isActive,
      subscriptionStatus: tenant.saasSubscription?.status ?? null
    }));
  },

  async getByIdOrThrow(id: string): Promise<AdminTenantDetailsDto> {
    const tenant = await AdminTenantRepository.findById(id);

    if (!tenant) {
      notFound();
    }

    return {
      id: tenant.id,
      businessName: tenant.businessName,
      personalName: tenant.personalName,
      email: tenant.email,
      phone: tenant.phone,
      isActive: tenant.isActive,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      ownerUser: {
        id: tenant.ownerUser.id,
        name: tenant.ownerUser.name,
        email: tenant.ownerUser.email,
        role: tenant.ownerUser.role,
        createdAt: tenant.ownerUser.createdAt
      },
      subscription: tenant.saasSubscription
        ? {
            id: tenant.saasSubscription.id,
            planName: tenant.saasSubscription.planName,
            status: tenant.saasSubscription.status,
            currentPeriodEnd: tenant.saasSubscription.currentPeriodEnd,
            stripeCustomerId: tenant.saasSubscription.stripeCustomerId,
            stripeSubscriptionId: tenant.saasSubscription.stripeSubscriptionId
          }
        : null,
      counts: {
        students: tenant._count.students,
        payments: tenant._count.payments,
        appointments: tenant._count.appointments,
        progressRecords: tenant._count.progressRecords
      }
    };
  },

  async updateTenant(id: string, input: UpdateAdminTenantInput) {
    const parsed = UpdateAdminTenantSchema.parse(input);

    return AdminTenantRepository.updateTenant(id, {
      businessName: parsed.businessName,
      personalName: parsed.personalName,
      phone: parsed.phone,
      email: parsed.email,
      isActive: parsed.isActive === "true"
    });
  },

  async updateSubscriptionStatus(id: string, input: UpdateAdminSubscriptionInput) {
    const tenant = await AdminTenantRepository.findById(id);

    if (!tenant) {
      notFound();
    }

    const parsed = UpdateAdminSubscriptionSchema.parse(input);
    return AdminTenantRepository.updateSubscriptionStatus(tenant.id, parsed.status);
  },

  getFormValues(tenant: AdminTenantDetailsDto): AdminTenantFormValuesDto {
    return {
      businessName: tenant.businessName,
      personalName: tenant.personalName,
      phone: tenant.phone ?? "",
      email: tenant.email ?? "",
      isActive: tenant.isActive ? "true" : "false"
    };
  }
};
