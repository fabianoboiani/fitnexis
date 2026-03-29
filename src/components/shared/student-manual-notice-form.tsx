"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CreateManualStudentNoticeSchema,
  type CreateManualStudentNoticeInput
} from "@/modules/student/notices/schemas/student-notice.schema";

type StudentManualNoticeFormProps = {
  onSubmitAction: (values: CreateManualStudentNoticeInput) => Promise<{
    success: boolean;
    message?: string;
    fieldErrors?: Record<string, string[] | undefined>;
  }>;
};

export function StudentManualNoticeForm({ onSubmitAction }: StudentManualNoticeFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateManualStudentNoticeInput>({
    resolver: zodResolver(CreateManualStudentNoticeSchema),
    defaultValues: {
      title: "",
      description: "",
      details: "",
      priority: "medium"
    }
  });

  const onSubmit = form.handleSubmit((values) => {
    setMessage(null);
    form.clearErrors();

    startTransition(async () => {
      const result = await onSubmitAction(values);

      if (!result.success) {
        if (result.fieldErrors) {
          for (const [fieldName, messages] of Object.entries(result.fieldErrors)) {
            const firstMessage = messages?.[0];
            if (firstMessage) {
              form.setError(fieldName as keyof CreateManualStudentNoticeInput, {
                type: "server",
                message: firstMessage
              });
            }
          }
        }

        setMessage(result.message ?? "Não foi possível enviar o comunicado.");
        return;
      }

      form.reset({
        title: "",
        description: "",
        details: "",
        priority: "medium"
      });
      setMessage(result.message ?? "Comunicado enviado ao aluno.");
    });
  });

  return (
    <Card className="border-white/70 bg-white/90 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">Comunicado manual</CardTitle>
        <p className="text-sm leading-6 text-slate-600">
          Envie um aviso direto para a central do aluno quando precisar orientar, alinhar ou reforçar alguma informação importante.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="manual-notice-title">Título</Label>
            <Input id="manual-notice-title" {...form.register("title")} />
            <p className="text-xs text-destructive">{form.formState.errors.title?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-notice-description">Resumo</Label>
            <Input id="manual-notice-description" {...form.register("description")} />
            <p className="text-xs text-destructive">{form.formState.errors.description?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-notice-priority">Prioridade</Label>
            <select
              id="manual-notice-priority"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...form.register("priority")}
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
            <p className="text-xs text-slate-500">Use alta prioridade apenas para algo que precise de atenção mais rápida.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-notice-details">Detalhes</Label>
            <Textarea id="manual-notice-details" rows={5} {...form.register("details")} />
            <p className="text-xs text-destructive">{form.formState.errors.details?.message}</p>
          </div>

          {message ? <p className="text-sm text-slate-600">{message}</p> : null}

          <Button type="submit">{isPending ? "Enviando..." : "Enviar comunicado"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}