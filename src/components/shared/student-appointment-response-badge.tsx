import type { StudentAppointmentResponseStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { studentAppointmentResponseLabels } from "@/lib/enum-labels";

type StudentAppointmentResponseBadgeProps = {
  status: StudentAppointmentResponseStatus;
};

const responseVariants: Record<
  StudentAppointmentResponseStatus,
  "default" | "secondary" | "outline"
> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  RESCHEDULE_REQUESTED: "outline",
  CANCELED: "outline"
};

export function StudentAppointmentResponseBadge({ status }: StudentAppointmentResponseBadgeProps) {
  return <Badge variant={responseVariants[status]}>{studentAppointmentResponseLabels[status]}</Badge>;
}
