"use server";

import { LoginSchema, type LoginInput } from "@/modules/auth/schemas/login.schema";

export async function loginAction(input: LoginInput) {
  return LoginSchema.parse(input);
}
