import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: Request) {
  try {
    const token = await getToken({ req: req as any });
    const accessToken = (token as any)?.accessToken;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const sk = body?.sk;

    if (!sk || typeof sk !== "string") {
      return NextResponse.json({ error: "Missing sk" }, { status: 400 });
    }

    const apiBase = process.env.API_BASE_URL;
    if (!apiBase) {
      return NextResponse.json({ error: "Missing API_BASE_URL" }, { status: 500 });
    }

    const upstreamUrl = `${apiBase}/moviePosterImageGenerator/history/featured`;

    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sk }),
      cache: "no-store",
    });

    // forward raw body (could be empty)
    const text = await upstream.text();

    // If upstream returns 204, keep it 204
    if (upstream.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    // Forward JSON or raw text (don’t assume it’s JSON)
    const contentType = upstream.headers.get("content-type") || "application/json";
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": contentType },
    });
  } catch (e: any) {
    console.error("POST /api/history/featured failed:", e);
    return NextResponse.json(
      { error: "Featured proxy failed", detail: e?.message || String(e) },
      { status: 500 }
    );
  }
}
