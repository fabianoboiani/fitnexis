"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Building2, UserCircle2 } from "lucide-react";
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startFormTransition] = useTransition();

  const form = useForm<UpdateTenantProfileInput>({
    resolver: zodResolver(UpdateTenantProfileSchema),
    defaultValues: initialValues
  });

  const onSubmit = form.handleSubmit((values) => {
    setErrorMessage(null);
    setSuccessMessage(null);
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

        setErrorMessage(result.message ?? "Não foi possível salvar o perfil.");
        return;
      }

      setSuccessMessage(result.message ?? "Perfil atualizado com sucesso.");
    });
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="rounded-[1.9rem] border-white/70 bg-white/95 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.35)]">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <UserCircle2 className="size-5" />
            </div>
            <div>
              <CardTitle className="text-2xl tracking-tight text-slate-950">Perfil do personal</CardTitle>
              <p className="text-sm text-slate-500">
                Esses dados são lidos e atualizados diretamente no tenant autenticado.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="personalName">Nome do personal</Label>
              <Input id="personalName" {...form.register("personalName")} />
              <p className="text-xs text-destructive">{form.formState.errors.personalName?.message}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Nome do negócio</Label>
              <Input id="businessName" {...form.register("businessName")} />
              <p className="text-xs text-destructive">{form.formState.errors.businessName?.message}</p>
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

            {errorMessage ? <p className="text-sm text-destructive md:col-span-2">{errorMessage}</p> : null}
            {successMessage ? <p className="text-sm text-emerald-600 md:col-span-2">{successMessage}</p> : null}

            <div className="md:col-span-2">
              <Button type="submit">{isPending ? "Salvando..." : "Salvar alterações"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-[1.9rem] border-white/70 bg-white/95 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.35)]">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
              <Building2 className="size-5" />
            </div>
            <div>
              <CardTitle className="text-2xl tracking-tight text-slate-950">Resumo operacional</CardTitle>
              <p className="text-sm text-slate-500">
                Uma visão rápida dos dados institucionais usados na sua operação atual.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/70 px-4 py-4">
            <p className="text-slate-500">Nome do negócio</p>
            <p className="mt-2 font-medium text-slate-950">{initialValues.businessName}</p>
          </div>
          <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/70 px-4 py-4">
            <p className="text-slate-500">Contato principal</p>
            <p className="mt-2 font-medium text-slate-950">{initialValues.email}</p>
            <p className="mt-1 text-slate-500">{initialValues.phone || "Telefone não informado"}</p>
          </div>
          <div className="rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-4 leading-6">
            Estes dados alimentam o tenant atual e ajudam a manter a identidade do seu atendimento consistente em todo o produto.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}