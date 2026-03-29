import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, Clock3, Filter, History, MapPin, UserRound } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCurrentStudent } from "@/lib/student";
import {
  StudentPortalService,
  type StudentHistoryAttendanceFilter,
  type StudentHistoryPeriod
} from "@/modules/student/services/student-portal.service";

type StudentHistoryPageProps = {
  searchParams?: Promise<{
    period?: string;
    attendance?: string;
  }>;
};

function parsePeriod(period?: string): StudentHistoryPeriod {
  if (period === "30d" || period === "90d") {
    return period;
  }

  return "all";
}

function parseAttendance(attendance?: string): StudentHistoryAttendanceFilter {
  if (attendance === "present" || attendance === "absent") {
    return attendance;
  }

  return "all";
}

function getAttendanceVariant(attendance: string) {
  if (attendance === "Ausente justificado") {
    return "outline" as const;
  }

  return "default" as const;
}

export default async function StudentHistoryPage({ searchParams }: StudentHistoryPageProps) {
  const student = await requireCurrentStudent();
  const params = searchParams ? await searchParams : undefined;
  const period = parsePeriod(params?.period);
  const attendance = parseAttendance(params?.attendance);
  const history = await StudentPortalService.getHistory(student.id, { period, attendance });
  const filterOptions = StudentPortalService.getHistoryFilterOptions();

  return (
    <main className="min-w-0 space-y-8 px-6 py-8">
      <PageHeader
        title="Histórico de sessões"
        description="Acompanhe seus atendimentos concluídos e a continuidade do seu acompanhamento com mais clareza."
      />

      <Card className="border-white/70 bg-white/90 shadow-sm">
        <CardHeader className="flex-row items-center gap-3 pb-4">
          <Filter className="size-5 text-primary" />
          <CardTitle className="text-xl">Filtrar histórico</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 lg:grid-cols-[220px_220px_auto] lg:items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="period">
                Período
              </label>
              <select
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue={period}
                id="period"
                name="period"
              >
                {filterOptions.period.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="attendance">
                Presença
              </label>
              <select
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue={attendance}
                id="attendance"
                name="attendance"
              >
                {filterOptions.attendance.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
              type="submit"
            >
              Aplicar filtro
            </button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(239,246,255,0.9))] shadow-sm">
        <CardHeader className="flex-row items-center gap-3 pb-4">
          <History className="size-5 text-primary" />
          <CardTitle className="text-xl">Continuidade do acompanhamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-7 text-slate-600">
            Este histórico mostra os atendimentos já realizados, os registros mais importantes de cada sessão e como sua rotina vem sendo acompanhada com consistência.
          </p>
        </CardContent>
      </Card>

      {history.length === 0 ? (
        <EmptyState
          title="Nenhuma sessão encontrada"
          description="Ajuste os filtros ou aguarde novos registros para visualizar o histórico aqui."
        />
      ) : (
        <div className="grid gap-4">
          {history.map((item) => (
            <Card key={item.id} className="border-white/70 bg-white/90 shadow-sm">
              <CardHeader className="space-y-4 pb-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-xl text-slate-950">{item.title}</CardTitle>
                      <Badge variant="secondary">{item.category}</Badge>
                      <Badge variant={getAttendanceVariant(item.attendance)}>{item.attendance}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">Com {item.coach}</p>
                  </div>
                  <div className="text-sm text-slate-600">
                    {format(item.date, "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 px-4 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <CheckCircle2 className="size-4 text-primary" />
                      <span>Status final</span>
                    </div>
                    <p className="mt-2 font-semibold text-slate-950">{item.finalStatus}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 px-4 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <Clock3 className="size-4 text-primary" />
                      <span>Horário</span>
                    </div>
                    <p className="mt-2 font-semibold text-slate-950">
                      {format(item.startsAt, "HH:mm", { locale: ptBR })} - {format(item.endsAt, "HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 px-4 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <MapPin className="size-4 text-primary" />
                      <span>Local</span>
                    </div>
                    <p className="mt-2 font-semibold text-slate-950">{item.location}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 px-4 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <UserRound className="size-4 text-primary" />
                      <span>Presença</span>
                    </div>
                    <p className="mt-2 font-semibold text-slate-950">{item.attendance}</p>
                  </div>
                </div>

                <details className="group rounded-2xl border border-slate-200 px-4 py-4 open:bg-slate-50/70">
                  <summary className="cursor-pointer list-none text-sm font-medium text-slate-950">
                    Ver observações e registros da sessão
                  </summary>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Observações resumidas</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{item.note}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Continuidade do acompanhamento</p>
                      <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                        {item.insights.map((insight) => (
                          <li key={insight} className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </details>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
