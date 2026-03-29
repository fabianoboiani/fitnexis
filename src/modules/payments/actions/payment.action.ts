"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTenant } from "@/lib/tenant";
import { PaymentService } from "@/modules/payments/services/payment.service";
import { StudentNoticeService } from "@/modules/student/notices/services/student-notice.service";
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
  return error instanceof Error ? error.message : "Não foi possível salvar o pagamento.";
}

function revalidatePaymentViews() {
  revalidatePath("/payments");
  revalidatePath("/student");
  revalidatePath("/student/notices");
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
    const payment = await PaymentService.create(tenant.id, parsed.data);
    await StudentNoticeService.syncPaymentNoticeById(payment.id);
  } catch (error) {
    return {
      success: false,
      message: mapActionError(error)
    };
  }

  revalidatePaymentViews();
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
    await StudentNoticeService.syncPaymentNoticeById(paymentId);
  } catch (error) {
    return {
      success: false,
      message: mapActionError(error)
    };
  }

  revalidatePaymentViews();
  redirect("/payments?success=updated");
}

export async function markPaymentAsPaidAction(paymentId: string, paidAt?: string) {
  const tenant = await requireTenant();
  await PaymentService.markAsPaid(tenant.id, paymentId, paidAt);
  await StudentNoticeService.syncPaymentNoticeById(paymentId);
  revalidatePaymentViews();
  redirect("/payments?success=paid");
}

export async function markPaymentAsPaidNowAction(paymentId: string, _formData: FormData) {
  const tenant = await requireTenant();
  await PaymentService.markAsPaid(tenant.id, paymentId);
  await StudentNoticeService.syncPaymentNoticeById(paymentId);
  revalidatePaymentViews();
  redirect("/payments?success=paid");
}

