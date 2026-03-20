"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTenant } from "@/lib/tenant";
import { ProgressService } from "@/modules/progress/services/progress.service";
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
      message: "Revise os campos da evolu??o.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    await ProgressService.create(tenant.id, parsed.data);
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "N?o foi poss?vel salvar a evolu??o."
    };
  }

  revalidatePath("/progress");
  revalidatePath(`/students/${parsed.data.studentId}/progress`);
  redirect(`/students/${parsed.data.studentId}/progress?success=created`);
}
