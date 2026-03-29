"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import { AdminUserService } from "@/modules/admin/users/services/admin-user.service";
import {
  UpdateAdminUserSchema,
  type UpdateAdminUserInput
} from "@/modules/admin/users/schemas/admin-user.schema";

type AdminUserActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function updateAdminUserAction(
  userId: string,
  input: UpdateAdminUserInput
): Promise<AdminUserActionState> {
  const admin = await requireAdmin();
  const parsed = UpdateAdminUserSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revise os campos do usuário.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    await AdminUserService.update(userId, parsed.data, {
      currentUserId: admin.id
    });
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Não foi possível atualizar o usuário."
    };
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);

  return {
    success: true,
    message: "Usuário atualizado com sucesso."
  };
}
