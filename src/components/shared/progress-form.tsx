"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ProgressRecordFormSchema,
  type ProgressRecordFormInput
} from "@/modules/progress/schemas/progress.schema";

type ProgressFormProps = {
  title: string;
  description?: string;
  submitLabel: string;
  cancelHref: string;
  initialValues: ProgressRecordFormInput;
  studentOptions: Array<{ id: string; name: string }>;
  onSubmitAction: (values: ProgressRecordFormInput) => Promise<{
    success: boolean;
    message?: string;
    fieldErrors?: Record<string, string[] | undefined>;
  }>;
};

export function ProgressForm({
  title,
  description,
  submitLabel,
  cancelHref,
  initialValues,
  studentOptions,
  onSubmitAction
}: ProgressFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startFormTransition] = useTransition();

  const form = useForm<ProgressRecordFormInput>({
    resolver: zodResolver(ProgressRecordFormSchema),
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
              form.setError(fieldName as keyof ProgressRecordFormInput, {
                type: "server",
                message: firstMessage
              });
            }
          }
        }

        setErrorMessage(result.message ?? "N?o foi poss?vel salvar a evolu??o.");
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
            <Label htmlFor="recordedAt">Data do registro</Label>
            <Input id="recordedAt" type="date" {...form.register("recordedAt")} />
            <p className="text-xs text-destructive">{form.formState.errors.recordedAt?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input id="weight" type="number" step="0.01" min="0" {...form.register("weight")} />
            <p className="text-xs text-destructive">{form.formState.errors.weight?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bodyFat">Gordura corporal (%)</Label>
            <Input id="bodyFat" type="number" step="0.01" min="0" {...form.register("bodyFat")} />
            <p className="text-xs text-destructive">{form.formState.errors.bodyFat?.message}</p>
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
              <Link href={cancelHref}>Cancelar</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
