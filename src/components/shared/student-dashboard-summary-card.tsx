import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StudentDashboardSummaryCardProps = {
  label: string;
  value: string;
  description: string;
};

export function StudentDashboardSummaryCard({
  label,
  value,
  description
}: StudentDashboardSummaryCardProps) {
  return (
    <Card className="overflow-hidden rounded-[1.6rem] border-white/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] shadow-[0_22px_50px_-36px_rgba(15,23,42,0.45)]">
      <CardHeader className="space-y-2 pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
        <p className="max-w-xs text-sm leading-6 text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}