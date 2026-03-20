import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminSubscriptionStatusForm } from "@/components/shared/admin-subscription-status-form";
import { AdminTenantProfileForm } from "@/components/shared/admin-tenant-profile-form";
import { PageHeader } from "@/components/shared/page-header";
import { SubscriptionStatusBadge } from "@/components/shared/subscription-status-badge";
import { UserRoleBadge } from "@/components/shared/user-role-badge";
import { requireAdmin } from "@/lib/auth-helpers";
import {
  updateAdminSubscriptionStatusAction,
  updateAdminTenantAction
} from "@/modules/admin/tenants/actions/admin-tenant.action";
import { AdminTenantService } from "@/modules/admin/tenants/services/admin-tenant.service";

type AdminTenantDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminTenantDetailsPage({
  params
}: AdminTenantDetailsPageProps) {
  await requireAdmin();
  const { id } = await params;
  const tenant = await AdminTenantService.getByIdOrThrow(id);
  const boundTenantAction = updateAdminTenantAction.bind(null, tenant.id);
  const boundSubscriptionAction = updateAdminSubscriptionStatusAction.bind(null, tenant.id);

  return (
    <main className="min-w-0 space-y-8 px-6 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          title={tenant.businessName}
          description="Detalhes administrativos globais do tenant."
        />
        <Button asChild variant="outline">
          <Link href="/admin/tenants">Voltar para tenants</Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="border-white/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Resumo do tenant</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Neg?cio</p>
                <p className="font-medium text-slate-950">{tenant.businessName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Personal</p>
                <p>{tenant.personalName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">E-mail</p>
                <p>{tenant.email ?? "N?o informado"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Telefone</p>
                <p>{tenant.phone ?? "N?o informado"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Criado em</p>
                <p>{format(tenant.createdAt, "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Situacao</p>
                <Badge variant={tenant.isActive ? "default" : "outline"}>
                  {tenant.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Owner user</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Nome</p>
                <p>{tenant.ownerUser.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">E-mail</p>
                <p>{tenant.ownerUser.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Perfil</p>
                <UserRoleBadge role={tenant.ownerUser.role} />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Criado em</p>
                <p>{format(tenant.ownerUser.createdAt, "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="border-white/70 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Alunos</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{tenant.counts.students}</CardContent>
            </Card>
            <Card className="border-white/70 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Pagamentos</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{tenant.counts.payments}</CardContent>
            </Card>
            <Card className="border-white/70 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Compromissos</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{tenant.counts.appointments}</CardContent>
            </Card>
            <Card className="border-white/70 bg-white/90 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Evolucoes</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-bold">
                {tenant.counts.progressRecords}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <AdminTenantProfileForm
            initialValues={AdminTenantService.getFormValues(tenant)}
            onSubmitAction={boundTenantAction}
          />

          <AdminSubscriptionStatusForm
            initialValues={{
              status: tenant.subscription?.status ?? "TRIAL"
            }}
            onSubmitAction={boundSubscriptionAction}
          />

          <Card className="border-white/70 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Assinatura atual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>Plano: {tenant.subscription?.planName ?? "Manual"}</p>
              <div className="flex items-center gap-2">
                <span>Status:</span>
                <SubscriptionStatusBadge status={tenant.subscription?.status ?? "TRIAL"} />
              </div>
              <p>
                Fim do per?odo:{" "}
                {tenant.subscription?.currentPeriodEnd
                  ? format(tenant.subscription.currentPeriodEnd, "dd/MM/yyyy", { locale: ptBR })
                  : "N?o informado"}
              </p>
              <p>Stripe customer: {tenant.subscription?.stripeCustomerId ?? "N?o informado"}</p>
              <p>
                Stripe subscription: {tenant.subscription?.stripeSubscriptionId ?? "N?o informado"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
