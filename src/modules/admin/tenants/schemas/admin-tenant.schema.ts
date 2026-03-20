import { SubscriptionStatus } from "@prisma/client";
import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value.toLowerCase() : undefined))
  .refine((value) => !value || z.string().email().safeParse(value).success, {
    message: "Informe um e-mail valido."
  });

export const UpdateAdminTenantSchema = z.object({
  businessName: z.string().trim().min(2, "Informe o nome do neg?cio."),
  personalName: z.string().trim().min(2, "Informe o nome do personal."),
  phone: optionalText,
  email: optionalEmail,
  isActive: z.enum(["true", "false"])
});

export const UpdateAdminSubscriptionSchema = z.object({
  status: z.nativeEnum(SubscriptionStatus)
});

export type UpdateAdminTenantInput = z.infer<typeof UpdateAdminTenantSchema>;
export type UpdateAdminSubscriptionInput = z.infer<typeof UpdateAdminSubscriptionSchema>;
