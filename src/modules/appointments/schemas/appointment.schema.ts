import { AppointmentStatus } from "@prisma/client";
import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

export const AppointmentFormSchema = z
  .object({
    studentId: z.string().min(1, "Selecione um aluno."),
    title: z.string().trim().min(2, "Informe o título do compromisso."),
    startsAt: z.string().min(1, "Informe a data inicial."),
    endsAt: z.string().min(1, "Informe a data final."),
    notes: optionalText,
    status: z.nativeEnum(AppointmentStatus)
  })
  .refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
    message: "A data final precisa ser maior que a inicial.",
    path: ["endsAt"]
  });

export const CreateAppointmentSchema = AppointmentFormSchema;
export const UpdateAppointmentSchema = AppointmentFormSchema;

export type AppointmentFormInput = z.infer<typeof AppointmentFormSchema>;
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentSchema>;
