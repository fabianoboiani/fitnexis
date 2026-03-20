import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StudentStatusBadge } from "@/components/shared/status-badge";
import { requireTenant } from "@/lib/tenant";
import { StudentService } from "@/modules/students/services/student.service";

type StudentDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    success?: string;
  }>;
};

export default async function StudentDetailsPage({
  params,
  searchParams
}: StudentDetailsPageProps) {
  const tenant = await requireTenant();
  const { id } = await params;
  const student = await StudentService.getByIdOrThrow(tenant.id, id);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <main className="space-y-8 px-6 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          title={student.name}
          description="Visualizacao detalhada do aluno no tenant atual."
        />
        <Button asChild>
          <Link href={`/students/${student.id}/edit`}>Editar aluno</Link>
        </Button>
      </div>

      {resolvedSearchParams?.success === "updated" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Aluno atualizado com sucesso.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/70 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Dados principais</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Nome</p>
              <p className="font-medium text-slate-950">{student.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Status</p>
              <StudentStatusBadge status={student.status} />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">E-mail</p>
              <p>{student.email ?? "N?o informado"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Telefone</p>
              <p>{student.phone ?? "N?o informado"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Nascimento</p>
              <p>
                {student.birthDate
                  ? format(student.birthDate, "dd/MM/yyyy", { locale: ptBR })
                  : "N?o informado"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Criado em</p>
              <p>{format(student.createdAt, "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-sm text-slate-500">Meta</p>
              <p>{student.goal ?? "N?o informada"}</p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-sm text-slate-500">Observa??es</p>
              <p className="whitespace-pre-wrap">{student.notes ?? "Nenhuma observacao."}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Pr?ximos atalhos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full" variant="outline">
                <Link href={`/payments?studentId=${student.id}`}>Ver pagamentos do aluno</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href={`/students/${student.id}/progress`}>Ver evolu??o do aluno</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p>Tenant: {tenant.businessName}</p>
              <p>Aluno vinculado com isolamento por tenantId.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
