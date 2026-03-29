import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StudentManualNoticeForm } from "@/components/shared/student-manual-notice-form";
import { StudentPortalAccessForm } from "@/components/shared/student-portal-access-form";
import { StudentStatusBadge } from "@/components/shared/status-badge";
import { requireTenant } from "@/lib/tenant";
import { createManualStudentNoticeAction } from "@/modules/student/notices/actions/student-notice.action";
import {
  disableStudentPortalAccessAction,
  enableStudentPortalAccessAction,
  reactivateStudentPortalAccessAction
} from "@/modules/students/actions/student.action";
import { StudentService } from "@/modules/students/services/student.service";

type StudentDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    success?: string;
  }>;
};

const successMessages: Record<string, string> = {
  updated: "Aluno atualizado com sucesso.",
  "portal-access-enabled": "Acesso ao portal habilitado com sucesso.",
  "portal-access-disabled": "Acesso ao portal desativado com sucesso."
};

export default async function StudentDetailsPage({
  params,
  searchParams
}: StudentDetailsPageProps) {
  const tenant = await requireTenant();
  const { id } = await params;
  const student = await StudentService.getByIdOrThrow(tenant.id, id);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const successMessage = resolvedSearchParams?.success
    ? successMessages[resolvedSearchParams.success]
    : undefined;
  const boundEnablePortalAccessAction = enableStudentPortalAccessAction.bind(null, student.id);
  const boundTogglePortalAccessAction = student.hasPortalAccess
    ? disableStudentPortalAccessAction.bind(null, student.id)
    : reactivateStudentPortalAccessAction.bind(null, student.id);
  const boundCreateManualNoticeAction = createManualStudentNoticeAction.bind(null, student.id);

  const portalBadgeLabel = student.hasPortalAccess
    ? "Acesso habilitado"
    : student.hasPortalAccount
      ? "Acesso desativado"
      : "Sem acesso";

  return (
    <main className="space-y-8 px-6 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader title={student.name} description="Visualização detalhada do aluno no tenant atual." />
        <Button asChild>
          <Link href={`/students/${student.id}/edit`}>Editar aluno</Link>
        </Button>
      </div>

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/70 bg-white/90 shadow-sm backdrop-blur-sm">
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
              <p>{student.email ?? "Não informado"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Telefone</p>
              <p>{student.phone ?? "Não informado"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Nascimento</p>
              <p>
                {student.birthDate
                  ? format(student.birthDate, "dd/MM/yyyy", { locale: ptBR })
                  : "Não informado"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Criado em</p>
              <p>{format(student.createdAt, "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-sm text-slate-500">Meta</p>
              <p>{student.goal ?? "Não informada"}</p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <p className="text-sm text-slate-500">Observações</p>
              <p className="whitespace-pre-wrap">{student.notes ?? "Nenhuma observação."}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <StudentPortalAccessForm
            studentName={student.name}
            hasPortalAccount={student.hasPortalAccount}
            hasPortalAccess={student.hasPortalAccess}
            portalAccessEmail={student.portalAccessEmail}
            initialEmail={student.portalAccessEmail ?? student.email ?? ""}
            onEnableAction={boundEnablePortalAccessAction}
            onToggleAccessAction={boundTogglePortalAccessAction}
          />

          <StudentManualNoticeForm onSubmitAction={boundCreateManualNoticeAction} />

          <Card className="border-white/70 bg-white/90 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>Tenant: {tenant.businessName}</p>
              <div className="flex items-center gap-2">
                <span>Portal:</span>
                <Badge variant={student.hasPortalAccess ? "default" : "outline"}>{portalBadgeLabel}</Badge>
              </div>
              {student.portalAccessEmail ? <p>Login do aluno: {student.portalAccessEmail}</p> : null}
              <p>Aluno vinculado com isolamento por tenantId.</p>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/90 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Próximos atalhos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full" variant="outline">
                <Link href={`/payments?studentId=${student.id}`}>Ver pagamentos do aluno</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href={`/students/${student.id}/progress`}>Ver evolução do aluno</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}