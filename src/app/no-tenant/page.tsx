import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SwitchAccountButton } from "@/components/shared/switch-account-button";
import { getCurrentUser, isAdmin, isStudent } from "@/lib/auth-helpers";

export default async function NoTenantPage() {
  const user = await getCurrentUser();

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-lg border-white/70 bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle>Conta sem vínculo operacional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <p>
            {user?.email
              ? `A conta ${user.email} está autenticada, mas ainda não possui um vínculo operacional válido para acessar esta área.`
              : "Sua conta está autenticada, mas ainda não possui um vínculo operacional válido."}
          </p>
          <p>
            {user && isAdmin(user.role)
              ? "Isso pode acontecer com usuários administrativos da plataforma quando o contexto atual não depende de tenant."
              : user && isStudent(user.role)
                ? "Isso pode acontecer quando o acesso do aluno foi criado, mas ainda não foi vinculado corretamente a um cadastro de aluno com acesso ativo."
                : "Revise o vínculo da conta com o contexto operacional correto antes de continuar."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/">Voltar para o início</Link>
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