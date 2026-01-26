import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const accessToken = (token as any)?.accessToken as string | undefined;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const base = process.env.API_BASE_URL;
    if (!base) {
      return NextResponse.json({ error: "API_BASE_URL not set" }, { status: 500 });
    }

    // IMPORTANT: your AWS API is mounted at /moviePosterImageGenerator
    // so history should be /moviePosterImageGenerator/history
    const url = new URL("/moviePosterImageGenerator/history", base);

    // forward query params
    const incoming = new URL(req.url);
    incoming.searchParams.forEach((v, k) => url.searchParams.set(k, v));

    const upstream = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const text = await upstream.text();

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "History route crashed",
        message: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}


/*
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, marker: "history-v2" });
*/
