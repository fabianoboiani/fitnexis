"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import { AdminSubscriptionService } from "@/modules/admin/subscriptions/services/admin-subscription.service";
import {
  UpdateAdminSubscriptionSchema,
  type UpdateAdminSubscriptionInput
} from "@/modules/admin/subscriptions/schemas/admin-subscription.schema";

type AdminSubscriptionActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function updateAdminSubscriptionAction(
  subscriptionId: string,
  input: UpdateAdminSubscriptionInput
): Promise<AdminSubscriptionActionState> {
  await requireAdmin();
  const parsed = UpdateAdminSubscriptionSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revise os campos da assinatura.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  await AdminSubscriptionService.update(subscriptionId, parsed.data);
  revalidatePath("/admin");
  revalidatePath("/admin/subscriptions");

  return {
    success: true,
    message: "Assinatura atualizada com sucesso."
  };
}
