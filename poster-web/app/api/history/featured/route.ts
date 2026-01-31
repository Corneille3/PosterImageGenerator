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

    // Upstream endpoint for pinning (Phase 2)
    const upstream = await fetch(
      `${apiBase}/moviePosterImageGenerator/history/featured`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sk }),
        cache: "no-store",
      }
    );

    // If upstream returns no content
    if (upstream.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    // Otherwise forward JSON (or raw) transparently
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "Featured proxy failed" }, { status: 500 });
  }
}
