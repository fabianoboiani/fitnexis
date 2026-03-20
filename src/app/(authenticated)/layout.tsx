import type { ReactNode } from "react";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { LogoutButton } from "@/components/shared/logout-button";
import { AppSidebarNav } from "@/components/shared/app-sidebar-nav";
import { requireTenant } from "@/lib/tenant";
import { requireAuth } from "@/lib/auth-helpers";

export default async function AuthenticatedLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await requireAuth();
  const tenant = await requireTenant();

  return (
    <div className="min-h-screen bg-slate-100/80">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-white/90 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-6">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Dumbbell className="size-5" />
            </div>
            <div className="min-w-0">
              <Link href="/dashboard" className="block font-semibold text-slate-950">
                Fitnexis
              </Link>
              <p className="truncate text-sm text-slate-500">{tenant.businessName}</p>
            </div>
          </div>

          <div className="space-y-6 px-4 py-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <AppSidebarNav />
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Area autenticada</p>
                <p className="text-sm text-slate-500">
                  Tudo aqui respeita o escopo do tenant atual.
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
