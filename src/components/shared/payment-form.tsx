"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PaymentFormSchema,
  type PaymentFormInput
} from "@/modules/payments/schemas/payment.schema";

type PaymentFormProps = {
  title: string;
  description?: string;
  submitLabel: string;
  initialValues: PaymentFormInput;
  studentOptions: Array<{ id: string; name: string }>;
  onSubmitAction: (values: PaymentFormInput) => Promise<{
    success: boolean;
    message?: string;
    fieldErrors?: Record<string, string[] | undefined>;
  }>;
};

const statusOptions: Array<{ value: PaymentStatus; label: string }> = [
  { value: PaymentStatus.PENDING, label: "Pendente" },
  { value: PaymentStatus.PAID, label: "Pago" },
  { value: PaymentStatus.OVERDUE, label: "Vencido" },
  { value: PaymentStatus.CANCELED, label: "Cancelado" }
];

const paymentMethodOptions: Array<{ value: PaymentMethod | ""; label: string }> = [
  { value: "", label: "Não informado" },
  { value: PaymentMethod.PIX, label: "PIX" },
  { value: PaymentMethod.CASH, label: "Dinheiro" },
  { value: PaymentMethod.CARD, label: "Cartão" },
  { value: PaymentMethod.TRANSFER, label: "Transferência" },
  { value: PaymentMethod.OTHER, label: "Outro" }
];

export function PaymentForm({
  title,
  description,
  submitLabel,
  initialValues,
  studentOptions,
  onSubmitAction
}: PaymentFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startFormTransition] = useTransition();

  const form = useForm<PaymentFormInput>({
    resolver: zodResolver(PaymentFormSchema),
    defaultValues: initialValues
  });

  const selectedStatus = form.watch("status");

  const onSubmit = form.handleSubmit((values) => {
    setErrorMessage(null);
    form.clearErrors();

    startFormTransition(async () => {
      const result = await onSubmitAction(values);

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [fieldName, messages] of Object.entries(result.fieldErrors)) {
            const firstMessage = messages?.[0];
            if (firstMessage) {
              form.setError(fieldName as keyof PaymentFormInput, {
                type: "server",
                message: firstMessage
              });
            }
          }
        }

        setErrorMessage(result.message ?? "Não foi possível salvar o pagamento.");
      }
    });
  });

  return (
    <Card className="border-white/70 bg-white/90 shadow-sm backdrop-blur-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl text-slate-950">{title}</CardTitle>
        {description ? <p className="text-sm leading-6 text-slate-600">{description}</p> : null}
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="studentId">Aluno</Label>
            <select
              id="studentId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...form.register("studentId")}
            >
              <option value="">Selecione um aluno</option>
              {studentOptions.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-destructive">{form.formState.errors.studentId?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input id="amount" type="number" step="0.01" min="0" {...form.register("amount")} />
            <p className="text-xs text-destructive">{form.formState.errors.amount?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Vencimento</Label>
            <Input id="dueDate" type="date" {...form.register("dueDate")} />
            <p className="text-xs text-destructive">{form.formState.errors.dueDate?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...form.register("status")}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-destructive">{form.formState.errors.status?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Forma de pagamento</Label>
            <select
              id="paymentMethod"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...form.register("paymentMethod")}
            >
              {paymentMethodOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-destructive">{form.formState.errors.paymentMethod?.message}</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="paidAt">Data de pagamento</Label>
            <Input
              id="paidAt"
              type="date"
              disabled={selectedStatus !== PaymentStatus.PAID}
              {...form.register("paidAt")}
            />
            <p className="text-xs text-slate-500">
              Se o status estiver como pago e a data ficar vazia, o sistema usará a data atual.
            </p>
            <p className="text-xs text-destructive">{form.formState.errors.paidAt?.message}</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" {...form.register("notes")} />
            <p className="text-xs text-destructive">{form.formState.errors.notes?.message}</p>
          </div>

          {errorMessage ? (
            <p className="text-sm text-destructive md:col-span-2">{errorMessage}</p>
          ) : null}

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <Button type="submit">{isPending ? "Salvando..." : submitLabel}</Button>
            <Button asChild type="button" variant="outline">
              <Link href="/payments">Cancelar</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}