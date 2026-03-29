"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EnableStudentPortalAccessSchema,
  type EnableStudentPortalAccessInput
} from "@/modules/students/schemas/student.schema";

type StudentPortalAccessFormProps = {
  studentName: string;
  hasPortalAccount: boolean;
  hasPortalAccess: boolean;
  portalAccessEmail: string | null;
  initialEmail: string;
  onEnableAction: (values: EnableStudentPortalAccessInput) => Promise<{
    success: boolean;
    message?: string;
    fieldErrors?: Record<string, string[] | undefined>;
  }>;
  onToggleAccessAction: () => Promise<{
    success: boolean;
    message?: string;
    fieldErrors?: Record<string, string[] | undefined>;
  }>;
};

export function StudentPortalAccessForm({
  studentName,
  hasPortalAccount,
  hasPortalAccess,
  portalAccessEmail,
  initialEmail,
  onEnableAction,
  onToggleAccessAction
}: StudentPortalAccessFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toggleErrorMessage, setToggleErrorMessage] = useState<string | null>(null);
  const [isPending, startFormTransition] = useTransition();
  const [isTogglePending, startToggleTransition] = useTransition();

  const form = useForm<EnableStudentPortalAccessInput>({
    resolver: zodResolver(EnableStudentPortalAccessSchema),
    defaultValues: {
      email: initialEmail,
      initialPassword: ""
    }
  });

  const onSubmit = form.handleSubmit((values) => {
    setErrorMessage(null);
    form.clearErrors();

    startFormTransition(async () => {
      const result = await onEnableAction(values);

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [fieldName, messages] of Object.entries(result.fieldErrors)) {
            const firstMessage = messages?.[0];
            if (firstMessage) {
              form.setError(fieldName as keyof EnableStudentPortalAccessInput, {
                type: "server",
                message: firstMessage
              });
            }
          }
        }

        setErrorMessage(result.message ?? "Não foi possível habilitar o acesso ao portal.");
      }
    });
  });

  const handleToggleAccess = () => {
    setToggleErrorMessage(null);

    startToggleTransition(async () => {
      const result = await onToggleAccessAction();

      if (!result.success) {
        setToggleErrorMessage(result.message ?? "Não foi possível atualizar o acesso ao portal.");
      }
    });
  };

  const badgeLabel = hasPortalAccess
    ? "Acesso habilitado"
    : hasPortalAccount
      ? "Acesso desativado"
      : "Sem acesso";

  return (
    <Card className="border-white/70 bg-white/90 shadow-sm backdrop-blur-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl">Acesso ao portal</CardTitle>
          <Badge variant={hasPortalAccess ? "default" : "outline"}>{badgeLabel}</Badge>
        </div>
        <p className="text-sm leading-6 text-slate-600">
          {!hasPortalAccount
            ? "Crie o primeiro acesso do aluno com e-mail e senha inicial. Depois disso, você poderá apenas ativar ou desativar esse acesso."
            : hasPortalAccess
              ? `${studentName} já pode entrar no portal do aluno usando as credenciais abaixo.`
              : `${studentName} já possui uma conta criada, mas o acesso ao portal está desativado no momento.`}
        </p>
      </CardHeader>
      <CardContent>
        {hasPortalAccount ? (
          <div className="space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-slate-500">E-mail de acesso</p>
              <p className="mt-2 font-medium text-slate-950">{portalAccessEmail ?? "Não informado"}</p>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 leading-6">
              {hasPortalAccess
                ? "Se precisar suspender o portal sem perder o vínculo do aluno, você pode desativar o acesso abaixo."
                : "Você pode reativar o acesso a qualquer momento sem recriar a conta do aluno."}
            </div>
            {toggleErrorMessage ? <p className="text-sm text-destructive">{toggleErrorMessage}</p> : null}
            <Button onClick={handleToggleAccess} type="button" variant={hasPortalAccess ? "outline" : "default"}>
              {isTogglePending
                ? hasPortalAccess
                  ? "Desativando..."
                  : "Reativando..."
                : hasPortalAccess
                  ? "Desativar acesso"
                  : "Reativar acesso"}
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="portal-email">E-mail do aluno</Label>
              <Input id="portal-email" type="email" {...form.register("email")} />
              <p className="text-xs text-destructive">{form.formState.errors.email?.message}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="portal-password">Senha inicial temporária</Label>
              <Input id="portal-password" type="password" {...form.register("initialPassword")} />
              <p className="text-xs text-slate-500">
                O aluno poderá usar essa senha inicial para acessar o portal neste MVP.
              </p>
              <p className="text-xs text-destructive">{form.formState.errors.initialPassword?.message}</p>
            </div>
            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
            <Button type="submit">{isPending ? "Habilitando..." : "Habilitar acesso"}</Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}