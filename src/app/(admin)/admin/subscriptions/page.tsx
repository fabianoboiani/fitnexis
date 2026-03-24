import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SubscriptionStatus } from "@prisma/client";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminSubscriptionForm } from "@/components/shared/admin-subscription-form";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SubscriptionStatusBadge } from "@/components/shared/subscription-status-badge";
import { requireAdmin } from "@/lib/auth-helpers";
import { subscriptionStatusLabels } from "@/lib/enum-labels";
import { updateAdminSubscriptionAction } from "@/modules/admin/subscriptions/actions/admin-subscription.action";
import { AdminSubscriptionService } from "@/modules/admin/subscriptions/services/admin-subscription.service";
import { AdminTenantService } from "@/modules/admin/tenants/services/admin-tenant.service";

type AdminSubscriptionsPageProps = {
  searchParams?: Promise<{
    status?: string;
    planName?: string;
    tenantId?: string;
    subscriptionId?: string;
  }>;
};

function parseSubscriptionStatus(status?: string) {
  if (!status) {
    return undefined;
  }

  return Object.values(SubscriptionStatus).includes(status as SubscriptionStatus)
    ? (status as SubscriptionStatus)
    : undefined;
}

function formatOptionalDate(date: Date | null) {
  if (!date) {
    return "Não informado";
  }

  return format(date, "dd/MM/yyyy", { locale: ptBR });
}

export default async function AdminSubscriptionsPage({
  searchParams
}: AdminSubscriptionsPageProps) {
  await requireAdmin();

  const params = searchParams ? await searchParams : undefined;
  const status = parseSubscriptionStatus(params?.status);
  const planName = params?.planName?.trim() ?? "";
  const tenantId = params?.tenantId?.trim() ?? "";
  const subscriptionId = params?.subscriptionId?.trim() ?? "";

  const [subscriptions, tenants, selectedSubscription] = await Promise.all([
    AdminSubscriptionService.list({
      status,
      planName: planName || undefined,
      tenantId: tenantId || undefined
    }),
    AdminTenantService.list(),
    subscriptionId ? AdminSubscriptionService.getById(subscriptionId) : Promise.resolve(null)
  ]);

  const boundUpdateSubscriptionAction = selectedSubscription
    ? updateAdminSubscriptionAction.bind(null, selectedSubscription.id)
    : null;

  return (
    <main className="min-w-0 space-y-8 px-6 py-8">
      <PageHeader
        title="Assinaturas"
        description="Gerencie assinaturas SaaS da plataforma com filtros e ajustes manuais."
      />

      <div className="space-y-6">
        {selectedSubscription && boundUpdateSubscriptionAction ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <Card className="border-white/70 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Detalhes da assinatura</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm text-slate-600 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-slate-500">Tenant</p>
                  <p className="font-medium text-slate-950">
                    {selectedSubscription.tenantBusinessName}
                  </p>
                  <p className="break-words">{selectedSubscription.tenantPersonalName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500">Contato</p>
                  <p className="break-all">{selectedSubscription.tenantEmail ?? "Não informado"}</p>
                  <p className="break-all">{selectedSubscription.tenantPhone ?? "Não informado"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500">Status atual</p>
                  <SubscriptionStatusBadge status={selectedSubscription.status} />
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500">Criada em</p>
                  <p>{format(selectedSubscription.createdAt, "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500">Atualizada em</p>
                  <p>{format(selectedSubscription.updatedAt, "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
              </CardContent>
            </Card>

            <AdminSubscriptionForm
              initialValues={AdminSubscriptionService.getFormValues(selectedSubscription)}
              onSubmitAction={boundUpdateSubscriptionAction}
            />
          </div>
        ) : (
          <EmptyState
            title="Selecione uma assinatura"
            description="Escolhá uma assinatura na tabela para visualizar os detalhes e editar plano, status ou vencimento."
          />
        )}

        <Card className="border-white/70 bg-white/90 shadow-sm">
          <CardHeader className="gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl">Lista de assinaturas</CardTitle>
              <p className="text-sm text-slate-600">
                Filtre por status, plano ou tenant para localizar uma assinatura específica.
              </p>
            </div>
            <form className="grid gap-3 lg:grid-cols-[1.2fr_0.9fr_0.9fr_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  name="planName"
                  defaultValue={planName}
                  placeholder="Buscar por nome do plano"
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm"
                />
              </div>

              <select
                name="status"
                defaultValue={status ?? ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos os status</option>
                <option value={SubscriptionStatus.TRIAL}>{subscriptionStatusLabels.TRIAL}</option>
                <option value={SubscriptionStatus.ACTIVE}>{subscriptionStatusLabels.ACTIVE}</option>
                <option value={SubscriptionStatus.PAST_DUE}>{subscriptionStatusLabels.PAST_DUE}</option>
                <option value={SubscriptionStatus.CANCELED}>{subscriptionStatusLabels.CANCELED}</option>
              </select>

              <select
                name="tenantId"
                defaultValue={tenantId}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos os tenants</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.businessName}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <Button type="submit" variant="outline">
                  Filtrar
                </Button>
                <Button asChild type="button" variant="ghost">
                  <Link href="/admin/subscriptions">Limpar</Link>
                </Button>
              </div>
            </form>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <EmptyState
                title="Nenhuma assinatura encontrada"
                description={
                  status || planName || tenantId
                    ? "Tente ajustar os filtros para encontrar outras assinaturas."
                    : "Quando existirem mais assinaturas SaaS na plataforma, elas aparecerao aqui."
                }
              />
            ) : (
              <div className="max-w-full overflow-x-auto">
                <table className="min-w-[1120px] divide-y divide-slate-200 text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="px-4 py-3 font-medium">Tenant</th>
                      <th className="px-4 py-3 font-medium">Plano</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Fim do período</th>
                      <th className="px-4 py-3 font-medium">Stripe customer</th>
                      <th className="px-4 py-3 font-medium">Stripe subscription</th>
                      <th className="px-4 py-3 font-medium">Criada em</th>
                      <th className="px-4 py-3 font-medium">Atualizada em</th>
                      <th className="px-4 py-3 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subscriptions.map((subscription) => (
                      <tr key={subscription.id} className="text-slate-700">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-slate-950">{subscription.tenantBusinessName}</p>
                            <p className="text-xs text-slate-500">{subscription.tenantPersonalName}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">{subscription.planName}</td>
                        <td className="px-4 py-4">
                          <SubscriptionStatusBadge status={subscription.status} />
                        </td>
                        <td className="px-4 py-4">{formatOptionalDate(subscription.currentPeriodEnd)}</td>
                        <td className="px-4 py-4">{subscription.stripeCustomerId ?? "Não informado"}</td>
                        <td className="px-4 py-4">
                          {subscription.stripeSubscriptionId ?? "Não informado"}
                        </td>
                        <td className="px-4 py-4">
                          {format(subscription.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                        </td>
                        <td className="px-4 py-4">
                          {format(subscription.updatedAt, "dd/MM/yyyy", { locale: ptBR })}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button asChild size="sm">
                            <Link
                              href={{
                                pathname: "/admin/subscriptions",
                                query: {
                                  ...(status ? { status } : {}),
                                  ...(planName ? { planName } : {}),
                                  ...(tenantId ? { tenantId } : {}),
                                  subscriptionId: subscription.id
                                }
                              }}
                            >
                              Visualizar
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
