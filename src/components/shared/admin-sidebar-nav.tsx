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
};

const navItems: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/tenants", label: "Tenants", icon: Building2 },
  { href: "/admin/users", label: "Usu?rios", icon: Users },
  { href: "/admin/subscriptions", label: "Assinaturas", icon: CreditCard },
  { href: "/admin/settings", label: "Configura??es", icon: Settings }
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            )}
          >
            <Icon className="size-4" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
