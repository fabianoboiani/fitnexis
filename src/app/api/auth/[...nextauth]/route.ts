import type { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { applySecurityHeaders } from "@/lib/security";

const AUTH_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const AUTH_RATE_LIMIT_MAX_ATTEMPTS = 10;

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

async function buildCredentialsRateLimitKey(request: Request) {
  const ip = getClientIp(request);
  const contentType = request.headers.get("content-type") ?? "";
  let email = "unknown";

  try {
    if (contentType.includes("application/json")) {
      const payload = (await request.clone().json()) as { email?: unknown };
      email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "unknown";
    } else {
      const formData = await request.clone().formData();
      const formEmail = formData.get("email");
      email = typeof formEmail === "string" ? formEmail.trim().toLowerCase() : "unknown";
    }
  } catch {
    email = "unknown";
  }

  return `auth:credentials:${ip}:${email}`;
}

export async function GET(request: NextRequest) {
  const response = await handlers.GET(request);
  return applySecurityHeaders(response, { noStore: true });
}

export async function POST(request: NextRequest) {
  if (request.url.includes("/api/auth/callback/credentials")) {
    const rateLimitKey = await buildCredentialsRateLimitKey(request);
    const rateLimitResult = consumeRateLimit(rateLimitKey, {
      windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
      max: AUTH_RATE_LIMIT_MAX_ATTEMPTS
    });

    if (!rateLimitResult.allowed) {
      const response = Response.json(
        {
          error: "Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente."
        },
        {
          status: 429
        }
      );

      response.headers.set("Retry-After", String(Math.ceil(rateLimitResult.retryAfterMs / 1000)));
      return applySecurityHeaders(response, { noStore: true });
    }
  }

  const response = await handlers.POST(request);
  return applySecurityHeaders(response, { noStore: true });
}