import type { PaymentStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
};

const paymentStatusMap: Record<
  PaymentStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  PENDING: { label: "Pendente", variant: "secondary" },
  PAID: { label: "Pago", variant: "default" },
  OVERDUE: { label: "Vencido", variant: "outline" },
  CANCELED: { label: "Cancelado", variant: "secondary" }
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const config = paymentStatusMap[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
