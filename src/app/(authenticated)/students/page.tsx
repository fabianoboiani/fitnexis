import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StudentStatusBadge } from "@/components/shared/status-badge";
import { requireTenant } from "@/lib/tenant";
import { StudentService } from "@/modules/students/services/student.service";

type StudentsPageProps = {
  searchParams?: Promise<{
    search?: string;
    success?: string;
  }>;
};

const successMessages: Record<string, string> = {
  created: "Aluno cadastrado com sucesso.",
  updated: "Aluno atualizado com sucesso.",
  "portal-access-enabled": "Acesso ao portal habilitado com sucesso."
};

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const tenant = await requireTenant();
  const params = searchParams ? await searchParams : undefined;
  const search = params?.search?.trim() ?? "";
  const students = await StudentService.listByTenant(tenant.id, search);
  const successMessage = params?.success ? successMessages[params.success] : undefined;

  return (
    <main className="space-y-8 px-6 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader title="Alunos" description="Gerencie a base de alunos do tenant autenticado." />
        <Button asChild>
          <Link href="/students/new">
            <Plus className="size-4" />
            Novo aluno
          </Link>
        </Button>
      </div>

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <Card className="border-white/70 bg-white/90 shadow-sm backdrop-blur-sm">
        <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl">Lista de alunos</CardTitle>
          <form className="flex w-full max-w-md items-center gap-2" method="get">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                name="search"
                defaultValue={search}
                placeholder="Buscar por nome"
                className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <Button type="submit" variant="outline">
              Buscar
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <EmptyState
              title={search ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
              description={
                search
                  ? "Tente ajustar o termo buscado para encontrar outros alunos deste tenant."
                  : "Comece cadastrando o primeiro aluno para visualizar a lista aqui."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="px-4 py-3 font-medium">Aluno</th>
                    <th className="px-4 py-3 font-medium">Contato</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Portal</th>
                    <th className="px-4 py-3 font-medium">Meta</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student.id} className="text-slate-700">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-slate-950">{student.name}</p>
                          <p className="text-xs text-slate-500">
                            Criado em {student.createdAt.toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p>{student.email ?? "Sem e-mail"}</p>
                          <p className="text-xs text-slate-500">{student.phone ?? "Sem telefone"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StudentStatusBadge status={student.status} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <Badge variant={student.hasPortalAccess ? "default" : "outline"}>
                            {student.hasPortalAccess
                              ? "Com acesso"
                              : student.hasPortalAccount
                                ? "Acesso desativado"
                                : "Sem acesso"}
                          </Badge>
                          <p className="text-xs text-slate-500">
                            {student.portalAccessEmail ?? "Portal ainda não habilitado"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">{student.goal ?? "Não informada"}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/students/${student.id}`}>Visualizar</Link>
                          </Button>
                          <Button asChild size="sm">
                            <Link href={`/students/${student.id}/edit`}>Editar</Link>
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
