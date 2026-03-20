import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardStatCardProps = {
  title: string;
  value: string;
  description: string;
};

export function DashboardStatCard({
  title,
  value,
  description
}: DashboardStatCardProps) {
  return (
    <Card className="border-white/70 bg-white/90 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-3xl font-bold tracking-tight text-slate-950">{value}</p>
        <p className="text-sm text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}
