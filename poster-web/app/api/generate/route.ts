import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    // ✅ Read NextAuth JWT from cookies (no authOptions import)
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const accessToken = (token as any)?.accessToken as string | undefined;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Body
    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const base = process.env.API_BASE_URL;
    if (!base) {
      return NextResponse.json({ error: "API_BASE_URL not set" }, { status: 500 });
    }

    // ✅ Your backend route (API Gateway)
    const url = new URL("/moviePosterImageGenerator", base);

    const upstream = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err: any) {
    // ✅ Never generic Next 500 again; you’ll see the real error
    return NextResponse.json(
      {
        error: "Generate route crashed",
        message: err?.message ?? String(err),
        stack: err?.stack ?? null,
      },
      { status: 500 }
    );
  }
}
