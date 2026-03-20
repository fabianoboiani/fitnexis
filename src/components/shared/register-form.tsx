"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BRAND_COPY } from "@/lib/branding";
import { registerAction } from "@/modules/auth/actions/register.action";
import {
  RegisterSchema,
  type RegisterInput
} from "@/modules/auth/schemas/register.schema";

export function RegisterForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      businessName: "",
      phone: "",
      email: "",
      password: ""
    }
  });

  const onSubmit = form.handleSubmit((values) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    form.clearErrors();

    startTransition(async () => {
      const result = await registerAction(values);

      if (!result.success) {
        if ("fieldErrors" in result && result.fieldErrors) {
          for (const [fieldName, messages] of Object.entries(result.fieldErrors)) {
            const firstMessage = messages?.[0];
            if (firstMessage) {
              form.setError(fieldName as keyof RegisterInput, {
                type: "server",
                message: firstMessage
              });
            }
          }
        }

        setErrorMessage(result.message);
        return;
      }

      setSuccessMessage(result.message);

      const loginResult = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false
      });

      if (!loginResult || loginResult.error) {
        router.push("/login");
        router.refresh();
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  });

  return (
    <Card className="w-full max-w-lg bg-white/90">
      <CardHeader>
        <CardTitle>{BRAND_COPY.cta.primary}</CardTitle>
        <CardDescription>{BRAND_COPY.institutional.registerDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Nome do personal</Label>
            <Input id="name" {...form.register("name")} />
            <p className="text-xs text-destructive">{form.formState.errors.name?.message}</p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="businessName">Nome do neg?cio</Label>
            <Input id="businessName" {...form.register("businessName")} />
            <p className="text-xs text-destructive">
              {form.formState.errors.businessName?.message}
            </p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" {...form.register("phone")} />
            <p className="text-xs text-destructive">{form.formState.errors.phone?.message}</p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...form.register("email")} />
            <p className="text-xs text-destructive">{form.formState.errors.email?.message}</p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" {...form.register("password")} />
            <p className="text-xs text-destructive">{form.formState.errors.password?.message}</p>
          </div>
          {errorMessage ? <p className="text-sm text-destructive sm:col-span-2">{errorMessage}</p> : null}
          {successMessage ? (
            <p className="text-sm text-emerald-700 sm:col-span-2">{successMessage}</p>
          ) : null}
          <div className="sm:col-span-2">
            <Button className="w-full" type="submit">
              {isPending ? "Criando conta..." : BRAND_COPY.cta.primary}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
