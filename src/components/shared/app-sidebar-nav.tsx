"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { CalendarDays, CreditCard, Gauge, LineChart, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: Route;
  label: string;
  icon: LucideIcon;
  hint: string;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge, hint: "Visão operacional" },
  { href: "/students", label: "Alunos", icon: Users, hint: "Carteira ativa" },
  { href: "/payments", label: "Pagamentos", icon: CreditCard, hint: "Controle financeiro" },
  { href: "/appointments", label: "Agenda", icon: CalendarDays, hint: "Compromissos" },
  { href: "/progress", label: "Evolução", icon: LineChart, hint: "Acompanhamento" },
  { href: "/settings", label: "Configurações", icon: Settings, hint: "Tenant e assinatura" }
];

export function AppSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {navItems.map(({ href, label, icon: Icon, hint }) => {
        const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "group flex items-center gap-3 rounded-[1.35rem] border px-3.5 py-3 transition-all duration-200",
              isActive
                ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_50px_-30px_rgba(15,23,42,0.85)]"
                : "border-transparent bg-white/55 text-slate-600 hover:border-slate-200 hover:bg-white hover:text-slate-950 hover:shadow-sm"
            )}
          >
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-2xl transition-colors",
                isActive ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700"
              )}
            >
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{label}</p>
              <p className={cn("truncate text-xs", isActive ? "text-slate-300" : "text-slate-500")}>{hint}</p>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
