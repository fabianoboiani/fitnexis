import type { UserRole } from "@prisma/client";

export const publicRoutes = ["/", "/login", "/register", "/api/health"];

export const personalRoutePrefixes = [
  "/dashboard",
  "/students",
  "/payments",
  "/appointments",
  "/progress",
  "/settings"
];

export const adminRoutePrefixes = ["/admin"];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

export function isAdminRoute(pathname: string) {
  return matchesPrefix(pathname, adminRoutePrefixes);
}

export function isPersonalRoute(pathname: string) {
  return matchesPrefix(pathname, personalRoutePrefixes);
}

export function isPublicRoute(pathname: string) {
  return publicRoutes.some((route) => pathname === route);
}

export function getDefaultRouteByRole(role: UserRole) {
  return role === "ADMIN" ? "/admin" : "/dashboard";
}

export function getSafeRouteForRole(role: UserRole, requestedPath?: string | null) {
  const fallbackRoute = getDefaultRouteByRole(role);

  if (!requestedPath || !requestedPath.startsWith("/")) {
    return fallbackRoute;
  }

  if (role === "ADMIN") {
    return isAdminRoute(requestedPath) ? requestedPath : fallbackRoute;
  }

  return isPersonalRoute(requestedPath) ? requestedPath : fallbackRoute;
}
