"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTenant } from "@/lib/tenant";
import { StudentService } from "@/modules/students/services/student.service";
import {
  CreateStudentSchema,
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
  redirect(`/students/${studentId}?success=updated`);
}
