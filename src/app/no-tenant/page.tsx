import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SwitchAccountButton } from "@/components/shared/switch-account-button";
import { getCurrentUser, isAdmin } from "@/lib/auth-helpers";

export default async function NoTenantPage() {
  const user = await getCurrentUser();

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-lg border-white/70 bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle>Conta sem tenant ativo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <p>
            {user?.email
              ? `A conta ${user.email} esta autenticada, mas ainda n?o possui um tenant operacional vinculado.`
              : "Sua conta n?o possui um tenant operacional vinculado."}
          </p>
          <p>
            Isso pode acontecer com usu?rios administrativos da plataforma enquanto a area de
            administra??o ainda n?o foi implementada.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/">Voltar para inicio</Link>
            </Button>
            {user && isAdmin(user.role) ? (
              <Button asChild variant="outline">
                <Link href="/admin">Abrir painel administrativo</Link>
              </Button>
            ) : null}
            <SwitchAccountButton />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
