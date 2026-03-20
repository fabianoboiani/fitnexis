import { StudentStatus } from "@prisma/client";
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

const optionalDateString = z
  .string()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined))
  .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), {
    message: "Informe uma data valida."
  });

export const StudentFormSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do aluno."),
  email: optionalEmail,
  phone: optionalText,
  birthDate: optionalDateString,
  goal: optionalText,
  notes: optionalText,
  status: z.nativeEnum(StudentStatus)
});

export const CreateStudentSchema = StudentFormSchema;

export const UpdateStudentSchema = StudentFormSchema;

export type StudentFormInput = z.infer<typeof StudentFormSchema>;
export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;
export type UpdateStudentInput = z.infer<typeof UpdateStudentSchema>;
