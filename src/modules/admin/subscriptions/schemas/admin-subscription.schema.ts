import { SubscriptionStatus } from "@prisma/client";
import { z } from "zod";

const optionalDateString = z
  .string()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined))
  .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), {
    message: "Informe uma data valida."
  });

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

export const UpdateAdminSubscriptionSchema = z.object({
  planName: z.string().trim().min(2, "Informe o nome do plano."),
  status: z.nativeEnum(SubscriptionStatus),
  currentPeriodEnd: optionalDateString,
  stripeCustomerId: optionalText,
  stripeSubscriptionId: optionalText
});

export type UpdateAdminSubscriptionInput = z.infer<typeof UpdateAdminSubscriptionSchema>;
