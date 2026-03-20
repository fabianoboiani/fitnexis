import type { AppointmentStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

type AppointmentStatusBadgeProps = {
  status: AppointmentStatus;
};

const appointmentStatusMap: Record<
  AppointmentStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  SCHEDULED: { label: "Agendado", variant: "default" },
  COMPLETED: { label: "Concluido", variant: "secondary" },
  CANCELED: { label: "Cancelado", variant: "outline" },
  MISSED: { label: "Faltou", variant: "secondary" }
};

export function AppointmentStatusBadge({ status }: AppointmentStatusBadgeProps) {
  const config = appointmentStatusMap[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
