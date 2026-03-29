import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart3, CalendarCheck2, LineChart, Sparkles, TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StudentDashboardSummaryCard } from "@/components/shared/student-dashboard-summary-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCurrentStudent } from "@/lib/student";
import { StudentPortalService } from "@/modules/student/services/student-portal.service";

export default async function StudentProgressPage() {
  const student = await requireCurrentStudent();
  const progress = await StudentPortalService.getProgressOverview(student.id);

  return (
    <main className="min-w-0 space-y-8 px-6 py-8">
      <PageHeader
        title="Evolução"
        description="Acompanhe seu progresso com uma leitura simples, útil e organizada para o momento atual do seu plano."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {progress.metrics.map((item) => (
          <StudentDashboardSummaryCard
            key={item.id}
            label={item.label}
            value={item.value}
            description={item.description}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(239,246,255,0.92))] shadow-sm">
          <CardHeader className="flex-row items-center gap-3 pb-4">
            <LineChart className="size-5 text-primary" />
            <CardTitle className="text-xl">Comparativo simples do período</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm leading-7 text-slate-600">
              Esta leitura mostra a consistência recente do seu acompanhamento. Não é um gráfico avançado, mas já ajuda a visualizar a evolução da sua rotina no ciclo atual.
            </p>

            <div className="grid grid-cols-4 items-end gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4">
              {progress.trend.map((point) => (
                <div key={point.id} className="space-y-3 text-center">
                  <div className="flex h-40 items-end justify-center">
                    <div
                      className="w-full max-w-14 rounded-t-2xl bg-[linear-gradient(180deg,rgba(14,165,233,0.85),rgba(37,99,235,0.95))] shadow-[0_10px_30px_-15px_rgba(37,99,235,0.7)]"
                      style={{ height: `${point.value}%` }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{point.label}</p>
                    <p className="text-xs text-slate-500">{point.rawValue} sess.</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-sm">
          <CardHeader className="flex-row items-center gap-3 pb-4">
            <TrendingUp className="size-5 text-primary" />
            <CardTitle className="text-xl">Leituras do acompanhamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {progress.highlights.map((highlight) => (
              <div key={highlight} className="rounded-2xl border border-slate-200 px-4 py-4">
                <p className="text-sm leading-7 text-slate-600">{highlight}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-white/70 bg-white/90 shadow-sm">
          <CardHeader className="flex-row items-center gap-3 pb-4">
            <Sparkles className="size-5 text-primary" />
            <CardTitle className="text-xl">Observações de evolução</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {progress.notes.map((note) => (
              <div key={note} className="rounded-2xl border border-slate-200 px-4 py-4">
                <p className="text-sm leading-7 text-slate-600">{note}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/90 shadow-sm">
          <CardHeader className="flex-row items-center gap-3 pb-4">
            <BarChart3 className="size-5 text-primary" />
            <CardTitle className="text-xl">Espaço para expansão futura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            <p>
              Esta área já foi preparada para receber dados mais completos no futuro, como comparativos por objetivo, evolução física e indicadores por ciclo de treinamento.
            </p>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-4">
              <p className="font-medium text-slate-700">Próximos dados possíveis</p>
              <p className="mt-2">
                Frequência por período, registros de medidas, marcos de desempenho e resumos de avaliação podem entrar aqui sem exigir reestruturação da tela.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {progress.records.length === 0 ? (
        <EmptyState
          title="Nenhum registro de evolução"
          description="Quando novas atualizações forem lançadas pelo seu personal, elas aparecerão aqui."
        />
      ) : (
        <section>
          <Card className="border-white/70 bg-white/90 shadow-sm">
            <CardHeader className="flex-row items-center gap-3 pb-4">
              <CalendarCheck2 className="size-5 text-primary" />
              <CardTitle className="text-xl">Registros recentes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {progress.records.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                  <p className="text-sm font-medium text-slate-500">{item.title}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{item.value}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {format(item.recordedAt, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </main>
  );
}
