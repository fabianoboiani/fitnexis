import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import {
  adminRoutePrefixes,
  getDefaultRouteByRole,
  isAdminRoute,
  isPersonalRoute,
  personalRoutePrefixes,
  publicRoutes
} from "@/lib/app-routes";

const { auth } = NextAuth({
  ...authConfig,
  providers: []
});

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const user = request.auth?.user;

  if (publicRoutes.some((route) => pathname === route || pathname.startsWith("/api/auth"))) {
    return NextResponse.next();
  }

  if (personalRoutePrefixes.some((route) => pathname.startsWith(route)) && !request.auth) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPersonalRoute(pathname) && user?.role === "ADMIN") {
    return NextResponse.redirect(new URL(getDefaultRouteByRole(user.role), request.nextUrl.origin));
  }

  if (adminRoutePrefixes.some((route) => pathname.startsWith(route))) {
    if (!request.auth) {
      const loginUrl = new URL("/login", request.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin));
    }
  }

  if (user && pathname === "/no-tenant" && user.role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", request.nextUrl.origin));
  }

  if (user && pathname === "/no-tenant" && user.role === "PERSONAL" && user.tenantId) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin));
  }

  if (user && isAdminRoute(pathname) && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
