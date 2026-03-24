import { CalendarDays, Filter } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StudentAgendaItemCard } from "@/components/shared/student-agenda-item-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireStudent } from "@/lib/auth-helpers";
import {
  studentAgendaStatuses,
  StudentPortalService,
  type StudentAppointmentStatus
} from "@/modules/student/services/student-portal.service";

type StudentAgendaPageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

function parseStatus(status?: string): StudentAppointmentStatus | "Todos" {
  if (!status || status === "Todos") {
    return "Todos";
  }

  return studentAgendaStatuses.includes(status as StudentAppointmentStatus)
    ? (status as StudentAppointmentStatus)
    : "Todos";
}

export default async function StudentAgendaPage({ searchParams }: StudentAgendaPageProps) {
  await requireStudent();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedStatus = parseStatus(resolvedSearchParams?.status);
  const appointments = StudentPortalService.getAgenda(selectedStatus);
  const statusOptions = StudentPortalService.getAgendaStatusOptions();

  return (
    <main className="min-w-0 space-y-8 px-6 py-8">
      <PageHeader
        title="Minha Agenda"
        description="Visualize seus próximos compromissos e acompanhe solicitações relacionadas às suas sessões."
      />

      <Card className="border-white/70 bg-white/90 shadow-sm">
        <CardHeader className="flex-row items-center gap-3 pb-4">
          <Filter className="size-5 text-primary" />
          <CardTitle className="text-xl">Filtrar agenda</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-[220px] space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="status">
                Status da sessão
              </label>
              <select
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue={selectedStatus}
                id="status"
                name="status"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
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
          <CalendarDays className="size-5 text-primary" />
          <CardTitle className="text-xl">Compromissos do aluno</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-7 text-slate-600">
            Você pode confirmar presença, solicitar reagendamento ou cancelar uma sessão. Toda alteração é tratada de forma controlada e pode depender de aprovação do personal.
          </p>
        </CardContent>
      </Card>

      {appointments.length === 0 ? (
        <EmptyState
          title="Nenhum compromisso encontrado"
          description="Ajuste o filtro ou aguarde novos agendamentos organizados pelo seu personal."
        />
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <StudentAgendaItemCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}
    </main>
  );
}
