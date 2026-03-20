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
          title="Billing"
          description="Visualize os dados atuais da assinatura SaaS do tenant."
        />
        <Button asChild variant="outline">
          <Link href="/settings">Voltar para configura??es</Link>
        </Button>
      </div>

      {!billing ? (
        <EmptyState
          title="Nenhuma assinatura encontrada"
          description="Quando existir uma assinatura SaaS vinculada ao tenant, os dados aparecerao aqui."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-white/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Assinatura atual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <p className="text-slate-500">Plano</p>
                <p className="font-medium text-slate-950">{billing.planName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500">Status</p>
                <p className="font-medium text-slate-950">{billing.status}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500">Fim do per?odo atual</p>
                <p className="font-medium text-slate-950">
                  {billing.currentPeriodEnd
                    ? format(billing.currentPeriodEnd, "dd/MM/yyyy", { locale: ptBR })
                    : "N?o informado"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Identificadores SaaS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <p className="text-slate-500">Stripe customer</p>
                <p className="font-medium text-slate-950">
                  {billing.stripeCustomerId ?? "N?o informado"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500">Stripe subscription</p>
                <p className="font-medium text-slate-950">
                  {billing.stripeSubscriptionId ?? "N?o informado"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
