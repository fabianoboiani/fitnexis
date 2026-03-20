"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UpdateAdminTenantSchema,
  type UpdateAdminTenantInput
} from "@/modules/admin/tenants/schemas/admin-tenant.schema";

type AdminTenantProfileFormProps = {
  initialValues: UpdateAdminTenantInput;
  onSubmitAction: (values: UpdateAdminTenantInput) => Promise<{
    success: boolean;
    message?: string;
    fieldErrors?: Record<string, string[] | undefined>;
  }>;
};

export function AdminTenantProfileForm({
  initialValues,
  onSubmitAction
}: AdminTenantProfileFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startFormTransition] = useTransition();
  const form = useForm<UpdateAdminTenantInput>({
    resolver: zodResolver(UpdateAdminTenantSchema),
    defaultValues: initialValues
  });

  const onSubmit = form.handleSubmit((values) => {
    setMessage(null);
    form.clearErrors();

    startFormTransition(async () => {
      const result = await onSubmitAction(values);

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [fieldName, messages] of Object.entries(result.fieldErrors)) {
            const firstMessage = messages?.[0];
            if (firstMessage) {
              form.setError(fieldName as keyof UpdateAdminTenantInput, {
                type: "server",
                message: firstMessage
              });
            }
          }
        }

        setMessage(result.message ?? "N?o foi poss?vel atualizar o tenant.");
        return;
      }

      setMessage(result.message ?? "Tenant atualizado com sucesso.");
    });
  });

  return (
    <Card className="border-white/70 bg-white/90 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Editar tenant</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="businessName">Nome do neg?cio</Label>
            <Input id="businessName" {...form.register("businessName")} />
            <p className="text-xs text-destructive">
              {form.formState.errors.businessName?.message}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personalName">Nome do personal</Label>
            <Input id="personalName" {...form.register("personalName")} />
            <p className="text-xs text-destructive">
              {form.formState.errors.personalName?.message}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...form.register("email")} />
            <p className="text-xs text-destructive">{form.formState.errors.email?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" {...form.register("phone")} />
            <p className="text-xs text-destructive">{form.formState.errors.phone?.message}</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="isActive">Situacao operacional</Label>
            <select
              id="isActive"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...form.register("isActive")}
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>

          {message ? <p className="text-sm text-slate-600 md:col-span-2">{message}</p> : null}

          <div className="md:col-span-2">
            <Button type="submit">{isPending ? "Salvando..." : "Salvar tenant"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
