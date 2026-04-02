import { UserRole } from "@prisma/client";
import { z } from "zod";

export const UpdateAdminUserSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do usuário."),
  role: z.nativeEnum(UserRole)
});

export type UpdateAdminUserInput = z.infer<typeof UpdateAdminUserSchema>;
