import { Building2, CreditCard, MonitorCog, Server, Users } from "lucide-react";
import { DashboardStatCard } from "@/components/shared/dashboard-stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth-helpers";
import { AdminSettingsService } from "@/modules/admin/settings/services/admin-settings.service";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await AdminSettingsService.getOverview();

  return (
    <main className="min-w-0 space-y-8 px-6 py-8">
      <PageHeader
        title="Configura??es"
        description="Dados institucionais e operacionais da plataforma em nivel global."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Building2 className="size-4" />
            <span>Plataforma</span>
          </div>
          <DashboardStatCard
            title="Nome da plataforma"
            value={settings.platformName}
            description="Identificacao institucional do produto SaaS."
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MonitorCog className="size-4" />
            <span>Versao</span>
          </div>
          <DashboardStatCard
            title="Versao do sistema"
            value={settings.systemVersion}
            description="Versao atual definida no projeto."
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Server className="size-4" />
            <span>Ambiente</span>
          </div>
          <DashboardStatCard
            title="Ambiente atual"
            value={settings.environment}
            description="Contexto em que a aplicacao esta executando."
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Building2 className="size-4" />
            <span>Tenants</span>
          </div>
          <DashboardStatCard
            title="Total de tenants"
            value={String(settings.totalTenants)}
            description="Clientes SaaS cadastrados na plataforma."
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Users className="size-4" />
            <span>Usu?rios</span>
          </div>
          <DashboardStatCard
            title="Total de usu?rios"
            value={String(settings.totalUsers)}
            description="Contagem global de contas de acesso."
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CreditCard className="size-4" />
            <span>Assinaturas</span>
          </div>
          <DashboardStatCard
            title="Total de assinaturas"
            value={String(settings.totalSubscriptions)}
            description="Registros SaaSSubscription ativos e hist?ricos."
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/70 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Informa??es institucionais</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Produto</p>
              <p className="font-medium text-slate-950">{settings.platformName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Versao</p>
              <p>{settings.systemVersion}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Ambiente</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{settings.environment}</Badge>
                <span className="text-sm text-slate-500">ambiente operacional atual</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Escopo</p>
              <p>Painel administrativo global do SaaS para opera??o do MVP.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Observa??es do MVP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
            <p>Esta area esta em modo somente leitura nesta etapa para manter o MVP simples e consistente.</p>
            <p>
              Se no futuro fizer sentido, podemos evoluir esta tela com uma entidade pr?pria de
              configura??es globais da plataforma sem misturar dados operacionais dos tenants.
            </p>
            <p>
              As metricas acima sao carregadas diretamente do banco e ajudam a acompanhar a saude
              basica da opera??o administrativa.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
