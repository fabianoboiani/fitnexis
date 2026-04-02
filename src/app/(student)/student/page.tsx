import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  LineChart,
  MapPin,
  Sparkles
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StudentDashboardSummaryCard } from "@/components/shared/student-dashboard-summary-card";
import { StudentQuickActionCard } from "@/components/shared/student-quick-action-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCurrentStudent } from "@/lib/student";
import { StudentPortalService } from "@/modules/student/services/student-portal.service";

function getSessionStatusVariant(status: string) {
  if (status === "Confirmado") return "default" as const;
  if (status === "Pendente") return "secondary" as const;
  return "outline" as const;
}

function getNoticeTone(kind: "info" | "success" | "warning") {
  if (kind === "success") return "border-emerald-200 bg-emerald-50/80";
  if (kind === "warning") return "border-amber-200 bg-amber-50/80";
  return "border-cyan-200 bg-cyan-50/80";
}

export default async function StudentDashboardPage() {
  const student = await requireCurrentStudent();
  const data = await StudentPortalService.getDashboardOverview(student.id);
  const firstName = student.name.split(" ")[0];
  const nextSession = data.nextSession;
  const hasNextSession = nextSession !== null;

  return (
    <main className="min-w-0 space-y-8 px-6 py-8">
      <PageHeader title={`Olá, ${firstName}`} description={data.greetingMessage} />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden rounded-[1.9rem] border-white/70 bg-[linear-gradient(140deg,rgba(255,255,255,0.98),rgba(239,246,255,0.94))] shadow-[0_30px_80px_-48px_rgba(37,99,235,0.55)]">
          <CardHeader className="space-y-5 pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="rounded-full border border-cyan-100 bg-cyan-50 text-cyan-900">
                Próxima sessão
              </Badge>
              <Badge variant={hasNextSession ? getSessionStatusVariant(nextSession.status) : "outline"}>
                {hasNextSession ? nextSession.status : "Sem agendamento"}
              </Badge>
            </div>
            <div className="space-y-3">
              <CardTitle className="text-3xl tracking-tight text-slate-950">
                {hasNextSession ? nextSession.title : "Nenhuma sessão futura agendada"}
              </CardTitle>
              <p className="max-w-2xl text-sm leading-7 text-slate-600">
                {hasNextSession
                  ? "Seu próximo compromisso já está organizado para facilitar sua rotina e manter o acompanhamento com mais clareza."
                  : "Assim que o personal registrar um novo atendimento, ele aparecerá aqui com todos os detalhes reais da sua agenda."}
              </p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <CalendarDays className="size-4 text-primary" />
                <span>Data</span>
              </div>
              <p className="mt-3 font-semibold text-slate-950">
                {hasNextSession
                  ? format(nextSession.startsAt, "dd 'de' MMMM", { locale: ptBR })
                  : "Aguardando agendamento"}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Clock3 className="size-4 text-primary" />
                <span>Horário</span>
              </div>
              <p className="mt-3 font-semibold text-slate-950">
                {hasNextSession
                  ? `${format(nextSession.startsAt, "HH:mm", { locale: ptBR })} - ${format(nextSession.endsAt, "HH:mm", { locale: ptBR })}`
                  : "Sem horário definido"}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <MapPin className="size-4 text-primary" />
                <span>Local ou formato</span>
              </div>
              <p className="mt-3 font-semibold text-slate-950">{hasNextSession ? nextSession.location : "A definir"}</p>
              <p className="mt-1 text-xs text-slate-500">
                {hasNextSession ? nextSession.format : "Seu personal ainda não registrou o próximo formato de treino."}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <CheckCircle2 className="size-4 text-primary" />
                <span>Observações</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {hasNextSession
                  ? nextSession.notes ?? "Sem observações adicionais para esta sessão."
                  : "Use a agenda para acompanhar quando o próximo compromisso for lançado pelo seu personal."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.9rem] border-white/70 bg-white/95 shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)]">
          <CardHeader className="flex-row items-center gap-3 pb-4">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
              <Sparkles className="size-5" />
            </div>
            <CardTitle className="text-xl tracking-tight">Resumo do progresso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.progressSummary.map((item) => (
              <div key={item.id} className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/70 px-4 py-4">
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{item.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.weeklySummary.map((item) => (
          <StudentDashboardSummaryCard key={item.id} label={item.label} value={item.value} description={item.description} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[1.9rem] border-white/70 bg-white/95 shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)]">
          <CardHeader className="flex-row items-center gap-3 pb-4">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <CalendarDays className="size-5" />
            </div>
            <CardTitle className="text-xl tracking-tight">Atalhos rápidos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {data.quickActions.map((action) => (
              <StudentQuickActionCard key={action.id} label={action.label} description={action.description} href={action.href} />
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[1.9rem] border-white/70 bg-white/95 shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)]">
          <CardHeader className="flex-row items-center gap-3 pb-4">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Bell className="size-5" />
            </div>
            <CardTitle className="text-xl tracking-tight">Avisos recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.notices.map((notice) => (
              <div key={notice.id} className={`rounded-[1.4rem] border px-4 py-4 ${getNoticeTone(notice.kind)}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-950">{notice.title}</p>
                  <p className="text-xs text-slate-500">{format(notice.createdAt, "dd/MM", { locale: ptBR })}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{notice.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-[1.9rem] border-white/70 bg-white/95 shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)]">
          <CardHeader className="flex-row items-center gap-3 pb-4">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <CalendarDays className="size-5" />
            </div>
            <CardTitle className="text-xl tracking-tight">Sua agenda em destaque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcomingAppointments.length === 0 ? (
              <p className="text-sm text-slate-600">Nenhum compromisso futuro registrado no momento.</p>
            ) : (
              data.upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/70 px-4 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-950">{appointment.title}</p>
                        <Badge variant={getSessionStatusVariant(appointment.status)}>{appointment.status}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{appointment.coach}</p>
                      <p className="mt-1 text-sm text-slate-500">{appointment.location}</p>
                    </div>
                    <div className="text-sm text-slate-600">
                      {format(appointment.startsAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[1.9rem] border-white/70 bg-white/95 shadow-[0_22px_60px_-38px_rgba(15,23,42,0.35)]">
          <CardHeader className="flex-row items-center gap-3 pb-4">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
              <LineChart className="size-5" />
            </div>
            <CardTitle className="text-xl tracking-tight">Financeiro e evolução</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/70 px-4 py-4">
              <p className="text-sm font-medium text-slate-500">Plano atual</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{data.activePlan}</p>
              <p className="mt-2 text-sm text-slate-600">
                Estrutura ativa do seu acompanhamento com foco em frequência, progresso e consistência.
              </p>
            </div>
            <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/70 px-4 py-4">
              <p className="text-sm font-medium text-slate-500">Última atualização</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{data.lastUpdateLabel}</p>
              <p className="mt-2 text-sm text-slate-600">
                Seu personal registrou atualizações recentes para manter sua evolução acompanhada de forma clara.
              </p>
            </div>
            <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/70 px-4 py-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <CreditCard className="size-4 text-primary" />
                <span>Situação financeira</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {data.paymentSummary.pendingCount} pagamento(s) pendente(s)
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {data.paymentSummary.latestPaymentDueDate
                  ? `Último vencimento registrado em ${format(data.paymentSummary.latestPaymentDueDate, "dd/MM/yyyy", { locale: ptBR })}.`
                  : "Nenhum pagamento registrado até o momento."}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}