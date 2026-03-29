import type { ReactNode } from "react";
import Link from "next/link";
import { Dumbbell, Sparkles } from "lucide-react";
import { LogoutButton } from "@/components/shared/logout-button";
import { AppSidebarNav } from "@/components/shared/app-sidebar-nav";
import { Badge } from "@/components/ui/badge";
import { requirePersonal } from "@/lib/auth-helpers";
import { requireTenant } from "@/lib/tenant";

export default async function AuthenticatedLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await requirePersonal();
  const tenant = await requireTenant();
  const firstName = user.name.split(" ")[0] ?? user.name;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_34%,#f8fafc_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1560px] flex-col lg:flex-row">
        <aside className="border-b border-slate-200/80 bg-white/85 backdrop-blur-xl lg:min-h-screen lg:w-80 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200/70 px-6 py-6">
            <div className="flex items-start gap-4">
              <div className="flex size-12 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-700 via-cyan-600 to-sky-500 text-white shadow-[0_18px_40px_-22px_rgba(14,165,233,0.8)]">
                <Dumbbell className="size-5" />
              </div>
              <div className="min-w-0 space-y-1.5">
                <Link href="/dashboard" className="block text-lg font-semibold tracking-tight text-slate-950">
                  Fitnexis
                </Link>
                <p className="truncate text-sm text-slate-500">{tenant.businessName}</p>
                <Badge variant="outline" className="rounded-full border-cyan-200 bg-cyan-50 text-cyan-800">
                  Operação do personal
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-5 py-6">
            <div className="rounded-[1.75rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(239,246,255,0.88))] p-4 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.35)]">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-3 text-sm text-slate-600">
                <p className="font-medium text-slate-900">Olá, {firstName}</p>
                <p className="mt-1 leading-6">Sua rotina comercial e operacional fica organizada em um painel claro e consistente.</p>
              </div>
            </div>

            <AppSidebarNav />
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
            <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-500">
                  <Sparkles className="size-4 text-cyan-600" />
                  <span className="text-xs font-semibold uppercase tracking-[0.22em]">Painel do personal</span>
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight text-slate-950">Controle sua operação com mais clareza</p>
                  <p className="text-sm leading-6 text-slate-500">
                    Alunos, agenda, pagamentos e evolução em uma experiência mais refinada e profissional.
                  </p>
                </div>
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
