import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : ""));

const optionalDateString = z
  .string()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : ""))
  .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), {
    message: "Informe uma data válida."
  });

export const UpdateStudentProfileSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo."),
  email: z.string().email("Informe um e-mail válido."),
  phone: optionalText,
  birthDate: optionalDateString,
  goal: optionalText,
  notes: z.string().trim().max(500, "Use no máximo 500 caracteres.").optional().transform((value) => value ?? "")
});

export const ChangeStudentPasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Informe sua senha atual."),
    newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string().min(6, "Confirme a nova senha.")
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "A confirmação precisa ser igual à nova senha."
  });

export type UpdateStudentProfileInput = z.infer<typeof UpdateStudentProfileSchema>;
export type ChangeStudentPasswordInput = z.infer<typeof ChangeStudentPasswordSchema>;