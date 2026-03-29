import type { ReactNode } from "react";
import Link from "next/link";
import { Sparkles, UserRound } from "lucide-react";
import { LogoutButton } from "@/components/shared/logout-button";
import { StudentSidebarNav } from "@/components/shared/student-sidebar-nav";
import { Badge } from "@/components/ui/badge";
import { requireAuth } from "@/lib/auth-helpers";
import { requireCurrentStudent } from "@/lib/student";

export default async function StudentLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await requireAuth();
  const student = await requireCurrentStudent();
  const firstName = student.name.split(" ")[0] ?? student.name;
  const accountEmail = student.user?.email ?? user.email;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_28%),linear-gradient(180deg,#f7faff_0%,#eef4ff_34%,#f8fafc_100%)]">
      <div className="mx-auto flex min-h-screen max-w-[1560px] flex-col lg:flex-row">
        <aside className="border-b border-slate-200/80 bg-white/85 backdrop-blur-xl lg:min-h-screen lg:w-80 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200/70 px-6 py-6">
            <div className="flex items-start gap-4">
              <div className="flex size-12 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-500 to-sky-400 text-white shadow-[0_18px_40px_-22px_rgba(14,165,233,0.85)]">
                <UserRound className="size-5" />
              </div>
              <div className="min-w-0 space-y-1.5">
                <Link href="/student" className="block text-lg font-semibold tracking-tight text-slate-950">
                  Fitnexis
                </Link>
                <p className="truncate text-sm text-slate-500">Área do aluno</p>
                <Badge variant="outline" className="rounded-full border-cyan-200 bg-cyan-50 text-cyan-800">
                  Acompanhamento conectado
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-5 py-6">
            <div className="rounded-[1.75rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(239,246,255,0.88))] p-4 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.35)]">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                  {student.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">{student.name}</p>
                  <p className="truncate text-xs text-slate-500">{accountEmail}</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-3 text-sm text-slate-600">
                <p className="font-medium text-slate-900">Olá, {firstName}</p>
                <p className="mt-1 leading-6">Seu painel reúne agenda, evolução e avisos em uma experiência simples e organizada.</p>
              </div>
            </div>

            <StudentSidebarNav />
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
            <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-500">
                  <Sparkles className="size-4 text-cyan-600" />
                  <span className="text-xs font-semibold uppercase tracking-[0.22em]">Painel do aluno</span>
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight text-slate-950">Sua rotina em um ambiente claro e profissional</p>
                  <p className="text-sm leading-6 text-slate-500">
                    Acompanhe sessões, avisos e evolução com uma interface mais leve, moderna e fácil de usar.
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