import inject from "light-my-request";
import type { NextRequest } from "next/server";
import app from "@/server/app";

// Catch-all: setiap request ke /api/* diteruskan apa adanya ke app Express
// di server/app.ts lewat light-my-request -- Express tidak listen() di
// port manapun, cuma dipanggil sebagai fungsi biasa (req, res) => void.
// Karena request/response tetap dalam satu origin Next.js, tidak perlu
// CORS sama sekali.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Biarkan light-my-request/Express hitung ulang sendiri header-header ini
// dari payload yang sudah dibaca ulang di sini, supaya tidak bentrok.
const SKIP_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
]);

async function handler(request: NextRequest): Promise<Response> {
  const url = request.nextUrl.pathname + request.nextUrl.search;

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (!SKIP_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers[key] = value;
    }
  });

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const payload = hasBody ? Buffer.from(await request.arrayBuffer()) : undefined;

  const injected = await inject(app, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    method: request.method as any,
    url,
    headers,
    payload,
  });

  const responseHeaders = new Headers();
  for (const [key, value] of Object.entries(injected.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) responseHeaders.append(key, String(v));
    } else {
      responseHeaders.append(key, String(value));
    }
  }

  // Response Web API menolak body apa pun (bahkan yang kosong) untuk status
  // "null body" -- harus persis `null`, bukan Uint8Array kosong.
  const NULL_BODY_STATUSES = new Set([204, 205, 304]);
  const body = NULL_BODY_STATUSES.has(injected.statusCode)
    ? null
    : new Uint8Array(injected.rawPayload);

  return new Response(body, {
    status: injected.statusCode,
    headers: responseHeaders,
  });
}

export { handler as DELETE, handler as GET, handler as PATCH, handler as POST, handler as PUT };
