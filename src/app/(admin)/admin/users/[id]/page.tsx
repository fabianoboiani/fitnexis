import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminUserForm } from "@/components/shared/admin-user-form";
import { PageHeader } from "@/components/shared/page-header";
import { SubscriptionStatusBadge } from "@/components/shared/subscription-status-badge";
import { UserRoleBadge } from "@/components/shared/user-role-badge";
import { requireAdmin } from "@/lib/auth-helpers";
import { updateAdminUserAction } from "@/modules/admin/users/actions/admin-user.action";
import { AdminUserService } from "@/modules/admin/users/services/admin-user.service";

type AdminUserDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminUserDetailsPage({ params }: AdminUserDetailsPageProps) {
  await requireAdmin();
  const { id } = await params;
  const user = await AdminUserService.getByIdOrThrow(id);
  const boundUpdateUserAction = updateAdminUserAction.bind(null, user.id);

  return (
    <main className="min-w-0 space-y-8 px-6 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          title={user.name}
          description="Detalhes administrativos do usu?rio e do tenant associado."
        />
        <Button asChild variant="outline">
          <Link href="/admin/users">Voltar para usu?rios</Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <Card className="border-white/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Resumo do usu?rio</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Nome</p>
                <p className="font-medium text-slate-950">{user.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Perfil</p>
                <UserRoleBadge role={user.role} />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">E-mail</p>
                <p>{user.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Criado em</p>
                <p>{format(user.createdAt, "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-sm text-slate-500">Atualizado em</p>
                <p>{format(user.updatedAt, "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Tenant associado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              {user.tenant ? (
                <>
                  <div className="space-y-1">
                    <p className="text-slate-500">Neg?cio</p>
                    <p className="font-medium text-slate-950">{user.tenant.businessName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500">Responsavel</p>
                    <p>{user.tenant.personalName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500">Contato</p>
                    <p>{user.tenant.email ?? "N?o informado"}</p>
                    <p>{user.tenant.phone ?? "N?o informado"}</p>
                  </div>
                  <Button asChild variant="outline">
                    <Link href={`/admin/tenants/${user.tenant.id}`}>Abrir conta</Link>
                  </Button>
                </>
              ) : (
                <p>Este usu?rio ainda n?o possui tenant operacional vinculado.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <AdminUserForm
            initialValues={AdminUserService.getFormValues(user)}
            onSubmitAction={boundUpdateUserAction}
          />

          <Card className="border-white/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Assinatura associada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              {user.subscription ? (
                <>
                  <p>Plano: {user.subscription.planName}</p>
                  <div className="flex items-center gap-2">
                    <span>Status:</span>
                    <SubscriptionStatusBadge status={user.subscription.status} />
                  </div>
                  <p>
                    Fim do per?odo:{" "}
                    {user.subscription.currentPeriodEnd
                      ? format(user.subscription.currentPeriodEnd, "dd/MM/yyyy", {
                          locale: ptBR
                        })
                      : "N?o informado"}
                  </p>
                </>
              ) : (
                <p>N?o ha assinatura associada a este usu?rio.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
