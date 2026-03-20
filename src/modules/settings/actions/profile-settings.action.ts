"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTenant } from "@/lib/tenant";
import { SettingsService } from "@/modules/settings/services/settings.service";
import {
  UpdateTenantProfileSchema,
  type UpdateTenantProfileInput
} from "@/modules/settings/schemas/profile-settings.schema";

type ProfileSettingsActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function updateTenantProfileAction(
  input: UpdateTenantProfileInput
): Promise<ProfileSettingsActionState> {
  const tenant = await requireTenant();
  const parsed = UpdateTenantProfileSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revise os campos do perfil.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  await SettingsService.updateTenantProfile(tenant.id, parsed.data);
  revalidatePath("/settings");
  revalidatePath("/settings/profile");
  redirect("/settings/profile?success=updated");
}
