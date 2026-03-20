import Link from "next/link";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SubscriptionStatusBadge } from "@/components/shared/subscription-status-badge";
import { requireAdmin } from "@/lib/auth-helpers";
import { AdminTenantService } from "@/modules/admin/tenants/services/admin-tenant.service";

type AdminTenantsPageProps = {
  searchParams?: Promise<{
    businessName?: string;
    personalName?: string;
    email?: string;
  }>;
};

export default async function AdminTenantsPage({ searchParams }: AdminTenantsPageProps) {
  await requireAdmin();
  const params = searchParams ? await searchParams : undefined;
  const businessName = params?.businessName?.trim() ?? "";
  const personalName = params?.personalName?.trim() ?? "";
  const email = params?.email?.trim() ?? "";
  const tenants = await AdminTenantService.list({
    businessName: businessName || undefined,
    personalName: personalName || undefined,
    email: email || undefined
  });

  return (
    <main className="min-w-0 space-y-8 px-6 py-8">
      <PageHeader
        title="Tenants"
        description="Visualize e pesquise clientes SaaS cadastrados na plataforma."
      />

      <Card className="border-white/70 bg-white/90 shadow-sm">
        <CardHeader className="gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl">Lista de tenants</CardTitle>
            <p className="text-sm text-slate-600">
              Filtre por neg?cio, nome do personal ou e-mail para localizar clientes com mais precis?o.
            </p>
          </div>
          <form className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]" method="get">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                name="businessName"
                defaultValue={businessName}
                placeholder="Nome do neg?cio"
                className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm"
              />
            </div>
            <input
              name="personalName"
              defaultValue={personalName}
              placeholder="Nome do personal"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
            <input
              name="email"
              defaultValue={email}
              placeholder="E-mail do tenant ou owner"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
            <div className="flex gap-2">
              <Button type="submit" variant="outline">
                Filtrar
              </Button>
              <Button asChild type="button" variant="ghost">
                <Link href="/admin/tenants">Limpar</Link>
              </Button>
            </div>
          </form>
        </CardHeader>
        <CardContent>
          {tenants.length === 0 ? (
            <EmptyState
              title="Nenhum tenant encontrado"
              description={
                businessName || personalName || email
                  ? "Tente ajustar a busca para localizar outros tenants."
                  : "Quando novos tenants forem cadastrados, eles aparecerao aqui."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="px-4 py-3 font-medium">Neg?cio</th>
                    <th className="px-4 py-3 font-medium">Personal</th>
                    <th className="px-4 py-3 font-medium">Contato</th>
                    <th className="px-4 py-3 font-medium">Owner user</th>
                    <th className="px-4 py-3 font-medium">Criado em</th>
                    <th className="px-4 py-3 font-medium">Assinatura</th>
                    <th className="px-4 py-3 font-medium">Situacao</th>
                    <th className="px-4 py-3 font-medium text-right">A??es</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="text-slate-700">
                      <td className="px-4 py-4 font-medium text-slate-950">{tenant.businessName}</td>
                      <td className="px-4 py-4">{tenant.personalName}</td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p>{tenant.email ?? "Sem e-mail"}</p>
                          <p className="text-xs text-slate-500">{tenant.phone ?? "Sem telefone"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">{tenant.ownerUserEmail}</td>
                      <td className="px-4 py-4">
                        {tenant.createdAt.toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-4">
                        {tenant.subscriptionStatus ? (
                          <SubscriptionStatusBadge status={tenant.subscriptionStatus} />
                        ) : (
                          "Sem assinatura"
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={tenant.isActive ? "default" : "outline"}>
                          {tenant.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          <Button asChild size="sm">
                            <Link href={`/admin/tenants/${tenant.id}`}>Visualizar</Link>
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
