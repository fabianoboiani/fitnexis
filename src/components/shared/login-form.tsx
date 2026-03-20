"use client";

import { useState, useTransition } from "react";
import type { Route } from "next";
import type { UserRole } from "@prisma/client";
import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getSafeRouteForRole } from "@/lib/app-routes";
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
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false
      });

      if (!result || result.error) {
        setErrorMessage("E-mail ou senha inv?lidos.");
        return;
      }

      const session = await getSession();
      const role = (session?.user?.role ?? "PERSONAL") as UserRole;
      const nextRoute = getSafeRouteForRole(role, callbackUrl);

      router.push(nextRoute as Route);
      router.refresh();
    });
  });

  return (
    <Card className="w-full max-w-md bg-white/90">
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>{BRAND_COPY.institutional.loginDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...form.register("email")} />
            <p className="text-xs text-destructive">{form.formState.errors.email?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" {...form.register("password")} />
            <p className="text-xs text-destructive">{form.formState.errors.password?.message}</p>
          </div>
          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
          <Button className="w-full" type="submit">
            {isPending ? "Entrando..." : BRAND_COPY.cta.login}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
