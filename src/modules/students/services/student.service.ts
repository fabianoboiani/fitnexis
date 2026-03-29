import { notFound } from "next/navigation";
import { StudentStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  type StudentDetailsDto,
  type StudentFormValuesDto,
  type StudentListItemDto
} from "@/modules/students/dto/student.dto";
import { StudentRepository } from "@/modules/students/repositories/student.repository";
import {
  CreateStudentSchema,
  EnableStudentPortalAccessSchema,
  type CreateStudentInput,
  type EnableStudentPortalAccessInput,
  UpdateStudentSchema,
  type UpdateStudentInput
} from "@/modules/students/schemas/student.schema";
import { PasswordService } from "@/modules/auth/services/password.service";

function parseBirthDate(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined;
}

function mapStudentListItem(student: Awaited<ReturnType<typeof StudentRepository.findManyByTenant>>[number]): StudentListItemDto {
  return {
    id: student.id,
    name: student.name,
    email: student.email,
    phone: student.phone,
    status: student.status,
    goal: student.goal,
    createdAt: student.createdAt,
    userId: student.userId,
    hasPortalAccount: Boolean(student.userId),
    hasPortalAccess: Boolean(student.userId && student.portalAccessEnabled),
    portalAccessEmail: student.user?.email ?? null
  };
}

function mapStudentDetails(student: NonNullable<Awaited<ReturnType<typeof StudentRepository.findByIdAndTenant>>>): StudentDetailsDto {
  return {
    id: student.id,
    tenantId: student.tenantId,
    userId: student.userId,
    name: student.name,
    email: student.email,
    phone: student.phone,
    birthDate: student.birthDate,
    goal: student.goal,
    notes: student.notes,
    status: student.status,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
    hasPortalAccount: Boolean(student.userId),
    hasPortalAccess: Boolean(student.userId && student.portalAccessEnabled),
    portalAccessEmail: student.user?.email ?? null
  };
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

export class StudentPortalAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StudentPortalAccessError";
  }
}

export const StudentService = {
  async listByTenant(tenantId: string, search?: string): Promise<StudentListItemDto[]> {
    const normalizedSearch = search?.trim() ? search.trim() : undefined;
    const students = await StudentRepository.findManyByTenant(tenantId, normalizedSearch);
    return students.map(mapStudentListItem);
  },

  async getById(tenantId: string, id: string): Promise<StudentDetailsDto | null> {
    const student = await StudentRepository.findByIdAndTenant(id, tenantId);
    return student ? mapStudentDetails(student) : null;
  },

  async getByIdOrThrow(tenantId: string, id: string): Promise<StudentDetailsDto> {
    const student = await StudentRepository.findByIdAndTenant(id, tenantId);

    if (!student) {
      notFound();
    }

    return mapStudentDetails(student);
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

    if (existingStudent.userId && !parsed.email) {
      throw new Error("Alunos com acesso ao portal precisam manter um e-mail válido.");
    }

    if (existingStudent.userId && parsed.email && parsed.email !== existingStudent.user?.email) {
      const emailInUse = await prisma.user.findFirst({
        where: {
          email: parsed.email,
          id: {
            not: existingStudent.userId
          }
        },
        select: { id: true }
      });

      if (emailInUse) {
        throw new Error("Já existe outro usuário utilizando este e-mail.");
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id: existingStudent.id },
        data: {
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone,
          birthDate: parsed.birthDate ? parseBirthDate(parsed.birthDate) : null,
          goal: parsed.goal,
          notes: parsed.notes,
          status: parsed.status
        }
      });

      if (existingStudent.userId) {
        await tx.user.update({
          where: { id: existingStudent.userId },
          data: {
            name: parsed.name,
            ...(parsed.email ? { email: parsed.email } : {})
          }
        });
      }
    });

    const updatedStudent = await StudentRepository.findByIdAndTenant(id, tenantId);

    if (!updatedStudent) {
      notFound();
    }

    return mapStudentDetails(updatedStudent);
  },

  async enablePortalAccess(tenantId: string, studentId: string, input: EnableStudentPortalAccessInput) {
    const parsed = EnableStudentPortalAccessSchema.parse(input);
    const student = await StudentRepository.findByIdAndTenant(studentId, tenantId);

    if (!student) {
      notFound();
    }

    if (student.userId && student.portalAccessEnabled) {
      throw new StudentPortalAccessError("Este aluno já possui acesso ao portal.");
    }

    const passwordHash = await PasswordService.hash(parsed.initialPassword);

    if (student.userId) {
      const emailInUse = await prisma.user.findFirst({
        where: {
          email: parsed.email,
          id: {
            not: student.userId
          }
        },
        select: { id: true }
      });

      if (emailInUse) {
        throw new StudentPortalAccessError("Já existe outro usuário utilizando este e-mail.");
      }

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: student.userId! },
          data: {
            name: student.name,
            email: parsed.email,
            passwordHash,
            role: UserRole.STUDENT
          }
        });

        await tx.student.update({
          where: { id: student.id },
          data: {
            email: parsed.email,
            portalAccessEnabled: true
          }
        });
      });
    } else {
      const existingUser = await prisma.user.findUnique({
        where: { email: parsed.email },
        select: {
          id: true,
          role: true,
          studentProfile: {
            select: {
              id: true
            }
          }
        }
      });

      await prisma.$transaction(async (tx) => {
        let userIdToLink: string;

        if (existingUser) {
          if (existingUser.role !== UserRole.STUDENT) {
            throw new StudentPortalAccessError("Já existe um usuário de outro perfil cadastrado com este e-mail.");
          }

          if (existingUser.studentProfile?.id && existingUser.studentProfile.id !== student.id) {
            throw new StudentPortalAccessError("Já existe outro aluno utilizando este usuário de acesso.");
          }

          await tx.user.update({
            where: { id: existingUser.id },
            data: {
              name: student.name,
              passwordHash,
              role: UserRole.STUDENT
            }
          });

          userIdToLink = existingUser.id;
        } else {
          const user = await tx.user.create({
            data: {
              name: student.name,
              email: parsed.email,
              passwordHash,
              role: UserRole.STUDENT
            }
          });

          userIdToLink = user.id;
        }

        await tx.student.update({
          where: { id: student.id },
          data: {
            userId: userIdToLink,
            email: parsed.email,
            portalAccessEnabled: true
          }
        });
      });
    }

    const updatedStudent = await StudentRepository.findByIdAndTenant(studentId, tenantId);

    if (!updatedStudent) {
      notFound();
    }

    return mapStudentDetails(updatedStudent);
  },

  async disablePortalAccess(tenantId: string, studentId: string) {
    const student = await StudentRepository.findByIdAndTenant(studentId, tenantId);

    if (!student) {
      notFound();
    }

    if (!student.userId) {
      throw new StudentPortalAccessError("Este aluno ainda não possui uma conta de acesso criada.");
    }

    if (!student.portalAccessEnabled) {
      throw new StudentPortalAccessError("O acesso ao portal já está desativado para este aluno.");
    }

    await prisma.student.update({
      where: { id: student.id },
      data: {
        portalAccessEnabled: false
      }
    });

    const updatedStudent = await StudentRepository.findByIdAndTenant(studentId, tenantId);

    if (!updatedStudent) {
      notFound();
    }

    return mapStudentDetails(updatedStudent);
  },

  async reactivatePortalAccess(tenantId: string, studentId: string) {
    const student = await StudentRepository.findByIdAndTenant(studentId, tenantId);

    if (!student) {
      notFound();
    }

    if (!student.userId) {
      throw new StudentPortalAccessError("Este aluno ainda não possui uma conta de acesso criada.");
    }

    if (student.portalAccessEnabled) {
      throw new StudentPortalAccessError("O acesso ao portal já está habilitado para este aluno.");
    }

    await prisma.student.update({
      where: { id: student.id },
      data: {
        portalAccessEnabled: true
      }
    });

    const updatedStudent = await StudentRepository.findByIdAndTenant(studentId, tenantId);

    if (!updatedStudent) {
      notFound();
    }

    return mapStudentDetails(updatedStudent);
  },

  getFormValues(student?: StudentDetailsDto) {
    return mapStudentFormValues(student);
  }
};