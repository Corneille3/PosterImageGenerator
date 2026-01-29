import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "";

    const token = await getToken({
      req,
      secret,
    });

    if (!token) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message:
            "Session token not found. If this persists, check NEXTAUTH_SECRET/AUTH_SECRET and sign in again.",
        },
        { status: 401 }
      );
    }

    // Accept either (your NextAuth config sets both)
    const bearer = (token as any).accessToken || (token as any).idToken;

    if (!bearer) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message:
            "JWT exists but no accessToken/idToken found. This usually means the jwt callback did not persist tokens.",
          tokenKeys: Object.keys(token as any),
        },
        { status: 401 }
      );
    }

    const base = process.env.API_BASE_URL;
    if (!base) {
      return NextResponse.json({ error: "API_BASE_URL not set" }, { status: 500 });
    }

    // ✅ Calls the same backend route, but with GET (credits endpoint)
    const url = new URL("/moviePosterImageGenerator", base);

    const upstream = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearer}`,
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
        error: "Credits route crashed",
        message: err?.message ?? String(err),
        stack: err?.stack ?? null,
      },
      { status: 500 }
    );
  }
}
