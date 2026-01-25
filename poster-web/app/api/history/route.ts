import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseInvoke = process.env.API_INVOKE_URL;
  if (!baseInvoke) {
    return NextResponse.json({ error: "API_INVOKE_URL not set" }, { status: 500 });
  }

  // API_INVOKE_URL is currently full /moviePosterImageGenerator
  // Convert it to /history
  const url = new URL(baseInvoke);
  url.pathname = "/history";

  // Forward query params
  const incoming = new URL(req.url);
  incoming.searchParams.forEach((v, k) => url.searchParams.set(k, v));

  const upstream = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}
