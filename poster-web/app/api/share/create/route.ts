import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: Request) {
  try {
    const token = await getToken({ req: req as any });
    const accessToken = (token as any)?.accessToken;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiBase = process.env.API_BASE_URL;
    if (!apiBase) {
      return NextResponse.json({ error: "Missing API_BASE_URL" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const sk = body?.sk as string | undefined;
    const expiresInSeconds = body?.expiresInSeconds as number | null | undefined;

    if (!sk) {
      return NextResponse.json({ error: "Missing sk" }, { status: 400 });
    }

    const u = new URL(`${apiBase}/moviePosterImageGenerator/share`);
    const upstream = await fetch(u.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sk,
        expiresInSeconds: typeof expiresInSeconds === "number" ? expiresInSeconds : null,
      }),
      cache: "no-store",
    });

    const raw = await upstream.text().catch(() => "");
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { error: raw };
    }

    if (!upstream.ok) {
      const msg =
        data?.error ||
        data?.message ||
        `Upstream share create failed (${upstream.status})`;
      return NextResponse.json({ error: msg }, { status: upstream.status });
    }

    const shareId = data?.shareId as string | undefined;
    const shareUrl =
      (data?.shareUrl as string | undefined) || (shareId ? `/share/${shareId}` : undefined);

    if (!shareId || !shareUrl) {
      return NextResponse.json({ error: "Invalid share payload" }, { status: 502 });
    }

    return NextResponse.json({ shareId, shareUrl }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Share create proxy failed" },
      { status: 500 }
    );
  }
}
