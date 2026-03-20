import Link from "next/link";
import { ArrowRight, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_COPY, BRAND_NAME } from "@/lib/branding";

const navItems = [
  { href: "#solucao", label: "Como funciona" },
  { href: "#recursos", label: "Funcionalidades" },
  { href: "#produto", label: "Produto" },
  { href: "#faq", label: "FAQ" }
];

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-cyan-500/15">
            <Dumbbell className="size-5" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-slate-950">{BRAND_NAME}</p>
            <p className="text-sm text-slate-500">Plataforma para personal trainers</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/login">{BRAND_COPY.cta.login}</Link>
          </Button>
          <Button
            asChild
            className="rounded-full bg-slate-950 px-5 text-white shadow-lg shadow-cyan-500/15 transition-transform hover:-translate-y-0.5 hover:bg-slate-900"
          >
            <Link href="/register">
              {BRAND_COPY.cta.primary}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
