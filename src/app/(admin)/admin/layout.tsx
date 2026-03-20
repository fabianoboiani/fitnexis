import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AdminSidebarNav } from "@/components/shared/admin-sidebar-nav";
import { LogoutButton } from "@/components/shared/logout-button";
import { requireAdmin } from "@/lib/auth-helpers";

export default async function AdminLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-100/80">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-white/90 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-6">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <ShieldCheck className="size-5" />
            </div>
            <div className="min-w-0">
              <Link href="/admin" className="block font-semibold text-slate-950">
                Fitnexis Plataforma
              </Link>
              <p className="truncate text-sm text-slate-500">Painel global da plataforma</p>
            </div>
          </div>

          <div className="space-y-6 px-4 py-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm font-medium text-slate-900">{admin.name}</p>
              <p className="text-xs text-slate-500">{admin.email}</p>
            </div>
            <AdminSidebarNav />
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Administra??o da plataforma</p>
                <p className="text-sm text-slate-500">
                  Area global reservada para usu?rios com perfil de administrador.
                </p>
              </div>
              <LogoutButton />
            </div>
          </header>

          <div className="min-w-0 flex-1 overflow-x-hidden">{children}</div>
        </div>
      </div>
    </div>
  );
}
