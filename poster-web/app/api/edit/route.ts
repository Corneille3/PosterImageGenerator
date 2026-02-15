import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function toNumber(v: unknown): number | undefined {
  if (v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);
const ALLOWED_OUTPUT = new Set(["png", "jpeg", "webp"]);

// Defaults (override via env if you want)
const MAX_IMAGE_BYTES = Number(process.env.EDIT_MAX_IMAGE_BYTES ?? 5 * 1024 * 1024); // 5MB
const MAX_PROMPT_CHARS = Number(process.env.EDIT_MAX_PROMPT_CHARS ?? 800);
const MAX_NEG_PROMPT_CHARS = Number(process.env.EDIT_MAX_NEG_PROMPT_CHARS ?? 800);

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "";

    const token = await getToken({ req, secret });

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

    const apiBase =
      process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBase) {
      return NextResponse.json(
        { error: "Missing API_BASE_URL" },
        { status: 500 }
      );
    }

    const form = await req.formData();

    // Required
    const prompt = String(form.get("prompt") ?? "").trim();
    const file = form.get("image");

    if (!prompt) {
      return NextResponse.json(
        { error: "Missing required field: prompt" },
        { status: 400 }
      );
    }
    if (prompt.length > MAX_PROMPT_CHARS) {
      return NextResponse.json(
        {
          error: "Prompt too long",
          message: `Prompt must be <= ${MAX_PROMPT_CHARS} characters.`,
        },
        { status: 400 }
      );
    }

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Missing required file field: image" },
        { status: 400 }
      );
    }

    // File validations
    const mime = (file as any).type || "";
    if (!ALLOWED_MIME.has(mime)) {
      return NextResponse.json(
        {
          error: "Unsupported image type",
          message: `Allowed: ${Array.from(ALLOWED_MIME).join(", ")}`,
          received: mime || "unknown",
        },
        { status: 400 }
      );
    }

    // Blob.size exists
    const size = (file as any).size as number | undefined;
    if (typeof size === "number" && size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        {
          error: "Image too large",
          message: `Max image size is ${MAX_IMAGE_BYTES} bytes.`,
          receivedBytes: size,
        },
        { status: 400 }
      );
    }

    // Optional fields (match lambda expectations)
    let strength = toNumber(form.get("strength")); // 0.0 - 1.0
    const seed = toNumber(form.get("seed"));

    const output_format_raw = String(form.get("output_format") ?? "")
      .trim()
      .toLowerCase();
    const output_format = output_format_raw
      ? ALLOWED_OUTPUT.has(output_format_raw)
        ? output_format_raw
        : undefined
      : undefined;

    const negative_prompt_raw = String(form.get("negative_prompt") ?? "").trim();
    const negative_prompt = negative_prompt_raw
      ? negative_prompt_raw.slice(0, MAX_NEG_PROMPT_CHARS)
      : undefined;

    if (typeof strength === "number") {
      strength = clamp(strength, 0, 1);
    }

    // Blob -> base64 (no data: prefix)
    const ab = await file.arrayBuffer();

    // If size wasn't available, enforce after reading.
    if (ab.byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        {
          error: "Image too large",
          message: `Max image size is ${MAX_IMAGE_BYTES} bytes.`,
          receivedBytes: ab.byteLength,
        },
        { status: 400 }
      );
    }

    const b64 = Buffer.from(ab).toString("base64");

    const payload: Record<string, any> = {
      prompt,
      image: b64,
    };

    if (typeof strength === "number") payload.strength = strength;
    if (typeof seed === "number") payload.seed = seed;
    if (output_format) payload.output_format = output_format;
    if (negative_prompt) payload.negative_prompt = negative_prompt;

    const upstream = await fetch(
      `${apiBase}/moviePosterImageGenerator/edit`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${bearer}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    );

    const text = await upstream.text();

    return new NextResponse(text, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Edit route crashed",
        message: err?.message ?? String(err),
        stack: err?.stack ?? null,
      },
      { status: 500 }
    );
  }
}
