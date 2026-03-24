import type { UserRole } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { userRoleLabels } from "@/lib/enum-labels";

type UserRoleBadgeProps = {
  role: UserRole;
};

const variantMap: Record<UserRole, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  PERSONAL: "secondary",
  STUDENT: "outline"
};

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  return <Badge variant={variantMap[role]}>{userRoleLabels[role]}</Badge>;
}
