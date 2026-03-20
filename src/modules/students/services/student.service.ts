import { notFound } from "next/navigation";
import { StudentStatus } from "@prisma/client";
import {
  type StudentDetailsDto,
  type StudentFormValuesDto,
  type StudentListItemDto
} from "@/modules/students/dto/student.dto";
import { StudentRepository } from "@/modules/students/repositories/student.repository";
import {
  CreateStudentSchema,
  type CreateStudentInput,
  UpdateStudentSchema,
  type UpdateStudentInput
} from "@/modules/students/schemas/student.schema";

function parseBirthDate(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined;
}

function mapStudentFormValues(student?: StudentDetailsDto): StudentFormValuesDto {
  if (!student) {
    return {
      name: "",
      email: "",
      phone: "",
      birthDate: "",
      goal: "",
      notes: "",
      status: StudentStatus.ACTIVE
    };
  }

  return {
    name: student.name,
    email: student.email ?? "",
    phone: student.phone ?? "",
    birthDate: student.birthDate ? student.birthDate.toISOString().slice(0, 10) : "",
    goal: student.goal ?? "",
    notes: student.notes ?? "",
    status: student.status
  };
}

export const StudentService = {
  async listByTenant(tenantId: string, search?: string): Promise<StudentListItemDto[]> {
    const normalizedSearch = search?.trim() ? search.trim() : undefined;
    return StudentRepository.findManyByTenant(tenantId, normalizedSearch);
  },

  async getById(tenantId: string, id: string): Promise<StudentDetailsDto | null> {
    return StudentRepository.findByIdAndTenant(id, tenantId);
  },

  async getByIdOrThrow(tenantId: string, id: string): Promise<StudentDetailsDto> {
    const student = await StudentRepository.findByIdAndTenant(id, tenantId);

    if (!student) {
      notFound();
    }

    return student;
  },

  async create(tenantId: string, input: CreateStudentInput) {
    const parsed = CreateStudentSchema.parse(input);

    return StudentRepository.create({
      tenantId,
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      birthDate: parseBirthDate(parsed.birthDate),
      goal: parsed.goal,
      notes: parsed.notes,
      status: parsed.status
    });
  },

  async update(tenantId: string, id: string, input: UpdateStudentInput) {
    const parsed = UpdateStudentSchema.parse(input);
    const existingStudent = await StudentRepository.findByIdAndTenant(id, tenantId);

    if (!existingStudent) {
      notFound();
    }

    await StudentRepository.updateByIdAndTenant(id, tenantId, {
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      birthDate: parsed.birthDate ? parseBirthDate(parsed.birthDate) : null,
      goal: parsed.goal,
      notes: parsed.notes,
      status: parsed.status
    });

    return StudentRepository.findByIdAndTenant(id, tenantId);
  },

  getFormValues(student?: StudentDetailsDto) {
    return mapStudentFormValues(student);
  }
};
