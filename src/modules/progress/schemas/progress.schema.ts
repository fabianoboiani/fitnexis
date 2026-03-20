import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}, z.coerce.number().positive("Informe um numero valido.").optional());

export const ProgressRecordFormSchema = z.object({
  studentId: z.string().min(1, "Selecione um aluno."),
  recordedAt: z.string().min(1, "Informe a data do registro."),
  weight: optionalNumber,
  bodyFat: optionalNumber,
  notes: optionalText
});

export const CreateProgressRecordSchema = ProgressRecordFormSchema;

export type ProgressRecordFormInput = z.infer<typeof ProgressRecordFormSchema>;
export type CreateProgressRecordInput = z.infer<typeof CreateProgressRecordSchema>;
