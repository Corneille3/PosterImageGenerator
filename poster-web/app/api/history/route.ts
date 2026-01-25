import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
  console.log("HISTORY ROUTE HIT");

  try {
    const session = await getServerSession(authOptions);
    console.log("HISTORY session?", !!session, "hasAccessToken?", !!session?.accessToken);

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const base = process.env.API_BASE_URL;
    console.log("HISTORY API_BASE_URL?", base);

    if (!base) {
      return NextResponse.json({ error: "API_BASE_URL not set" }, { status: 500 });
    }

    const url = new URL("/history", base);

    // Forward query params safely
    const incomingUrl = new URL(req.url);
    incomingUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

    console.log("HISTORY upstream url:", url.toString());

    const upstream = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    const text = await upstream.text();
    console.log("HISTORY upstream status:", upstream.status);
    console.log("HISTORY upstream body (first 200):", text.slice(0, 200));

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err: any) {
    console.error("HISTORY route error:", err);
    return NextResponse.json(
      {
        error: "History route crashed",
        message: err?.message ?? String(err),
        stack: err?.stack ?? null,
      },
      { status: 500 }
    );
  }
}
