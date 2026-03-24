"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Building2, CreditCard, Gauge, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminNavItem = {
  href: Route;
  label: string;
  icon: LucideIcon;
  hint: string;
};

const navItems: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: Gauge, hint: "Indicadores globais" },
  { href: "/admin/tenants", label: "Tenants", icon: Building2, hint: "Clientes SaaS" },
  { href: "/admin/users", label: "Usuários", icon: Users, hint: "Contas da plataforma" },
  { href: "/admin/subscriptions", label: "Assinaturas", icon: CreditCard, hint: "Planos e status" },
  { href: "/admin/settings", label: "Configurações", icon: Settings, hint: "Visão institucional" }
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {navItems.map(({ href, label, icon: Icon, hint }) => {
        const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));

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
                isActive ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-slate-100 group-hover:text-slate-950"
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