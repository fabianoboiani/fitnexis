"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UpdateTenantProfileSchema,
  type UpdateTenantProfileInput
} from "@/modules/settings/schemas/profile-settings.schema";

type SettingsProfileFormProps = {
  initialValues: UpdateTenantProfileInput;
  onSubmitAction: (values: UpdateTenantProfileInput) => Promise<{
    success: boolean;
    message?: string;
    fieldErrors?: Record<string, string[] | undefined>;
  }>;
};

export function SettingsProfileForm({
  initialValues,
  onSubmitAction
}: SettingsProfileFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startFormTransition] = useTransition();

  const form = useForm<UpdateTenantProfileInput>({
    resolver: zodResolver(UpdateTenantProfileSchema),
    defaultValues: initialValues
  });

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
              form.setError(fieldName as keyof UpdateTenantProfileInput, {
                type: "server",
                message: firstMessage
              });
            }
          }
        }

        setErrorMessage(result.message ?? "N?o foi poss?vel salvar o perfil.");
      }
    });
  });

  return (
    <Card className="border-white/70 bg-white/90 shadow-sm">
      <CardHeader>
        <CardTitle>Perfil do personal</CardTitle>
        <p className="text-sm text-slate-500">
          Esses dados sao lidos e atualizados diretamente no Tenant autenticado.
        </p>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="personalName">Nome do personal</Label>
            <Input id="personalName" {...form.register("personalName")} />
            <p className="text-xs text-destructive">
              {form.formState.errors.personalName?.message}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessName">Nome do neg?cio</Label>
            <Input id="businessName" {...form.register("businessName")} />
            <p className="text-xs text-destructive">
              {form.formState.errors.businessName?.message}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" {...form.register("phone")} />
            <p className="text-xs text-destructive">{form.formState.errors.phone?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...form.register("email")} />
            <p className="text-xs text-destructive">{form.formState.errors.email?.message}</p>
          </div>

          {errorMessage ? (
            <p className="text-sm text-destructive md:col-span-2">{errorMessage}</p>
          ) : null}

          <div className="md:col-span-2">
            <Button type="submit">{isPending ? "Salvando..." : "Salvar altera??es"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
