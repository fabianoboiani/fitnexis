import type {
  ProgressRecordFormValuesDto,
  ProgressRecordListItemDto
} from "@/modules/progress/dto/progress-record.dto";
import { ProgressRepository } from "@/modules/progress/repositories/progress.repository";
import {
  CreateProgressRecordSchema,
  type CreateProgressRecordInput
} from "@/modules/progress/schemas/progress.schema";
import { StudentService } from "@/modules/students/services/student.service";

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

export const ProgressService = {
  async listByTenant(tenantId: string, studentId?: string): Promise<ProgressRecordListItemDto[]> {
    const records = await ProgressRepository.findManyByTenant(tenantId, studentId);

    return records.map((record) => ({
      id: record.id,
      studentId: record.studentId,
      studentName: record.student.name,
      recordedAt: record.recordedAt,
      weight: record.weight ? Number(record.weight) : null,
      bodyFat: record.bodyFat ? Number(record.bodyFat) : null,
      notes: record.notes
    }));
  },

  async create(tenantId: string, input: CreateProgressRecordInput) {
    const parsed = CreateProgressRecordSchema.parse(input);
    const student = await StudentService.getById(tenantId, parsed.studentId);

    if (!student) {
      throw new Error("O aluno informado n?o pertence ao tenant atual.");
    }

    return ProgressRepository.create({
      tenantId,
      studentId: parsed.studentId,
      recordedAt: parseDate(parsed.recordedAt),
      weight: parsed.weight,
      bodyFat: parsed.bodyFat,
      notes: parsed.notes
    });
  },

  getFormValues(studentId?: string): ProgressRecordFormValuesDto {
    return {
      studentId: studentId ?? "",
      recordedAt: new Date().toISOString().slice(0, 10),
      weight: undefined,
      bodyFat: undefined,
      notes: ""
    };
  }
};
