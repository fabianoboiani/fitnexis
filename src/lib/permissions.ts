import type { UserRole } from "@prisma/client";

export const permissions = {
  canManageTenant(role: UserRole) {
    return role === "ADMIN" || role === "PERSONAL";
  },
  canViewAdminArea(role: UserRole) {
    return role === "ADMIN";
  }
};
