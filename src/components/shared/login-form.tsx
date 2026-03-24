"use client";

import { useState, useTransition } from "react";
import type { Route } from "next";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BRAND_COPY } from "@/lib/branding";
import { LoginSchema, type LoginInput } from "@/modules/auth/schemas/login.schema";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = form.handleSubmit((values) => {
    setErrorMessage(null);

    startTransition(async () => {
      const nextPath = callbackUrl && callbackUrl.startsWith("/") ? `/app?next=${encodeURIComponent(callbackUrl)}` : "/app";

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: nextPath
      });

      if (!result || result.error) {
        setErrorMessage("E-mail ou senha inválidos.");
        return;
      }

      router.replace((result.url ?? nextPath) as Route);
      router.refresh();
    });
  });

  return (
    <Card className="relative w-full max-w-md overflow-hidden bg-white/90">
      {isPending ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm font-medium text-slate-700">Entrando na plataforma...</p>
          </div>
        </div>
      ) : null}
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>{BRAND_COPY.institutional.loginDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input disabled={isPending} id="email" type="email" {...form.register("email")} />
            <p className="text-xs text-destructive">{form.formState.errors.email?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input disabled={isPending} id="password" type="password" {...form.register("password")} />
            <p className="text-xs text-destructive">{form.formState.errors.password?.message}</p>
          </div>
          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
          <Button className="w-full" disabled={isPending} type="submit">
            {isPending ? "Entrando..." : BRAND_COPY.cta.login}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
