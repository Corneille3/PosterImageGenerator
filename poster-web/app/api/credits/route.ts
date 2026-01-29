import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "";

    const token = await getToken({ req, secret });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized (no token)" }, { status: 401 });
    }

    const bearer = (token as any).accessToken || (token as any).idToken;
    if (!bearer) {
      return NextResponse.json(
        { error: "Unauthorized (no bearer token)", tokenKeys: Object.keys(token as any) },
        { status: 401 }
      );
    }

    const base = process.env.API_BASE_URL;
    if (!base) {
      return NextResponse.json({ error: "API_BASE_URL not set" }, { status: 500 });
    }

    const url = new URL("/moviePosterImageGenerator", base);

    const upstream = await fetch(url.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${bearer}` },
    });

    const text = await upstream.text();

    // ✅ If upstream fails, surface it so we KNOW why it's 400
    if (!upstream.ok) {
      return NextResponse.json(
        {
          error: "Upstream error from API Gateway/Lambda",
          upstreamStatus: upstream.status,
          upstreamBody: text,
        },
        { status: upstream.status }
      );
    }

    // Normal success passthrough
    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Credits route crashed", message: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
