import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  eyebrow?: string;
};

export function FeatureCard({
  icon: Icon,
  title,
  description,
  eyebrow
}: FeatureCardProps) {
  return (
    <Card className="h-full border-white/70 bg-white/85 shadow-[0_20px_70px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
      <CardHeader className="space-y-4">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(14,165,233,0.18),rgba(59,130,246,0.24))] text-cyan-950">
          <Icon className="size-5" />
        </div>
        <div className="space-y-2">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {eyebrow}
            </p>
          ) : null}
          <CardTitle className="text-xl text-slate-950">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-7 text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}
