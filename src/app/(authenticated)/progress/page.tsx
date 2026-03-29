import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { requireTenant } from "@/lib/tenant";
import { ProgressService } from "@/modules/progress/services/progress.service";
import { StudentService } from "@/modules/students/services/student.service";

type ProgressPageProps = {
  searchParams?: Promise<{
    studentId?: string;
  }>;
};

export default async function ProgressPage({ searchParams }: ProgressPageProps) {
  const tenant = await requireTenant();
  const params = searchParams ? await searchParams : undefined;
  const [records, students] = await Promise.all([
    ProgressService.listByTenant(tenant.id, params?.studentId),
    StudentService.listByTenant(tenant.id)
  ]);

  return (
    <main className="space-y-8 px-6 py-8">
      <PageHeader
        title="Evolução Física"
        description="Acompanhe os registros recentes de evolução por aluno."
      />

      <Card className="border-white/70 bg-white/90 shadow-sm">
        <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl">Registros recentes</CardTitle>
          <form className="flex w-full max-w-sm gap-2" method="get">
            <select
              name="studentId"
              defaultValue={params?.studentId ?? ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Todos os alunos</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline">
              Filtrar
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <EmptyState
              title="Nenhum registro encontrado"
              description="Cadastre evoluções nos alunos para visualizar o histórico aqui."
            />
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-slate-950">{record.studentName}</p>
                    <p className="text-sm text-slate-500">
                      {format(record.recordedAt, "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <span>Peso: {record.weight ? `${record.weight} kg` : "Não informado"}</span>
                    <span>Gordura: {record.bodyFat ? `${record.bodyFat}%` : "Não informada"}</span>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/students/${record.studentId}/progress`}>Ver aluno</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
