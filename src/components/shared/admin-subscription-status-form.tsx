"use client";

import { useState, useTransition } from "react";
import { SubscriptionStatus } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { subscriptionStatusLabels } from "@/lib/enum-labels";
import {
  UpdateAdminSubscriptionSchema,
  type UpdateAdminSubscriptionInput
} from "@/modules/admin/tenants/schemas/admin-tenant.schema";

type AdminSubscriptionStatusFormProps = {
  initialValues: UpdateAdminSubscriptionInput;
  onSubmitAction: (values: UpdateAdminSubscriptionInput) => Promise<{
    success: boolean;
    message?: string;
    fieldErrors?: Record<string, string[] | undefined>;
  }>;
};

export function AdminSubscriptionStatusForm({
  initialValues,
  onSubmitAction
}: AdminSubscriptionStatusFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startFormTransition] = useTransition();
  const form = useForm<UpdateAdminSubscriptionInput>({
    resolver: zodResolver(UpdateAdminSubscriptionSchema),
    defaultValues: initialValues
  });

  const onSubmit = form.handleSubmit((values) => {
    setMessage(null);

    startFormTransition(async () => {
      const result = await onSubmitAction(values);
      setMessage(result.message ?? (result.success ? "Assinatura atualizada." : "Falha ao atualizar."));
    });
  });

  return (
    <Card className="border-white/70 bg-white/90 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Assinatura</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="status">Status atual</Label>
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

          {message ? <p className="text-sm text-slate-600">{message}</p> : null}

          <Button type="submit">{isPending ? "Salvando..." : "Atualizar assinatura"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
