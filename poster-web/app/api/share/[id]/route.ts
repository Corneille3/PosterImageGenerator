import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const apiBase = process.env.API_BASE_URL;
    if (!apiBase) {
      return NextResponse.json({ error: "Missing API_BASE_URL" }, { status: 500 });
    }

    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "Missing share id" }, { status: 400 });
    }

    const u = new URL(`${apiBase}/moviePosterImageGenerator/share/${encodeURIComponent(id)}`);
    const upstream = await fetch(u.toString(), { method: "GET", cache: "no-store" });

    const raw = await upstream.text().catch(() => "");
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { error: raw };
    }

    if (!upstream.ok) {
      const msg = data?.error || data?.message || `Upstream failed (${upstream.status})`;
      return NextResponse.json({ error: msg }, { status: upstream.status });
    }

    return NextResponse.json(
      {
        presigned_url: data?.presigned_url,
        prompt: data?.prompt ?? null,
        createdAt: data?.createdAt ?? null,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Share fetch proxy failed" },
      { status: 500 }
    );
  }
}
