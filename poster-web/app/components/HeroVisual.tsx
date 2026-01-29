"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type HistoryItem = {
  sk: string;
  status?: string;
  presigned_url?: string;
};

export default function HeroVisual() {
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthed) {
      setUrl(null);
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        const u = new URL("/api/history", window.location.origin);
        u.searchParams.set("limit", "8");

        const res = await fetch(u.toString(), { method: "GET" });
        if (!res.ok) throw new Error("history fetch failed");

        const data = await res.json();
        const items = (data?.items ?? []) as HistoryItem[];

        const best = items.find(
          (it) =>
            (it.status || "").toUpperCase() === "SUCCESS" &&
            Boolean(it.presigned_url)
        );

        if (!cancelled) setUrl(best?.presigned_url ?? null);
      } catch {
        if (!cancelled) setUrl(null);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [isAuthed]);

  // LOGGED OUT: intentional hero visual + CTA
  if (!isAuthed) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface2">
        <div className="h-[280px] w-full rounded-3xl bg-[linear-gradient(45deg,#3DFF9A,#7A5CFF)] opacity-90" />
        <div className="absolute inset-0 rounded-3xl border border-white/10 bg-[radial-gradient(800px_400px_at_50%_0%,rgba(255,255,255,0.22),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.55),transparent_60%)]" />

        <div className="absolute inset-0 flex items-end">
          <div className="w-full p-5 sm:p-6">
            <div className="max-w-sm rounded-2xl border border-border bg-[rgba(15,18,32,0.70)] backdrop-blur p-4">
              <div className="text-sm font-semibold text-text">
                Your latest poster will appear here
              </div>
              <div className="mt-1 text-sm text-muted">
                Sign in to generate and unlock your personal showcase.
              </div>

              <div className="mt-3">
                <Link
                  href="/api/auth/signin"
                  className="inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent2 transition-colors"
                >
                  Sign in to generate
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-6 -right-6 h-36 w-36 rounded-3xl bg-surface/60 border border-border backdrop-blur shadow-[0_20px_60px_rgba(0,0,0,0.55)]" />
      </div>
    );
  }

  // AUTHED but no history image yet: keep your original cinematic fallback
  if (!url) {
    return (
      <div className="relative">
        <div className="h-[280px] w-full rounded-3xl bg-[linear-gradient(45deg,#3DFF9A,#7A5CFF)] opacity-90" />
        <div className="absolute inset-0 rounded-3xl border border-white/10 bg-[radial-gradient(800px_400px_at_50%_0%,rgba(255,255,255,0.22),transparent_60%)]" />
        <div className="absolute -bottom-6 -right-6 h-36 w-36 rounded-3xl bg-surface/60 border border-border backdrop-blur shadow-[0_20px_60px_rgba(0,0,0,0.55)]" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-surface2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Example generated poster"
        className="h-[280px] w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.55),transparent_60%)]" />
      <div className="absolute inset-0 rounded-3xl border border-white/10" />

      <div className="absolute -bottom-6 -right-6 h-36 w-36 rounded-3xl bg-surface/60 border border-border backdrop-blur shadow-[0_20px_60px_rgba(0,0,0,0.55)]" />
    </div>
  );
}
