"use client";

import { useState, useTransition } from "react";
import { startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StudentStatus } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  StudentFormSchema,
  type StudentFormInput
} from "@/modules/students/schemas/student.schema";

type StudentFormProps = {
  title: string;
  description?: string;
  submitLabel: string;
  initialValues: StudentFormInput;
  onSubmitAction: (values: StudentFormInput) => Promise<{
    success: boolean;
    message?: string;
    fieldErrors?: Record<string, string[] | undefined>;
  }>;
};

const statusOptions: Array<{ value: StudentStatus; label: string }> = [
  { value: StudentStatus.ACTIVE, label: "Ativo" },
  { value: StudentStatus.PAUSED, label: "Pausado" },
  { value: StudentStatus.DELINQUENT, label: "Inadimplente" },
  { value: StudentStatus.INACTIVE, label: "Inativo" }
];

export function StudentForm({
  title,
  description,
  submitLabel,
  initialValues,
  onSubmitAction
}: StudentFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startFormTransition] = useTransition();

  const form = useForm<StudentFormInput>({
    resolver: zodResolver(StudentFormSchema),
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
              form.setError(fieldName as keyof StudentFormInput, {
                type: "server",
                message: firstMessage
              });
            }
          }
        }

        setErrorMessage(result.message ?? "N?o foi poss?vel salvar o aluno.");
        return;
      }

      startTransition(() => {
        router.refresh();
      });
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
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...form.register("name")} />
            <p className="text-xs text-destructive">{form.formState.errors.name?.message}</p>
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

          <div className="space-y-2">
            <Label htmlFor="birthDate">Data de nascimento</Label>
            <Input id="birthDate" type="date" {...form.register("birthDate")} />
            <p className="text-xs text-destructive">{form.formState.errors.birthDate?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
            <Label htmlFor="goal">Meta</Label>
            <Input id="goal" {...form.register("goal")} />
            <p className="text-xs text-destructive">{form.formState.errors.goal?.message}</p>
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
              <Link href="/students">Cancelar</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
