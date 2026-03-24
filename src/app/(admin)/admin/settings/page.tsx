import { Building2, CreditCard, MonitorCog, Server, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth-helpers";
import { AdminSettingsService } from "@/modules/admin/settings/services/admin-settings.service";

const statCards = [
  { key: "platformName", label: "Plataforma", icon: Building2 },
  { key: "systemVersion", label: "Versão", icon: MonitorCog },
  { key: "environment", label: "Ambiente", icon: Server },
  { key: "totalTenants", label: "Tenants", icon: Building2 },
  { key: "totalUsers", label: "Usuários", icon: Users },
  { key: "totalSubscriptions", label: "Assinaturas", icon: CreditCard }
] as const;

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await AdminSettingsService.getOverview();

  const values = {
    platformName: settings.platformName,
    systemVersion: settings.systemVersion,
    environment: settings.environment,
    totalTenants: String(settings.totalTenants),
    totalUsers: String(settings.totalUsers),
    totalSubscriptions: String(settings.totalSubscriptions)
  };

  return (
    <main className="min-w-0 space-y-8 px-6 py-8">
      <PageHeader
        title="Configurações"
        description="Dados institucionais e operacionais da plataforma em nível global."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((item) => (
          <Card key={item.key} className="rounded-[1.8rem] border-white/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] shadow-[0_22px_50px_-36px_rgba(15,23,42,0.42)]">
            <CardHeader className="space-y-4 pb-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <item.icon className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
                <CardTitle className="mt-2 text-3xl tracking-tight text-slate-950">{values[item.key]}</CardTitle>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[1.9rem] border-white/70 bg-white/95 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.35)]">
          <CardHeader>
            <CardTitle className="text-2xl tracking-tight">Informações institucionais</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2 text-sm text-slate-600">
            <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/70 px-4 py-4">
              <p className="text-slate-500">Produto</p>
              <p className="mt-2 font-medium text-slate-950">{settings.platformName}</p>
            </div>
            <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/70 px-4 py-4">
              <p className="text-slate-500">Versão</p>
              <p className="mt-2 font-medium text-slate-950">{settings.systemVersion}</p>
            </div>
            <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/70 px-4 py-4 md:col-span-2">
              <p className="text-slate-500">Ambiente</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary">{settings.environment}</Badge>
                <span className="text-sm text-slate-500">contexto operacional atual</span>
              </div>
            </div>
            <div className="rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-4 leading-6 text-slate-600 md:col-span-2">
              Painel administrativo global do SaaS para operação do MVP, com leitura institucional e indicadores centrais da plataforma.
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.9rem] border-white/70 bg-white/95 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.35)]">
          <CardHeader>
            <CardTitle className="text-2xl tracking-tight">Observações do MVP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            <p>
              Esta área está em modo somente leitura nesta etapa para manter o MVP simples e consistente.
            </p>
            <p>
              Se no futuro fizer sentido, podemos evoluir esta tela com uma entidade própria de configurações globais da plataforma, sem misturar dados operacionais dos tenants.
            </p>
            <p>
              As métricas acima são carregadas diretamente do banco e ajudam a acompanhar a saúde básica da operação administrativa.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}