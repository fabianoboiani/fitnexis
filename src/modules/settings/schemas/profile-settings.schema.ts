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

export const UpdateTenantProfileSchema = z.object({
  personalName: z.string().trim().min(2, "Informe o nome do personal."),
  businessName: z.string().trim().min(2, "Informe o nome do neg?cio."),
  phone: optionalText,
  email: optionalEmail
});

export type UpdateTenantProfileInput = z.infer<typeof UpdateTenantProfileSchema>;
