import { redirect } from "next/navigation";
import {
  getDefaultAuthenticatedRoute,
  requireAuth
} from "@/lib/auth-helpers";
import { getSafeRouteForRole } from "@/lib/app-routes";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function normalizeNextPath(value?: string | string[]) {
  const nextPath = Array.isArray(value) ? value[0] : value;
  return typeof nextPath === "string" ? nextPath : undefined;
}

export default async function AppRedirectPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const user = await requireAuth();
  const resolvedSearchParams = await searchParams;
  const nextPath = normalizeNextPath(resolvedSearchParams.next);
  const safeRoute = nextPath
    ? getSafeRouteForRole(user.role, nextPath)
    : getDefaultAuthenticatedRoute(user);

  redirect(safeRoute);
}