import { z } from "zod";

export const CreateManualStudentNoticeSchema = z.object({
  title: z.string().trim().min(3, "Informe um título com pelo menos 3 caracteres.").max(80, "Use um título de até 80 caracteres."),
  description: z.string().trim().min(8, "Escreva uma descrição mais clara para o aviso.").max(180, "Use uma descrição de até 180 caracteres."),
  details: z.string().trim().min(8, "Adicione um contexto útil para o aluno.").max(1000, "Use até 1000 caracteres nos detalhes."),
  priority: z.enum(["low", "medium", "high"])
});

export type CreateManualStudentNoticeInput = z.infer<typeof CreateManualStudentNoticeSchema>;