import Link from "next/link";
import { UserRole } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { UserRoleBadge } from "@/components/shared/user-role-badge";
import { requireAdmin } from "@/lib/auth-helpers";
import { userRoleLabels } from "@/lib/enum-labels";
import { AdminUserService } from "@/modules/admin/users/services/admin-user.service";

type AdminUsersPageProps = {
  searchParams?: Promise<{
    name?: string;
    email?: string;
    role?: string;
  }>;
};

function parseRole(role?: string) {
  if (!role) {
    return undefined;
  }

  return Object.values(UserRole).includes(role as UserRole) ? (role as UserRole) : undefined;
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await requireAdmin();

  const params = searchParams ? await searchParams : undefined;
  const name = params?.name?.trim() ?? "";
  const email = params?.email?.trim() ?? "";
  const role = parseRole(params?.role);
  const users = await AdminUserService.list({
    name: name || undefined,
    email: email || undefined,
    role
  });

  return (
    <main className="min-w-0 space-y-8 px-6 py-8">
      <PageHeader
        title="Usuários"
        description="Visualize e filtre usuários globais da plataforma com contexto de tenant."
      />

      <Card className="border-white/70 bg-white/90 shadow-sm">
        <CardHeader className="gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl">Lista de usuários</CardTitle>
            <p className="text-sm text-slate-600">
              Filtre por nome, e-mail e perfil para localizar rapidamente um usuário.
            </p>
          </div>
          <form className="grid gap-3 lg:grid-cols-[1fr_1fr_0.8fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                name="name"
                defaultValue={name}
                placeholder="Buscar por nome"
                className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm"
              />
            </div>
            <input
              name="email"
              defaultValue={email}
              placeholder="Buscar por e-mail"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />

            <select
              name="role"
              defaultValue={role ?? ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Todos os perfis</option>
              <option value={UserRole.ADMIN}>{userRoleLabels.ADMIN}</option>
              <option value={UserRole.PERSONAL}>{userRoleLabels.PERSONAL}</option>
              <option value={UserRole.STUDENT}>{userRoleLabels.STUDENT}</option>
            </select>

            <div className="flex gap-2">
              <Button type="submit" variant="outline">
                Filtrar
              </Button>
              <Button asChild type="button" variant="ghost">
                <Link href="/admin/users">Limpar</Link>
              </Button>
            </div>
          </form>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <EmptyState
              title="Nenhum usuário encontrado"
              description={
                name || email || role
                  ? "Tente ajustar os filtros para localizar outros usuários."
                  : "Quando novos usuários forem cadastrados, eles aparecerão aqui."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">E-mail</th>
                    <th className="px-4 py-3 font-medium">Perfil</th>
                    <th className="px-4 py-3 font-medium">Criado em</th>
                    <th className="px-4 py-3 font-medium">Tenant vinculado</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="text-slate-700">
                      <td className="px-4 py-4 font-medium text-slate-950">{user.name}</td>
                      <td className="px-4 py-4">{user.email}</td>
                      <td className="px-4 py-4">
                        <UserRoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-4">{format(user.createdAt, "dd/MM/yyyy", { locale: ptBR })}</td>
                      <td className="px-4 py-4">
                        {user.tenantBusinessName ? (
                          <div>
                            <p className="font-medium text-slate-950">{user.tenantBusinessName}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500">Não vinculado</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button asChild size="sm">
                          <Link href={`/admin/users/${user.id}`}>Visualizar</Link>
                        </Button>
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
