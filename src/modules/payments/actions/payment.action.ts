"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTenant } from "@/lib/tenant";
import { PaymentService } from "@/modules/payments/services/payment.service";
import {
  CreatePaymentSchema,
  type PaymentFormInput,
  UpdatePaymentSchema
} from "@/modules/payments/schemas/payment.schema";

type PaymentActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function mapActionError(error: unknown) {
  return error instanceof Error ? error.message : "N?o foi poss?vel salvar o pagamento.";
}

export async function createPaymentAction(input: PaymentFormInput): Promise<PaymentActionState> {
  const tenant = await requireTenant();
  const parsed = CreatePaymentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revise os campos do pagamento.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    await PaymentService.create(tenant.id, parsed.data);
  } catch (error) {
    return {
      success: false,
      message: mapActionError(error)
    };
  }

  revalidatePath("/payments");
  redirect("/payments?success=created");
}

export async function updatePaymentAction(
  paymentId: string,
  input: PaymentFormInput
): Promise<PaymentActionState> {
  const tenant = await requireTenant();
  const parsed = UpdatePaymentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Revise os campos do pagamento.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    await PaymentService.update(tenant.id, paymentId, parsed.data);
  } catch (error) {
    return {
      success: false,
      message: mapActionError(error)
    };
  }

  revalidatePath("/payments");
  redirect("/payments?success=updated");
}

export async function markPaymentAsPaidAction(paymentId: string, paidAt?: string) {
  const tenant = await requireTenant();
  await PaymentService.markAsPaid(tenant.id, paymentId, paidAt);
  revalidatePath("/payments");
  redirect("/payments?success=paid");
}

export async function markPaymentAsPaidNowAction(paymentId: string, _formData: FormData) {
  const tenant = await requireTenant();
  await PaymentService.markAsPaid(tenant.id, paymentId);
  revalidatePath("/payments");
  redirect("/payments?success=paid");
}
