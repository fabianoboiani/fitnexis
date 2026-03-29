"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentStudent } from "@/lib/student";
import { requireTenant } from "@/lib/tenant";
import {
  StudentNoticeError,
  StudentNoticeService
} from "@/modules/student/notices/services/student-notice.service";
import {
  CreateManualStudentNoticeSchema,
  type CreateManualStudentNoticeInput
} from "@/modules/student/notices/schemas/student-notice.schema";

type StudentNoticeActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function markStudentNoticeAsReadAction(noticeId: string): Promise<StudentNoticeActionState> {
  const student = await requireCurrentStudent();

  try {
    await StudentNoticeService.markAsRead(student.id, noticeId);
  } catch (error) {
    if (error instanceof StudentNoticeError) {
      return {
        success: false,
        message: error.message
      };
    }

    throw error;
  }

  revalidatePath("/student");
  revalidatePath("/student/notices");

  return {
    success: true,
    message: "Aviso marcado como lido."
  };
}

export async function createManualStudentNoticeAction(
  studentId: string,
  input: CreateManualStudentNoticeInput
): Promise<StudentNoticeActionState> {
  const tenant = await requireTenant();
  const parsed = CreateManualStudentNoticeSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revise os dados do comunicado.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    await StudentNoticeService.createManualNoticeForStudent(tenant.id, studentId, parsed.data);
  } catch (error) {
    if (error instanceof StudentNoticeError) {
      return {
        success: false,
        message: error.message
      };
    }

    throw error;
  }

  revalidatePath(`/students/${studentId}`);
  revalidatePath("/student");
  revalidatePath("/student/notices");

  return {
    success: true,
    message: "Comunicado enviado ao aluno."
  };
}