const DEFAULT_SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin"
} as const;

type SecurityHeaderOptions = {
  noStore?: boolean;
};

export function applySecurityHeaders<T extends Response>(response: T, options?: SecurityHeaderOptions) {
  for (const [header, value] of Object.entries(DEFAULT_SECURITY_HEADERS)) {
    response.headers.set(header, value);
  }

  if (options?.noStore) {
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("Pragma", "no-cache");
  }

  return response;
}

export function applyPublicCorsHeaders<T extends Response>(response: T, request: Request) {
  const origin = request.headers.get("origin");

  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  response.headers.set("Access-Control-Max-Age", "600");
  response.headers.set("Vary", "Origin");

  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  } else {
    response.headers.set("Access-Control-Allow-Origin", "*");
  }

  return response;
}