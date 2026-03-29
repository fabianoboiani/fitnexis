"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentStudent } from "@/lib/student";
import {
  StudentPortalService,
  StudentProfileError
} from "@/modules/student/services/student-portal.service";
import {
  ChangeStudentPasswordSchema,
  type ChangeStudentPasswordInput,
  UpdateStudentProfileSchema,
  type UpdateStudentProfileInput
} from "@/modules/student/schemas/student-profile.schema";

type StudentProfileActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function updateStudentProfileAction(
  input: UpdateStudentProfileInput
): Promise<StudentProfileActionState> {
  const student = await requireCurrentStudent();
  const parsed = UpdateStudentProfileSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revise os dados do perfil.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    await StudentPortalService.updateProfile(student.id, parsed.data);
  } catch (error) {
    if (error instanceof StudentProfileError) {
      return {
        success: false,
        message: error.message
      };
    }

    throw error;
  }

  revalidatePath("/student");
  revalidatePath("/student/profile");
  return {
    success: true,
    message: "Perfil atualizado com sucesso."
  };
}

export async function changeStudentPasswordAction(
  input: ChangeStudentPasswordInput
): Promise<StudentProfileActionState> {
  const student = await requireCurrentStudent();
  const parsed = ChangeStudentPasswordSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revise os dados da senha.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    await StudentPortalService.changePassword(student.id, parsed.data);
  } catch (error) {
    if (error instanceof StudentProfileError) {
      return {
        success: false,
        message: error.message
      };
    }

    throw error;
  }

  return {
    success: true,
    message: "Senha atualizada com sucesso."
  };
}