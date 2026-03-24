"use client";

import { useState, useTransition } from "react";
import { UserRole } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userRoleLabels } from "@/lib/enum-labels";
import {
  UpdateAdminUserSchema,
  type UpdateAdminUserInput
} from "@/modules/admin/users/schemas/admin-user.schema";

type AdminUserFormProps = {
  initialValues: UpdateAdminUserInput;
  onSubmitAction: (values: UpdateAdminUserInput) => Promise<{
    success: boolean;
    message?: string;
    fieldErrors?: Record<string, string[] | undefined>;
  }>;
};

export function AdminUserForm({ initialValues, onSubmitAction }: AdminUserFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startFormTransition] = useTransition();
  const form = useForm<UpdateAdminUserInput>({
    resolver: zodResolver(UpdateAdminUserSchema),
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
            form.setError(fieldName as keyof UpdateAdminUserInput, {
              type: "server",
              message: firstMessage
            });
          }
        }
      }

      setMessage(
        result.message ?? (result.success ? "Usuário atualizado com sucesso." : "Falhá ao atualizar.")
      );
    });
  });

  return (
    <Card className="border-white/70 bg-white/90 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Editar usuário</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...form.register("name")} />
            <p className="text-xs text-destructive">{form.formState.errors.name?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Perfil</Label>
            <select
              id="role"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...form.register("role")}
            >
              <option value={UserRole.ADMIN}>{userRoleLabels.ADMIN}</option>
              <option value={UserRole.PERSONAL}>{userRoleLabels.PERSONAL}</option>
              <option value={UserRole.STUDENT}>{userRoleLabels.STUDENT}</option>
            </select>
            <p className="text-xs text-slate-500">
              Altere perfis com cautela. O sistema sempre precisa manter ao menos um administrador.
            </p>
          </div>

          {message ? <p className="text-sm text-slate-600">{message}</p> : null}

          <Button type="submit">{isPending ? "Salvando..." : "Salvar usuário"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
