import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressForm } from "@/components/shared/progress-form";
import { ProgressRecordHistoryCard } from "@/components/shared/progress-record-history-card";
import { requireTenant } from "@/lib/tenant";
import { createProgressRecordAction } from "@/modules/progress/actions/progress.action";
import { ProgressService } from "@/modules/progress/services/progress.service";
import { StudentService } from "@/modules/students/services/student.service";

type StudentProgressPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    success?: string;
  }>;
};

export default async function StudentProgressPage({
  params,
  searchParams
}: StudentProgressPageProps) {
  const tenant = await requireTenant();
  const { id } = await params;
  const student = await StudentService.getByIdOrThrow(tenant.id, id);
  const records = await ProgressService.listByTenant(tenant.id, student.id);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <main className="space-y-8 px-6 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          title={`Evolução de ${student.name}`}
          description="Histórico de evolução física vinculado ao aluno e ao tenant atual."
        />
        <Button asChild variant="outline">
          <Link href={`/students/${student.id}`}>Voltar para aluno</Link>
        </Button>
      </div>

      {resolvedSearchParams?.success === "created" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Registro de evolução criado com sucesso.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <ProgressForm
          title="Novo registro"
          description="Adicione um novo registro de evolução para este aluno."
          submitLabel="Salvar evolução"
          cancelHref={`/students/${student.id}`}
          initialValues={ProgressService.getFormValues(student.id)}
          studentOptions={[{ id: student.id, name: student.name }]}
          onSubmitAction={createProgressRecordAction}
        />

        <ProgressRecordHistoryCard records={records} />
      </div>
    </main>
  );
}