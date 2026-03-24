import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StudentQuickActionCardProps = {
  label: string;
  description: string;
  href: string;
};

export function StudentQuickActionCard({
  label,
  description,
  href
}: StudentQuickActionCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <Card className="h-full rounded-[1.6rem] border-white/70 bg-white/95 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_55px_-32px_rgba(37,99,235,0.45)]">
        <CardHeader className="space-y-2 pb-3">
          <CardTitle className="flex items-center justify-between gap-3 text-base font-semibold text-slate-950">
            <span>{label}</span>
            <div className="flex size-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-all group-hover:bg-blue-50 group-hover:text-blue-700">
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}