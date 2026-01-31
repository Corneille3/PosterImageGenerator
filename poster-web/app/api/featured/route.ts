import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: Request) {
  try {
    const token = await getToken({ req: req as any });
    const accessToken = (token as any)?.accessToken;

    // Not signed in: return null (not an error)
    if (!accessToken) {
      return NextResponse.json({ presigned_url: null, sk: null }, { status: 200 });
    }

    const apiBase = process.env.API_BASE_URL;
    if (!apiBase) {
      return NextResponse.json({ error: "Missing API_BASE_URL" }, { status: 500 });
    }

    const upstream = await fetch(
      `${apiBase}/moviePosterImageGenerator/featured`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      }
    );

    // If upstream returns no content
    if (upstream.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const text = await upstream.text();
    const contentType = upstream.headers.get("content-type") || "application/json";

    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": contentType },
    });
  } catch (e: any) {
    console.error("GET /api/featured failed:", e);
    return NextResponse.json(
      { error: "Featured fetch proxy failed", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
