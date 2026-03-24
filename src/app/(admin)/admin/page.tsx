import Link from "next/link";
import { Building2, CreditCard, ShieldCheck, Users } from "lucide-react";
import { DashboardStatCard } from "@/components/shared/dashboard-stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { SubscriptionStatusBadge } from "@/components/shared/subscription-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth-helpers";
import { AdminDashboardService } from "@/modules/admin/dashboard/services/admin-dashboard.service";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const data = await AdminDashboardService.getOverview();

  return (
    <main className="min-w-0 space-y-8 px-6 py-8">
      <PageHeader
        title="Painel administrativo"
        description="Visão global da operação da plataforma para administradores."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Building2 className="size-4" />
            <span>Tenants</span>
          </div>
          <DashboardStatCard
            title="Total de tenants"
            value={String(data.totalTenants)}
            description="Quantidade total de contas SaaS cadastradas."
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck className="size-4" />
            <span>Tenants ativos</span>
          </div>
          <DashboardStatCard
            title="Tenants ativos"
            value={String(data.totalActiveTenants)}
            description="Contas operacionais marcadas como ativas na plataforma."
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CreditCard className="size-4" />
            <span>Em teste</span>
          </div>
          <DashboardStatCard
            title="Tenants em trial"
            value={String(data.totalTrialTenants)}
            description="Tenants em período de avaliação."
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CreditCard className="size-4" />
            <span>Canceladas</span>
          </div>
          <DashboardStatCard
            title="Assinaturas canceladas"
            value={String(data.totalCanceledSubscriptions)}
            description="Assinaturas atualmente canceladas."
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users className="size-4" />
            <span>Personais</span>
          </div>
          <DashboardStatCard
            title="Usuários personal trainer"
            value={String(data.totalPersonalUsers)}
            description="Clientes operacionais da plataforma."
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users className="size-4" />
            <span>Administradores</span>
          </div>
          <DashboardStatCard
            title="Usuários administradores"
            value={String(data.totalAdminUsers)}
            description="Usuários globais da plataforma."
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/70 bg-white/90 shadow-sm">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-xl">Tenants recentes</CardTitle>
            <Link href="/admin/tenants" className="text-sm font-medium text-primary">
              Ver todos
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentTenants.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
                <p className="text-sm font-medium text-slate-900">Nenhum tenant cadastrado.</p>
                <p className="mt-2 text-sm text-slate-500">
                  Quando novos clientes entrarem na plataforma, eles aparecerao aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentTenants.map((tenant) => (
                  <Link
                    key={tenant.id}
                    href={`/admin/tenants/${tenant.id}`}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 px-4 py-4 transition-colors hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-slate-950">{tenant.businessName}</p>
                      <p className="text-sm text-slate-500">
                        Responsável: {tenant.personalName}
                      </p>
                      <p className="text-xs text-slate-500">{tenant.email ?? "Sem e-mail"}</p>
                    </div>
                    <div className="text-sm text-slate-600">
                      <p>Criado em {tenant.createdAtLabel}</p>
                      <div className="mt-2">
                        {tenant.subscriptionStatus ? (
                          <SubscriptionStatusBadge status={tenant.subscriptionStatus} />
                        ) : (
                          <span>Sem assinatura</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-sm">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-xl">Assinaturas com atenção</CardTitle>
            <Link href="/admin/subscriptions" className="text-sm font-medium text-primary">
              Ver todas
            </Link>
          </CardHeader>
          <CardContent>
            {data.subscriptionsExpiringSoon.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
                <p className="text-sm font-medium text-slate-900">
                  Nenhuma assinatura com vencimento próximo.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Quando houver renovações se aproximando, elas aparecerao aqui para acompanhamento.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.subscriptionsExpiringSoon.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="rounded-2xl border border-slate-200 px-4 py-4"
                  >
                    <p className="font-medium text-slate-950">{subscription.businessName}</p>
                    <p className="mt-1 text-sm text-slate-500">{subscription.planName}</p>
                    <div className="mt-2">
                      <SubscriptionStatusBadge status={subscription.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Encerra em {subscription.currentPeriodEndLabel}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
