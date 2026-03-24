import { z } from "zod";

export const UpdateStudentProfileSchema = z.object({
  name: z.string().trim().min(3, "Informe seu nome completo."),
  email: z.string().email("Informe um e-mail válido."),
  phone: z.string().trim().min(8, "Informe um telefone válido."),
  birthDate: z.string().min(1, "Informe sua data de nascimento."),
  goal: z.string().trim().min(3, "Descreva seu objetivo principal."),
  photoUrl: z.string().url("Informe uma URL válida para a foto.").or(z.literal("")),
  emergencyContact: z.string().trim().min(3, "Informe um contato de emergência."),
  personalNotes: z.string().trim().max(280, "Use no máximo 280 caracteres.")
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