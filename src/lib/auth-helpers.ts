import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { getDefaultRouteByRole } from "@/lib/app-routes";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    role: session.user.role,
    tenantId: session.user.tenantId ?? null
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export function isAdmin(role: UserRole) {
  return role === "ADMIN";
}

export function getDefaultAuthenticatedRoute(user: CurrentUser) {
  return getDefaultRouteByRole(user.role);
}

export async function requireAdmin() {
  const user = await requireAuth();

  if (!isAdmin(user.role)) {
    redirect("/dashboard");
  }

  return user;
}
