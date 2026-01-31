import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

type HistoryItem = {
  sk: string;
  createdAt?: string;
  output_format?: string;
  presigned_url?: string;
  status?: string;
};

function safeFilenameFromItem(it: HistoryItem) {
  const fmtRaw = (it.output_format || "jpg").toLowerCase();
  const ext = fmtRaw === "jpeg" ? "jpg" : fmtRaw;

  // createdAt is ISO; make a clean filename like 2026-01-29_044152Z
  const iso = it.createdAt || new Date().toISOString();
  const cleaned = iso
    .replace(/\.\d{3}Z$/, "Z")
    .replace(/[:]/g, "")
    .replace("T", "_")
    .replace("+00:00", "Z");

  return `poster-${cleaned}.${ext}`;
}

async function findItemBySk(
  apiBase: string,
  accessToken: string,
  targetSk: string
): Promise<HistoryItem | null> {
  let cursor: string | null = null;

  // Safety cap so we don't loop forever if something is wrong
  for (let page = 0; page < 10; page++) {
    const u = new URL(`${apiBase}/moviePosterImageGenerator/history`);
    u.searchParams.set("limit", "50");
    if (cursor) u.searchParams.set("cursor", cursor);

    const res = await fetch(u.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `Upstream history failed (${res.status})`);
    }

    const data = (await res.json()) as {
      items?: HistoryItem[];
      nextCursor?: string | null;
    };

    const items = data.items ?? [];
    const hit = items.find((x) => x.sk === targetSk);
    if (hit) return hit;

    cursor = (data.nextCursor as string | null) ?? null;
    if (!cursor) break;
  }

  return null;
}

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const sk = searchParams.get("sk");
    if (!sk) {
      return NextResponse.json({ error: "Missing sk" }, { status: 400 });
    }

    const item = await findItemBySk(apiBase, accessToken, sk);
    if (!item) {
      return NextResponse.json({ error: "History item not found" }, { status: 404 });
    }

    const okStatus = (item.status || "").toUpperCase() === "SUCCESS";
    if (!okStatus || !item.presigned_url) {
      return NextResponse.json({ error: "No downloadable image for this item" }, { status: 400 });
    }

    const filename = safeFilenameFromItem(item);

    // Fetch the actual image server-side
    const imgRes = await fetch(item.presigned_url, { method: "GET", cache: "no-store" });
    if (!imgRes.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image (${imgRes.status})` },
        { status: 502 }
      );
    }

    const buf = await imgRes.arrayBuffer();
    const contentType =
      imgRes.headers.get("content-type") ||
      (filename.endsWith(".png") ? "image/png" : "image/jpeg");

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Download proxy failed" },
      { status: 500 }
    );
  }
}
