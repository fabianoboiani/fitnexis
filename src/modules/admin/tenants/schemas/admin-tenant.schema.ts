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
    message: "Informe um e-mail válido."
  });

export const UpdateAdminTenantSchema = z.object({
  businessName: z.string().trim().min(2, "Informe o nome do negócio."),
  personalName: z.string().trim().min(2, "Informe o nome do personal."),
  email: optionalEmail,
  phone: optionalText,
  isActive: z.enum(["true", "false"])
});

export const UpdateAdminSubscriptionStatusSchema = z.object({
  status: z.enum(["TRIAL", "ACTIVE", "PAST_DUE", "CANCELED"])
});

export const UpdateAdminSubscriptionSchema = UpdateAdminSubscriptionStatusSchema;

export type UpdateAdminTenantInput = z.infer<typeof UpdateAdminTenantSchema>;
export type UpdateAdminSubscriptionStatusInput = z.infer<typeof UpdateAdminSubscriptionStatusSchema>;
export type UpdateAdminSubscriptionInput = UpdateAdminSubscriptionStatusInput;
