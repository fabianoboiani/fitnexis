import { NextResponse, type NextRequest } from "next/server";
import { applyPublicCorsHeaders, applySecurityHeaders } from "@/lib/security";

export async function GET(request: NextRequest) {
  const response = NextResponse.json({
    ok: true,
    service: "fitnexis",
    timestamp: new Date().toISOString()
  });

  applyPublicCorsHeaders(response, request);
  return applySecurityHeaders(response, { noStore: true });
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  applyPublicCorsHeaders(response, request);
  return applySecurityHeaders(response, { noStore: true });
}