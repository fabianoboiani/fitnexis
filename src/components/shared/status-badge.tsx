import type { StudentStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status: StudentStatus;
};

const studentStatusMap: Record<
  StudentStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  ACTIVE: { label: "Ativo", variant: "default" },
  PAUSED: { label: "Pausado", variant: "secondary" },
  DELINQUENT: { label: "Inadimplente", variant: "outline" },
  INACTIVE: { label: "Inativo", variant: "secondary" }
};

export function StudentStatusBadge({ status }: StatusBadgeProps) {
  const config = studentStatusMap[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
