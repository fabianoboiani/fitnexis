"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTenant } from "@/lib/tenant";
import { ProgressService } from "@/modules/progress/services/progress.service";
import { StudentNoticeService } from "@/modules/student/notices/services/student-notice.service";
import {
  CreateProgressRecordSchema,
  type ProgressRecordFormInput
} from "@/modules/progress/schemas/progress.schema";

type ProgressActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createProgressRecordAction(
  input: ProgressRecordFormInput
): Promise<ProgressActionState> {
  const tenant = await requireTenant();
  const parsed = CreateProgressRecordSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revise os campos da evolução.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    const progressRecord = await ProgressService.create(tenant.id, parsed.data);
    await StudentNoticeService.syncProgressNoticeById(progressRecord.id);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Não foi possível salvar a evolução."
    };
  }

  revalidatePath("/progress");
  revalidatePath(`/students/${parsed.data.studentId}/progress`);
  revalidatePath("/student");
  revalidatePath("/student/progress");
  revalidatePath("/student/notices");
  redirect(`/students/${parsed.data.studentId}/progress?success=created`);
}

