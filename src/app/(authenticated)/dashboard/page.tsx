import { CalendarClock, CreditCard, DollarSign, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStatCard } from "@/components/shared/dashboard-stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { requireTenant } from "@/lib/tenant";
import { DashboardSummaryService } from "@/modules/dashboard/services/dashboard-summary.service";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export default async function DashboardPage() {
  const tenant = await requireTenant();
  const data = await DashboardSummaryService.getOverview({
    tenantId: tenant.id
  });

  return (
    <main className="space-y-8 px-6 py-8">
      <PageHeader
        title="Dashboard"
        description={`Visão consolidada de ${tenant.businessName}.`}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users className="size-4" />
            <span>Alunos ativos</span>
          </div>
          <DashboardStatCard
            title="Total de alunos ativos"
            value={String(data.activeStudentsCount)}
            description={
              data.activeStudentsCount > 0
                ? "Quantidade de alunos com status ativo neste tenant."
                : "Nenhum aluno ativo cadastrado ainda."
            }
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CreditCard className="size-4" />
            <span>Pagamentos pendentes</span>
          </div>
          <DashboardStatCard
            title="Total pendente"
            value={String(data.pendingPaymentsCount)}
            description={
              data.pendingPaymentsCount > 0
                ? "Pagamentos ainda aguardando recebimento."
                : "Não há pagamentos pendentes no momento."
            }
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <DollarSign className="size-4" />
            <span>Recebido no mês</span>
          </div>
          <DashboardStatCard
            title="Valor recebido no mês atual"
            value={formatCurrency(data.receivedAmountThisMonth)}
            description="Somatório dos pagamentos marcados como pagos no mês atual."
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CalendarClock className="size-4" />
            <span>Próximos atendimentos</span>
          </div>
          <DashboardStatCard
            title="Agenda futura"
            value={String(data.upcomingAppointments.length)}
            description={
              data.upcomingAppointments.length > 0
                ? "Próximos atendimentos agendados a partir de agora."
                : "Nenhum atendimento futuro encontrado."
            }
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="border-white/70 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Próximos atendimentos</CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingAppointments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
                <p className="text-sm font-medium text-slate-900">Nenhum atendimento agendado.</p>
                <p className="mt-2 text-sm text-slate-500">
                  Quando houver novos compromissos para este tenant, eles aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-slate-950">{appointment.title}</p>
                      <p className="text-sm text-slate-500">Aluno: {appointment.studentName}</p>
                    </div>
                    <div className="text-sm text-slate-600">{appointment.startsAtLabel}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Resumo rápido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="font-medium text-slate-900">Tenant atual</p>
              <p className="mt-1">{tenant.businessName}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="font-medium text-slate-900">Leitura segura por tenant</p>
              <p className="mt-1">
                Todas as métricas desta página foram consultadas com filtro explícito por tenantId.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
