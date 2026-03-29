"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTenant } from "@/lib/tenant";
import {
  StudentPortalAccessError,
  StudentService
} from "@/modules/students/services/student.service";
import {
  CreateStudentSchema,
  EnableStudentPortalAccessSchema,
  type EnableStudentPortalAccessInput,
  type StudentFormInput,
  UpdateStudentSchema
} from "@/modules/students/schemas/student.schema";

type StudentActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createStudentAction(input: StudentFormInput): Promise<StudentActionState> {
  const tenant = await requireTenant();
  const parsed = CreateStudentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revise os campos do aluno.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  await StudentService.create(tenant.id, parsed.data);
  revalidatePath("/students");
  redirect("/students?success=created");
}

export async function updateStudentAction(
  studentId: string,
  input: StudentFormInput
): Promise<StudentActionState> {
  const tenant = await requireTenant();
  const parsed = UpdateStudentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revise os campos do aluno.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  await StudentService.update(tenant.id, studentId, parsed.data);
  revalidatePath("/students");
  revalidatePath(`/students/${studentId}`);
  revalidatePath("/student");
  revalidatePath("/student/profile");
  redirect(`/students/${studentId}?success=updated`);
}

export async function enableStudentPortalAccessAction(
  studentId: string,
  input: EnableStudentPortalAccessInput
): Promise<StudentActionState> {
  const tenant = await requireTenant();
  const parsed = EnableStudentPortalAccessSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revise os dados de acesso ao portal.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    await StudentService.enablePortalAccess(tenant.id, studentId, parsed.data);
  } catch (error) {
    if (error instanceof StudentPortalAccessError) {
      return {
        success: false,
        message: error.message
      };
    }

    throw error;
  }

  revalidatePath("/students");
  revalidatePath(`/students/${studentId}`);
  revalidatePath("/student");
  revalidatePath("/student/profile");
  redirect(`/students/${studentId}?success=portal-access-enabled`);
}

export async function disableStudentPortalAccessAction(studentId: string): Promise<StudentActionState> {
  const tenant = await requireTenant();

  try {
    await StudentService.disablePortalAccess(tenant.id, studentId);
  } catch (error) {
    if (error instanceof StudentPortalAccessError) {
      return {
        success: false,
        message: error.message
      };
    }

    throw error;
  }

  revalidatePath("/students");
  revalidatePath(`/students/${studentId}`);
  revalidatePath("/student");
  revalidatePath("/student/profile");
  redirect(`/students/${studentId}?success=portal-access-disabled`);
}

export async function reactivateStudentPortalAccessAction(studentId: string): Promise<StudentActionState> {
  const tenant = await requireTenant();

  try {
    await StudentService.reactivatePortalAccess(tenant.id, studentId);
  } catch (error) {
    if (error instanceof StudentPortalAccessError) {
      return {
        success: false,
        message: error.message
      };
    }

    throw error;
  }

  revalidatePath("/students");
  revalidatePath(`/students/${studentId}`);
  revalidatePath("/student");
  revalidatePath("/student/profile");
  redirect(`/students/${studentId}?success=portal-access-enabled`);
}