import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.MADHAWEE_PRINTERS_ERP_BASE_URL;

/**
 * Forward a request to the backend under `prefix` (e.g. "settings"), passing the signed-in
 * user's token, the query string and the body, and hand the backend's answer back as it is,
 * including its error message.
 */
export async function proxyToBackend(request: NextRequest, prefix: string, path: string[]) {
  const token = (await cookies()).get("auth_token")?.value;
  const url = `${API_BASE_URL}/${prefix}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const hasBody = request.method !== "GET" && request.method !== "DELETE";

  try {
    const response = await fetch(url, {
      method: request.method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json(
        { message: data?.message || `Backend error: ${response.status}` },
        { status: response.status }
      );
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`Proxy error for /${prefix}/${path.join("/")}:`, error);
    return NextResponse.json({ message: "Couldn't reach the server" }, { status: 502 });
  }
}

type Context = { params: Promise<{ path: string[] }> };

/** GET, POST, PUT and DELETE handlers that forward everything under one backend prefix */
export function backendRoutes(prefix: string) {
  const handle = async (request: NextRequest, context: Context) =>
    proxyToBackend(request, prefix, (await context.params).path);
  return { GET: handle, POST: handle, PUT: handle, DELETE: handle };
}
