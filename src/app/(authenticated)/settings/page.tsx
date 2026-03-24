import Link from "next/link";
import { Building2, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { requireTenant } from "@/lib/tenant";

export default async function SettingsPage() {
  await requireTenant();

  return (
    <main className="space-y-8 px-6 py-8">
      <PageHeader
        title="Configurações"
        description="Gerencie os dados principais do tenant e acompanhe a assinatura SaaS atual da sua conta."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/settings/profile" className="group block h-full">
          <Card className="h-full rounded-[1.9rem] border-white/70 bg-white/95 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.35)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_28px_70px_-38px_rgba(37,99,235,0.38)]">
            <CardHeader className="space-y-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Building2 className="size-5" />
              </div>
              <CardTitle className="text-2xl tracking-tight text-slate-950">Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-slate-600">
                Edite nome do personal, nome do negócio, telefone e e-mail usados na estrutura principal do tenant.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/settings/billing" className="group block h-full">
          <Card className="h-full rounded-[1.9rem] border-white/70 bg-white/95 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.35)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_28px_70px_-38px_rgba(37,99,235,0.38)]">
            <CardHeader className="space-y-4">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                <CreditCard className="size-5" />
              </div>
              <CardTitle className="text-2xl tracking-tight text-slate-950">Assinatura</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-slate-600">
                Veja o plano atual, o status da assinatura e os identificadores já vinculados à operação SaaS.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  );
}