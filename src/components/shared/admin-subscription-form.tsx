"use client";

import { useState, useTransition } from "react";
import { SubscriptionStatus } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { subscriptionStatusLabels } from "@/lib/enum-labels";
import {
  UpdateAdminSubscriptionSchema,
  type UpdateAdminSubscriptionInput
} from "@/modules/admin/subscriptions/schemas/admin-subscription.schema";

type AdminSubscriptionFormProps = {
  initialValues: UpdateAdminSubscriptionInput;
  onSubmitAction: (values: UpdateAdminSubscriptionInput) => Promise<{
    success: boolean;
    message?: string;
    fieldErrors?: Record<string, string[] | undefined>;
  }>;
};

export function AdminSubscriptionForm({
  initialValues,
  onSubmitAction
}: AdminSubscriptionFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startFormTransition] = useTransition();
  const form = useForm<UpdateAdminSubscriptionInput>({
    resolver: zodResolver(UpdateAdminSubscriptionSchema),
    defaultValues: initialValues
  });

  const onSubmit = form.handleSubmit((values) => {
    setMessage(null);
    form.clearErrors();

    startFormTransition(async () => {
      const result = await onSubmitAction(values);

      if (!result.success && result.fieldErrors) {
        for (const [fieldName, messages] of Object.entries(result.fieldErrors)) {
          const firstMessage = messages?.[0];
          if (firstMessage) {
            form.setError(fieldName as keyof UpdateAdminSubscriptionInput, {
              type: "server",
              message: firstMessage
            });
          }
        }
      }

      setMessage(
        result.message ??
          (result.success ? "Assinatura atualizada com sucesso." : "Falha ao atualizar.")
      );
    });
  });

  return (
    <Card className="border-white/70 bg-white/90 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Editar assinatura</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="planName">Plano</Label>
            <Input id="planName" {...form.register("planName")} />
            <p className="text-xs text-destructive">{form.formState.errors.planName?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...form.register("status")}
            >
              <option value={SubscriptionStatus.TRIAL}>{subscriptionStatusLabels.TRIAL}</option>
              <option value={SubscriptionStatus.ACTIVE}>{subscriptionStatusLabels.ACTIVE}</option>
              <option value={SubscriptionStatus.PAST_DUE}>{subscriptionStatusLabels.PAST_DUE}</option>
              <option value={SubscriptionStatus.CANCELED}>{subscriptionStatusLabels.CANCELED}</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentPeriodEnd">Fim do per?odo atual</Label>
            <Input id="currentPeriodEnd" type="date" {...form.register("currentPeriodEnd")} />
            <p className="text-xs text-destructive">
              {form.formState.errors.currentPeriodEnd?.message}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stripeCustomerId">Stripe customer ID</Label>
            <Input id="stripeCustomerId" {...form.register("stripeCustomerId")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stripeSubscriptionId">Stripe subscription ID</Label>
            <Input id="stripeSubscriptionId" {...form.register("stripeSubscriptionId")} />
          </div>

          {message ? <p className="text-sm text-slate-600">{message}</p> : null}

          <Button type="submit">{isPending ? "Salvando..." : "Salvar altera??es"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
