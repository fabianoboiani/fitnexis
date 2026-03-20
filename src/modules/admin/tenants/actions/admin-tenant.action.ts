"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import { AdminTenantService } from "@/modules/admin/tenants/services/admin-tenant.service";
import {
  UpdateAdminSubscriptionSchema,
  UpdateAdminTenantSchema,
  type UpdateAdminSubscriptionInput,
  type UpdateAdminTenantInput
} from "@/modules/admin/tenants/schemas/admin-tenant.schema";

type AdminTenantActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function updateAdminTenantAction(
  tenantId: string,
  input: UpdateAdminTenantInput
): Promise<AdminTenantActionState> {
  await requireAdmin();
  const parsed = UpdateAdminTenantSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revise os campos do tenant.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  await AdminTenantService.updateTenant(tenantId, parsed.data);
  revalidatePath("/admin");
  revalidatePath("/admin/tenants");
  revalidatePath(`/admin/tenants/${tenantId}`);

  return {
    success: true,
    message: "Tenant atualizado com sucesso."
  };
}

export async function updateAdminSubscriptionStatusAction(
  tenantId: string,
  input: UpdateAdminSubscriptionInput
): Promise<AdminTenantActionState> {
  await requireAdmin();
  const parsed = UpdateAdminSubscriptionSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revise os dados da assinatura.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  await AdminTenantService.updateSubscriptionStatus(tenantId, parsed.data);
  revalidatePath("/admin");
  revalidatePath("/admin/subscriptions");
  revalidatePath(`/admin/tenants/${tenantId}`);

  return {
    success: true,
    message: "Status da assinatura atualizado com sucesso."
  };
}
