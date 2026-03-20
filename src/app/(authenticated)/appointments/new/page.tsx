import { PageHeader } from "@/components/shared/page-header";
import { AppointmentForm } from "@/components/shared/appointment-form";
import { requireTenant } from "@/lib/tenant";
import { createAppointmentAction } from "@/modules/appointments/actions/appointment.action";
import { AppointmentService } from "@/modules/appointments/services/appointment.service";
import { StudentService } from "@/modules/students/services/student.service";

export default async function NewAppointmentPage() {
  const tenant = await requireTenant();
  const students = await StudentService.listByTenant(tenant.id);

  return (
    <main className="space-y-8 px-6 py-8">
      <PageHeader
        title="Novo compromisso"
        description="Cadastre um compromisso com um aluno do tenant atual."
      />
      <AppointmentForm
        title="Cadastro de compromisso"
        description="Informe o aluno, t?tulo, horario e observa??es do atendimento."
        submitLabel="Cadastrar compromisso"
        initialValues={AppointmentService.getFormValues()}
        studentOptions={students.map((student) => ({
          id: student.id,
          name: student.name
        }))}
        onSubmitAction={createAppointmentAction}
      />
    </main>
  );
}
