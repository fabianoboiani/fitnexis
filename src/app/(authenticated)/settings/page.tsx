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
        title="Configura??es"
        description="Gerencie os dados b?sicos do tenant e visualize a assinatura SaaS atual."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/settings/profile">
          <Card className="h-full border-white/70 bg-white/90 shadow-sm transition-transform hover:-translate-y-0.5">
            <CardHeader>
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="size-5" />
              </div>
              <CardTitle className="text-xl">Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Edite nome do personal, nome do neg?cio, telefone e e-mail do tenant.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/settings/billing">
          <Card className="h-full border-white/70 bg-white/90 shadow-sm transition-transform hover:-translate-y-0.5">
            <CardHeader>
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CreditCard className="size-5" />
              </div>
              <CardTitle className="text-xl">Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Vej? o plano atual, status da assinatura e identificadores SaaS j? salvos.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  );
}
