import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const optionalEnum = <T extends z.EnumLike>(enumLike: T) =>
  z
    .string()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
    .refine((value) => !value || value in enumLike, {
      message: "Valor invalido."
    })
    .transform((value) => (value ? (value as T[keyof T]) : undefined));

const optionalDateString = z
  .string()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined))
  .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), {
    message: "Informe uma data valida."
  });

export const PaymentFormSchema = z.object({
  studentId: z.string().min(1, "Selecione um aluno."),
  amount: z.coerce.number().positive("Informe um valor valido."),
  dueDate: z.string().min(1, "Informe a data de vencimento."),
  paymentMethod: optionalEnum(PaymentMethod),
  notes: optionalText,
  status: z.nativeEnum(PaymentStatus),
  paidAt: optionalDateString
});

export const CreatePaymentSchema = PaymentFormSchema;
export const UpdatePaymentSchema = PaymentFormSchema;

export type PaymentFormInput = z.infer<typeof PaymentFormSchema>;
export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof UpdatePaymentSchema>;
