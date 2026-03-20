"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTenant } from "@/lib/tenant";
import { AppointmentService } from "@/modules/appointments/services/appointment.service";
import {
  CreateAppointmentSchema,
  type AppointmentFormInput,
  UpdateAppointmentSchema
} from "@/modules/appointments/schemas/appointment.schema";

type AppointmentActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function mapActionError(error: unknown) {
  return error instanceof Error ? error.message : "N?o foi poss?vel salvar o compromisso.";
}

export async function createAppointmentAction(
  input: AppointmentFormInput
): Promise<AppointmentActionState> {
  const tenant = await requireTenant();
  const parsed = CreateAppointmentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revise os campos do compromisso.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    await AppointmentService.create(tenant.id, parsed.data);
  } catch (error) {
    return {
      success: false,
      message: mapActionError(error)
    };
  }

  revalidatePath("/appointments");
  redirect("/appointments?success=created");
}

export async function updateAppointmentAction(
  appointmentId: string,
  input: AppointmentFormInput
): Promise<AppointmentActionState> {
  const tenant = await requireTenant();
  const parsed = UpdateAppointmentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revise os campos do compromisso.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    await AppointmentService.update(tenant.id, appointmentId, parsed.data);
  } catch (error) {
    return {
      success: false,
      message: mapActionError(error)
    };
  }

  revalidatePath("/appointments");
  redirect("/appointments?success=updated");
}

export async function cancelAppointmentAction(appointmentId: string, _formData: FormData) {
  const tenant = await requireTenant();
  await AppointmentService.cancel(tenant.id, appointmentId);
  revalidatePath("/appointments");
  redirect("/appointments?success=canceled");
}
