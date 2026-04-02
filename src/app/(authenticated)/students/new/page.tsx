import { PageHeader } from "@/components/shared/page-header";
import { StudentForm } from "@/components/shared/student-form";
import { createStudentAction } from "@/modules/students/actions/student.action";
import { StudentService } from "@/modules/students/services/student.service";

export default function NewStudentPage() {
  return (
    <main className="space-y-8 px-6 py-8">
      <PageHeader
        title="Novo aluno"
        description="Cadastre um novo aluno no tenant autenticado."
      />
      <StudentForm
        title="Cadastro de aluno"
        description="Preencha os dados principais do aluno. Os campos de contato e observações são opcionais."
        submitLabel="Cadastrar aluno"
        initialValues={StudentService.getFormValues()}
        onSubmitAction={createStudentAction}
      />
    </main>
  );
}
