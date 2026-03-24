import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";
import { AdminSidebarNav } from "@/components/shared/admin-sidebar-nav";
import { LogoutButton } from "@/components/shared/logout-button";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth-helpers";

export default async function AdminLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const admin = await requireAdmin();
  const firstName = admin.name.split(" ")[0] ?? admin.name;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_34%,#f8fafc_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1560px] flex-col lg:flex-row">
        <aside className="border-b border-slate-200/80 bg-white/85 backdrop-blur-xl lg:min-h-screen lg:w-80 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200/70 px-6 py-6">
            <div className="flex items-start gap-4">
              <div className="flex size-12 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-950 via-slate-800 to-slate-700 text-white shadow-[0_18px_40px_-22px_rgba(15,23,42,0.8)]">
                <ShieldCheck className="size-5" />
              </div>
              <div className="min-w-0 space-y-1.5">
                <Link href="/admin" className="block text-lg font-semibold tracking-tight text-slate-950">
                  Fitnexis Plataforma
                </Link>
                <p className="truncate text-sm text-slate-500">Painel global da plataforma</p>
                <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 text-slate-700">
                  Operação administrativa
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-5 py-6">
            <div className="rounded-[1.75rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(241,245,249,0.9))] p-4 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.35)]">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                  {admin.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">{admin.name}</p>
                  <p className="truncate text-xs text-slate-500">{admin.email}</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-3 text-sm text-slate-600">
                <p className="font-medium text-slate-900">Olá, {firstName}</p>
                <p className="mt-1 leading-6">Acompanhe a operação global da plataforma com uma navegação clara e indicadores consolidados.</p>
              </div>
            </div>

            <AdminSidebarNav />
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
            <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-500">
                  <Sparkles className="size-4 text-slate-700" />
                  <span className="text-xs font-semibold uppercase tracking-[0.22em]">Painel administrativo</span>
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight text-slate-950">Visão central da plataforma Fitnexis</p>
                  <p className="text-sm leading-6 text-slate-500">
                    Tenants, usuários, assinaturas e ajustes globais em uma experiência mais limpa e consistente.
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