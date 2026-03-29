import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus } from "lucide-react";
import { AppointmentStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { AppointmentStatusBadge } from "@/components/shared/appointment-status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { StudentAppointmentResponseBadge } from "@/components/shared/student-appointment-response-badge";
import { requireTenant } from "@/lib/tenant";
import { cancelAppointmentAction } from "@/modules/appointments/actions/appointment.action";
import { AppointmentService } from "@/modules/appointments/services/appointment.service";

type AppointmentsPageProps = {
  searchParams?: Promise<{
    status?: AppointmentStatus;
    success?: string;
  }>;
};

const successMessages: Record<string, string> = {
  created: "Compromisso cadastrado com sucesso.",
  updated: "Compromisso atualizado com sucesso.",
  canceled: "Compromisso cancelado com sucesso."
};

const statusFilterOptions: Array<{ value: string; label: string }> = [
  { value: "", label: "Todos os status" },
  { value: AppointmentStatus.SCHEDULED, label: "Agendado" },
  { value: AppointmentStatus.COMPLETED, label: "Concluído" },
  { value: AppointmentStatus.CANCELED, label: "Cancelado" },
  { value: AppointmentStatus.MISSED, label: "Faltou" }
];

export default async function AppointmentsPage({ searchParams }: AppointmentsPageProps) {
  const tenant = await requireTenant();
  const params = searchParams ? await searchParams : undefined;
  const appointments = await AppointmentService.listByTenant(tenant.id, {
    status: params?.status
  });
  const successMessage = params?.success ? successMessages[params.success] : undefined;

  return (
    <main className="space-y-8 px-6 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          title="Agenda"
          description="Acompanhe e organize os compromissos do tenant autenticado."
        />
        <Button asChild>
          <Link href="/appointments/new">
            <Plus className="size-4" />
            Novo compromisso
          </Link>
        </Button>
      </div>

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <Card className="border-white/70 bg-white/90 shadow-sm">
        <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl">Compromissos</CardTitle>
          <form className="flex w-full max-w-sm gap-2" method="get">
            <select
              name="status"
              defaultValue={params?.status ?? ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {statusFilterOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline">
              Filtrar
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <EmptyState
              title="Nenhum compromisso encontrado"
              description="Cadastre compromissos ou ajuste o filtro para visualizar resultados."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="px-4 py-3 font-medium">Título</th>
                    <th className="px-4 py-3 font-medium">Aluno</th>
                    <th className="px-4 py-3 font-medium">Início</th>
                    <th className="px-4 py-3 font-medium">Fim</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Resposta do aluno</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="text-slate-700">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-slate-950">{appointment.title}</p>
                          <p className="text-xs text-slate-500">
                            {appointment.notes ?? "Sem observações"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">{appointment.studentName}</td>
                      <td className="px-4 py-4">
                        {format(appointment.startsAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </td>
                      <td className="px-4 py-4">
                        {format(appointment.endsAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </td>
                      <td className="px-4 py-4">
                        <AppointmentStatusBadge status={appointment.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <StudentAppointmentResponseBadge status={appointment.studentResponseStatus} />
                          {appointment.studentRespondedAt ? (
                            <p className="text-xs text-slate-500">
                              Atualizado em {format(appointment.studentRespondedAt, "dd/MM HH:mm", { locale: ptBR })}
                            </p>
                          ) : null}
                          {appointment.studentResponseNote ? (
                            <p className="max-w-[220px] text-xs text-slate-500">{appointment.studentResponseNote}</p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          {appointment.status !== AppointmentStatus.CANCELED ? (
                            <form action={cancelAppointmentAction.bind(null, appointment.id)}>
                              <Button size="sm" type="submit" variant="outline">
                                Cancelar
                              </Button>
                            </form>
                          ) : null}
                          <Button asChild size="sm">
                            <Link href={`/appointments/${appointment.id}/edit`}>Editar</Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
