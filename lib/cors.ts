const ALLOWED_ORIGINS = [
  "https://snapcast.apps.tossmini.com",
  "https://snapcast.private-apps.tossmini.com",
  "https://snapcast-gilt.vercel.app",
];

export function corsHeaders(origin: string | null): HeadersInit {
  const allowed =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[2];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export function handleOptions(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("origin");
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  return null;
}

export function jsonResponse(
  data: unknown,
  origin: string | null,
  init?: ResponseInit
): Response {
  return Response.json(data, {
    ...init,
    headers: { ...(init?.headers ?? {}), ...corsHeaders(origin) },
  });
}
