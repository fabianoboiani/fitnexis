import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import {
  getDefaultRouteByRole,
  isAdminRoute,
  isPersonalRoute,
  isPublicRoute,
  isStudentRoute
} from "@/lib/app-routes";
import { applySecurityHeaders } from "@/lib/security";

const { auth } = NextAuth({
  ...authConfig,
  providers: []
});

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const user = request.auth?.user;

  if (isPublicRoute(pathname) || pathname.startsWith("/api/auth")) {
    return applySecurityHeaders(NextResponse.next(), {
      noStore: pathname.startsWith("/api/auth")
    });
  }

  if (isPersonalRoute(pathname) && !request.auth) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl), { noStore: true });
  }

  if (isStudentRoute(pathname) && !request.auth) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl), { noStore: true });
  }

  if (isPersonalRoute(pathname) && user && user.role !== "PERSONAL") {
    return applySecurityHeaders(
      NextResponse.redirect(new URL(getDefaultRouteByRole(user.role), request.nextUrl.origin)),
      { noStore: true }
    );
  }

  if (isAdminRoute(pathname)) {
    if (!request.auth) {
      const loginUrl = new URL("/login", request.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl), { noStore: true });
    }

    if (!user || user.role !== "ADMIN") {
      const fallbackRole = user?.role ?? "PERSONAL";
      return applySecurityHeaders(
        NextResponse.redirect(new URL(getDefaultRouteByRole(fallbackRole), request.nextUrl.origin)),
        { noStore: true }
      );
    }
  }

  if (user && pathname === "/no-tenant" && user.role === "ADMIN") {
    return applySecurityHeaders(NextResponse.redirect(new URL("/admin", request.nextUrl.origin)), {
      noStore: true
    });
  }

  if (user && pathname === "/no-tenant" && user.role === "PERSONAL" && user.tenantId) {
    return applySecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin)), {
      noStore: true
    });
  }

  if (user && pathname === "/no-tenant" && user.role === "STUDENT" && user.studentId) {
    return applySecurityHeaders(NextResponse.redirect(new URL("/student", request.nextUrl.origin)), {
      noStore: true
    });
  }

  if (user && isAdminRoute(pathname) && user.role !== "ADMIN") {
    return applySecurityHeaders(
      NextResponse.redirect(new URL(getDefaultRouteByRole(user.role), request.nextUrl.origin)),
      { noStore: true }
    );
  }

  if (user && isStudentRoute(pathname) && user.role !== "STUDENT") {
    return applySecurityHeaders(
      NextResponse.redirect(new URL(getDefaultRouteByRole(user.role), request.nextUrl.origin)),
      { noStore: true }
    );
  }

  return applySecurityHeaders(NextResponse.next(), {
    noStore: Boolean(user)
  });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};