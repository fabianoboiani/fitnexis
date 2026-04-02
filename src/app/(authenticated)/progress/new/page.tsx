import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressForm } from "@/components/shared/progress-form";
import { ProgressRecordHistoryCard } from "@/components/shared/progress-record-history-card";
import { requireTenant } from "@/lib/tenant";
import { createProgressRecordFromOverviewAction } from "@/modules/progress/actions/progress.action";
import { ProgressService } from "@/modules/progress/services/progress.service";
import { StudentService } from "@/modules/students/services/student.service";

type NewProgressPageProps = {
  searchParams?: Promise<{
    studentId?: string;
    success?: string;
  }>;
};

export default async function NewProgressPage({ searchParams }: NewProgressPageProps) {
  const tenant = await requireTenant();
  const params = searchParams ? await searchParams : undefined;
  const students = await StudentService.listByTenant(tenant.id);

  const selectedStudent =
    params?.studentId ? await StudentService.getById(tenant.id, params.studentId) : null;

  const records = selectedStudent
    ? await ProgressService.listByTenant(tenant.id, selectedStudent.id)
    : [];

  return (
    <main className="space-y-8 px-6 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          title="Nova evolução"
          description="Selecione um aluno para registrar uma nova evolução e acompanhar o histórico ao lado."
        />
        <Button asChild variant="outline">
          <Link href="/progress">Voltar para evolução</Link>
        </Button>
      </div>

      {params?.success === "created" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Registro de evolução criado com sucesso.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <ProgressForm
          title="Novo registro"
          description="Escolha o aluno e preencha os dados do novo registro."
          submitLabel="Salvar evolução"
          cancelHref="/progress"
          initialValues={ProgressService.getFormValues(selectedStudent?.id)}
          studentOptions={students.map((student) => ({
            id: student.id,
            name: student.name
          }))}
          studentSelectionHrefBase="/progress/new"
          onSubmitAction={createProgressRecordFromOverviewAction}
        />

        <ProgressRecordHistoryCard
          title={selectedStudent ? `Histórico de ${selectedStudent.name}` : "Histórico do aluno"}
          emptyTitle={
            selectedStudent ? "Nenhuma evolução registrada" : "Selecione um aluno para visualizar"
          }
          emptyDescription={
            selectedStudent
              ? "Os registros deste aluno aparecerão aqui conforme forem cadastrados."
              : "Ao escolher um aluno no formulário, o histórico recente será carregado nesta área."
          }
          records={records}
        />
      </div>
    </main>
  );
}