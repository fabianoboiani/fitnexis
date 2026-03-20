import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressForm } from "@/components/shared/progress-form";
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
  const boundCreateAction = createProgressRecordAction;

  return (
    <main className="space-y-8 px-6 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          title={`Evolu??o de ${student.name}`}
          description="Hist?rico de evolu??o f?sica vinculado ao aluno e ao tenant atual."
        />
        <Button asChild variant="outline">
          <Link href={`/students/${student.id}`}>Voltar para aluno</Link>
        </Button>
      </div>

      {resolvedSearchParams?.success === "created" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Registro de evolu??o criado com sucesso.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <ProgressForm
          title="Novo registro"
          description="Adicione um novo registro de evolu??o para este aluno."
          submitLabel="Salvar evolu??o"
          cancelHref={`/students/${student.id}`}
          initialValues={ProgressService.getFormValues(student.id)}
          studentOptions={[{ id: student.id, name: student.name }]}
          onSubmitAction={boundCreateAction}
        />

        <Card className="border-white/70 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Hist?rico</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <EmptyState
                title="Nenhuma evolu??o registrada"
                description="Os registros deste aluno aparecerao aqui conforme forem cadastrados."
              />
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="rounded-2xl border border-slate-200 px-4 py-4"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <p className="font-medium text-slate-950">
                        {format(record.recordedAt, "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                        <span>Peso: {record.weight ? `${record.weight} kg` : "N?o informado"}</span>
                        <span>
                          Gordura: {record.bodyFat ? `${record.bodyFat}%` : "N?o informada"}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      {record.notes ?? "Sem observa??es neste registro."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
