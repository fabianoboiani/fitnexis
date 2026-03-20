"use server";

import { AuthError, AuthService } from "@/modules/auth/services/auth.service";
import { RegisterSchema, type RegisterInput } from "@/modules/auth/schemas/register.schema";

export async function registerAction(input: RegisterInput) {
  const parsed = RegisterSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Revise os campos do cadastro.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    const result = await AuthService.registerPersonal(parsed.data);

    return {
      success: true as const,
      message: "Conta criada com sucesso.",
      data: result
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false as const,
        message: error.message
      };
    }

    throw error;
  }
}
