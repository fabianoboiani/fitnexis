import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requireTenant } from "@/lib/tenant";
import { SettingsService } from "@/modules/settings/services/settings.service";

export default async function SettingsBillingPage() {
  const tenant = await requireTenant();
  const billing = await SettingsService.getBillingDetails(tenant.id);

  return (
    <main className="space-y-8 px-6 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          title="Assinatura"
          description="Visualize os dados atuais do plano e os identificadores SaaS vinculados à sua conta."
        />
        <Button asChild variant="outline" className="border-slate-200 bg-white">
          <Link href="/settings">Voltar para configurações</Link>
        </Button>
      </div>

      {!billing ? (
        <EmptyState
          title="Nenhuma assinatura encontrada"
          description="Quando existir uma assinatura SaaS vinculada ao tenant, os dados aparecerão aqui."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-[1.9rem] border-white/70 bg-white/95 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.35)]">
            <CardHeader>
              <CardTitle className="text-2xl tracking-tight">Assinatura atual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/70 px-4 py-4">
                <p className="text-slate-500">Plano</p>
                <p className="mt-2 font-medium text-slate-950">{billing.planName}</p>
              </div>
              <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/70 px-4 py-4">
                <p className="text-slate-500">Status</p>
                <p className="mt-2 font-medium text-slate-950">{billing.status}</p>
              </div>
              <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/70 px-4 py-4">
                <p className="text-slate-500">Fim do período atual</p>
                <p className="mt-2 font-medium text-slate-950">
                  {billing.currentPeriodEnd
                    ? format(billing.currentPeriodEnd, "dd/MM/yyyy", { locale: ptBR })
                    : "Não informado"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.9rem] border-white/70 bg-white/95 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.35)]">
            <CardHeader>
              <CardTitle className="text-2xl tracking-tight">Identificadores SaaS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/70 px-4 py-4">
                <p className="text-slate-500">Stripe customer</p>
                <p className="mt-2 font-medium break-all text-slate-950">{billing.stripeCustomerId ?? "Não informado"}</p>
              </div>
              <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/70 px-4 py-4">
                <p className="text-slate-500">Stripe subscription</p>
                <p className="mt-2 font-medium break-all text-slate-950">{billing.stripeSubscriptionId ?? "Não informado"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}