import Link from "next/link";
import { Bell, CircleAlert, Clock3, MailCheck } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StudentNoticeCard } from "@/components/shared/student-notice-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireStudent } from "@/lib/auth-helpers";
import { cn } from "@/lib/utils";
import {
  StudentPortalService,
  type StudentNoticeFilter,
  type StudentNoticeItem
} from "@/modules/student/services/student-portal.service";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const filterIcons = {
  all: Bell,
  unread: MailCheck,
  "high-priority": CircleAlert
} as const;

function getSummary(notices: StudentNoticeItem[]) {
  const unread = notices.filter((notice) => !notice.isRead).length;
  const highPriority = notices.filter((notice) => notice.priority === "high").length;

  return [
    {
      id: "total",
      label: "Avisos ativos",
      value: String(notices.length),
      description: "Comunicados recentes centralizados no seu painel."
    },
    {
      id: "unread",
      label: "Não lidos",
      value: String(unread),
      description: "Itens que ainda merecem sua atenção imediata."
    },
    {
      id: "high-priority",
      label: "Prioridade alta",
      value: String(highPriority),
      description: "Alterações e pendências que pedem ação mais rápida."
    }
  ];
}

function normalizeFilter(value?: string | string[]) {
  const normalized = Array.isArray(value) ? value[0] : value;

  if (normalized === "unread" || normalized === "high-priority") {
    return normalized;
  }

  return "all";
}

export default async function StudentNoticesPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  await requireStudent();

  const resolvedSearchParams = await searchParams;
  const activeFilter = normalizeFilter(resolvedSearchParams.filter);
  const notices = StudentPortalService.getNotices(activeFilter);
  const filterOptions = StudentPortalService.getNoticeFilterOptions();
  const summary = getSummary(StudentPortalService.getNotices());

  return (
    <main className="min-w-0 space-y-8 px-6 py-8">
      <PageHeader
        title="Avisos"
        description="Acompanhe lembretes, ajustes de agenda e comunicações importantes do seu acompanhamento em um só lugar."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <Card key={item.id} className="rounded-[1.6rem] border-white/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] shadow-[0_22px_50px_-36px_rgba(15,23,42,0.42)]">
            <CardHeader className="space-y-2 pb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
              <CardTitle className="text-3xl tracking-tight text-slate-950">{item.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-slate-600">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="rounded-[1.9rem] border-white/70 bg-white/95 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.35)]">
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl tracking-tight text-slate-950">Central de comunicações</CardTitle>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Use os filtros para priorizar o que precisa de resposta ou apenas revisar seu histórico recente.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => {
              const Icon = filterIcons[option.value];
              const isActive = option.value === activeFilter;
              const href = option.value === "all" ? "/student/notices" : `/student/notices?filter=${option.value}`;

              return (
                <Link
                  key={option.value}
                  href={href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
                  )}
                >
                  <Icon className="size-4" />
                  {option.label}
                </Link>
              );
            })}
          </div>
        </CardHeader>
      </Card>

      {notices.length === 0 ? (
        <EmptyState
          title="Nenhum aviso encontrado"
          description="Quando houver novas comunicações dentro deste filtro, elas aparecerão aqui para facilitar seu acompanhamento."
        />
      ) : (
        <div className="grid gap-4">
          {notices.map((notice) => (
            <StudentNoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      )}

      <Card className="rounded-[1.8rem] border-dashed border-slate-200 bg-slate-50/80 shadow-none">
        <CardContent className="flex flex-col gap-3 p-6 text-sm leading-7 text-slate-600 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 size-5 text-blue-600" />
            <p>
              Os avisos do aluno foram estruturados como base do MVP. Hoje eles usam dados mockados, mas já seguem um formato pronto para receber eventos reais de agenda, confirmações e comunicados do personal.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}