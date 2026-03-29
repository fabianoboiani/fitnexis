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

export const studentRoutePrefixes = [
  "/student",
  "/student/agenda",
  "/student/history",
  "/student/progress",
  "/student/notices",
  "/student/profile"
];

function isRouteMatch(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => isRouteMatch(pathname, prefix));
}

export function isAdminRoute(pathname: string) {
  return matchesPrefix(pathname, adminRoutePrefixes);
}

export function isPersonalRoute(pathname: string) {
  return matchesPrefix(pathname, personalRoutePrefixes);
}

export function isStudentRoute(pathname: string) {
  return matchesPrefix(pathname, studentRoutePrefixes);
}

export function isPublicRoute(pathname: string) {
  return publicRoutes.some((route) => pathname === route);
}

export function getDefaultRouteByRole(role: UserRole) {
  if (role === "ADMIN") {
    return "/admin";
  }

  if (role === "STUDENT") {
    return "/student";
  }

  return "/dashboard";
}

export function getSafeRouteForRole(role: UserRole, requestedPath?: string | null) {
  const fallbackRoute = getDefaultRouteByRole(role);

  if (!requestedPath || !requestedPath.startsWith("/")) {
    return fallbackRoute;
  }

  if (role === "ADMIN") {
    return isAdminRoute(requestedPath) ? requestedPath : fallbackRoute;
  }

  if (role === "STUDENT") {
    return isStudentRoute(requestedPath) ? requestedPath : fallbackRoute;
  }

  return isPersonalRoute(requestedPath) ? requestedPath : fallbackRoute;
}
