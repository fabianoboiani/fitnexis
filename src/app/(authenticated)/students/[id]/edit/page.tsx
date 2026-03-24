import { PageHeader } from "@/components/shared/page-header";
import { StudentForm } from "@/components/shared/student-form";
import { requireTenant } from "@/lib/tenant";
import { updateStudentAction } from "@/modules/students/actions/student.action";
import { StudentService } from "@/modules/students/services/student.service";

type EditStudentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const tenant = await requireTenant();
  const { id } = await params;
  const student = await StudentService.getByIdOrThrow(tenant.id, id);
  const boundUpdateAction = updateStudentAction.bind(null, student.id);

  return (
    <main className="space-y-8 px-6 py-8">
      <PageHeader
        title={`Editar ${student.name}`}
        description="Atualiz? os dados do aluno sem perder o isolamento por tenant."
      />
      <StudentForm
        title="Edicao de aluno"
        description="Os dados abaixo pertencem apenas ao tenant autenticado."
        submitLabel="Salvar alterações"
        initialValues={StudentService.getFormValues(student)}
        onSubmitAction={boundUpdateAction}
      />
    </main>
  );
}
