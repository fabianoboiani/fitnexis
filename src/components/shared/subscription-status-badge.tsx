import type { SubscriptionStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { subscriptionStatusLabels } from "@/lib/enum-labels";

type SubscriptionStatusBadgeProps = {
  status: SubscriptionStatus;
};

const variantMap: Record<SubscriptionStatus, "default" | "secondary" | "outline"> = {
  TRIAL: "secondary",
  ACTIVE: "default",
  PAST_DUE: "outline",
  CANCELED: "outline"
};

export function SubscriptionStatusBadge({ status }: SubscriptionStatusBadgeProps) {
  return <Badge variant={variantMap[status]}>{subscriptionStatusLabels[status]}</Badge>;
}
