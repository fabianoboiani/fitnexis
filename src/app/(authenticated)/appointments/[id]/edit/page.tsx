import { PageHeader } from "@/components/shared/page-header";
import { AppointmentForm } from "@/components/shared/appointment-form";
import { requireTenant } from "@/lib/tenant";
import { updateAppointmentAction } from "@/modules/appointments/actions/appointment.action";
import { AppointmentService } from "@/modules/appointments/services/appointment.service";
import { StudentService } from "@/modules/students/services/student.service";

type EditAppointmentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditAppointmentPage({ params }: EditAppointmentPageProps) {
  const tenant = await requireTenant();
  const { id } = await params;
  const [appointment, students] = await Promise.all([
    AppointmentService.getByIdOrThrow(tenant.id, id),
    StudentService.listByTenant(tenant.id)
  ]);
  const boundUpdateAction = updateAppointmentAction.bind(null, appointment.id);

  return (
    <main className="space-y-8 px-6 py-8">
      <PageHeader
        title="Editar compromisso"
        description="Atualiz? os dados do compromisso mantendo o isolamento por tenant."
      />
      <AppointmentForm
        title="Edicao de compromisso"
        description="Somente alunos do tenant autenticado podem ser vinculados a este compromisso."
        submitLabel="Salvar alterações"
        initialValues={AppointmentService.getFormValues(appointment)}
        studentOptions={students.map((student) => ({
          id: student.id,
          name: student.name
        }))}
        onSubmitAction={boundUpdateAction}
      />
    </main>
  );
}
