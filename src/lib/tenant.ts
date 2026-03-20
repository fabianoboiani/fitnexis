import { TenantService } from "@/modules/tenants/services/tenant.service";
import { requireAuth } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export type TenantScopedInput = {
  tenantId: string;
};

export function assertTenantScope<T extends TenantScopedInput>(
  inputTenantId: string,
  currentTenantId: string,
  payload: T
) {
  if (inputTenantId !== currentTenantId || payload.tenantId !== currentTenantId) {
    throw new Error("Tenant scope violation.");
  }
}

export function buildTenantWhere<T extends object>(tenantId: string, where?: T) {
  return {
    tenantId,
    ...(where ?? {})
  };
}

export async function getCurrentTenant() {
  const user = await requireAuth();

  if (user.tenantId) {
    const tenant = await TenantService.findById(user.tenantId);

    if (tenant) {
      return tenant;
    }
  }

  return TenantService.findByOwnerUserId(user.id);
}

export async function requireTenant() {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    redirect("/no-tenant");
  }

  return tenant;
}
