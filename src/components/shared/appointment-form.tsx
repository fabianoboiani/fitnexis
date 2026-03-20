"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AppointmentStatus } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AppointmentFormSchema,
  type AppointmentFormInput
} from "@/modules/appointments/schemas/appointment.schema";

type AppointmentFormProps = {
  title: string;
  description?: string;
  submitLabel: string;
  initialValues: AppointmentFormInput;
  studentOptions: Array<{ id: string; name: string }>;
  onSubmitAction: (values: AppointmentFormInput) => Promise<{
    success: boolean;
    message?: string;
    fieldErrors?: Record<string, string[] | undefined>;
  }>;
};

const statusOptions: Array<{ value: AppointmentStatus; label: string }> = [
  { value: AppointmentStatus.SCHEDULED, label: "Agendado" },
  { value: AppointmentStatus.COMPLETED, label: "Concluido" },
  { value: AppointmentStatus.CANCELED, label: "Cancelado" },
  { value: AppointmentStatus.MISSED, label: "Faltou" }
];

export function AppointmentForm({
  title,
  description,
  submitLabel,
  initialValues,
  studentOptions,
  onSubmitAction
}: AppointmentFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startFormTransition] = useTransition();

  const form = useForm<AppointmentFormInput>({
    resolver: zodResolver(AppointmentFormSchema),
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
              form.setError(fieldName as keyof AppointmentFormInput, {
                type: "server",
                message: firstMessage
              });
            }
          }
        }

        setErrorMessage(result.message ?? "N?o foi poss?vel salvar o compromisso.");
      }
    });
  });

  return (
    <Card className="border-white/70 bg-white/90 shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <p className="text-sm text-slate-500">{description}</p> : null}
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="studentId">Aluno</Label>
            <select
              id="studentId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">T?tulo</Label>
            <Input id="title" {...form.register("title")} />
            <p className="text-xs text-destructive">{form.formState.errors.title?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startsAt">Inicio</Label>
            <Input id="startsAt" type="datetime-local" {...form.register("startsAt")} />
            <p className="text-xs text-destructive">{form.formState.errors.startsAt?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endsAt">Fim</Label>
            <Input id="endsAt" type="datetime-local" {...form.register("endsAt")} />
            <p className="text-xs text-destructive">{form.formState.errors.endsAt?.message}</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Observa??es</Label>
            <Textarea id="notes" {...form.register("notes")} />
            <p className="text-xs text-destructive">{form.formState.errors.notes?.message}</p>
          </div>

          {errorMessage ? (
            <p className="text-sm text-destructive md:col-span-2">{errorMessage}</p>
          ) : null}

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <Button type="submit">{isPending ? "Salvando..." : submitLabel}</Button>
            <Button asChild type="button" variant="outline">
              <Link href="/appointments">Cancelar</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
