"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type HistoryItem = {
  sk: string;
  status?: string;
  createdAt?: string;
  prompt?: string;
  presigned_url?: string;
};

function formatDate(input?: string) {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleString();
}

function StatusBadge({ status }: { status?: string }) {
  const normalized = (status || "").toUpperCase();
  if (normalized === "SUCCESS") {
    return (
      <span className="inline-flex items-center rounded-full border border-success/30 bg-success/15 px-2 py-1 text-xs text-success">
        SUCCESS
      </span>
    );
  }
  if (normalized === "FAILED") {
    return (
      <span className="inline-flex items-center rounded-full border border-danger/30 bg-danger/15 px-2 py-1 text-xs text-danger">
        FAILED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface2 px-2 py-1 text-xs text-muted">
      {normalized || "UNKNOWN"}
    </span>
  );
}

function Tile({ it }: { it: HistoryItem }) {
  const hasImage = Boolean(it.presigned_url);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-[rgba(122,92,255,0.16)]
                    transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <StatusBadge status={it.status} />
          {it.createdAt ? (
            <span className="text-xs text-muted">{formatDate(it.createdAt)}</span>
          ) : null}
        </div>

        <div className="mt-3 line-clamp-2 text-sm font-semibold text-text">
          {it.prompt || "(no prompt)"}
        </div>
      </div>

      <div className="relative h-44 border-t border-border bg-surface2 overflow-hidden">
        {hasImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.presigned_url}
              alt="generated"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 opacity-50 group-hover:opacity-80 transition-opacity bg-[linear-gradient(to_top,rgba(0,0,0,0.55),transparent_60%)]" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted">
            No image
          </div>
        )}
      </div>

      {hasImage ? (
        <a
          className="absolute inset-0"
          href={it.presigned_url}
          target="_blank"
          rel="noreferrer"
          aria-label="Open generated image"
        />
      ) : null}

      {hasImage ? (
        <div className="pointer-events-none absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="rounded-full border border-border bg-[rgba(15,18,32,0.85)] px-3 py-1 text-xs text-text">
            Open ↗
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LoggedOutShowcase() {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="relative h-[260px] overflow-hidden rounded-2xl border border-border bg-[rgba(122,92,255,0.16)]"
          >
            <div className="absolute inset-0 opacity-60 bg-[radial-gradient(600px_240px_at_50%_0%,rgba(255,255,255,0.16),transparent_60%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.55),transparent_60%)]" />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface/60 p-6 text-center">
        <div className="text-sm font-semibold text-text">
          Sign in to see your personal showcase
        </div>
        <div className="mt-1 text-sm text-muted">
          Your recent posters will appear here after you generate them.
        </div>
        <div className="mt-4">
          <Link
            href="/api/auth/signin"
            className="inline-flex rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent2 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RecentShowcase() {
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  const [items, setItems] = useState<HistoryItem[] | null>(null);

  useEffect(() => {
    if (!isAuthed) {
      setItems(null);
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        const url = new URL("/api/history", window.location.origin);
        url.searchParams.set("limit", "12");

        const res = await fetch(url.toString(), { method: "GET" });
        if (!res.ok) throw new Error("Failed");

        const data = await res.json();
        const rawItems = (data?.items ?? []) as HistoryItem[];

        const best = rawItems.filter((x) => x?.presigned_url).slice(0, 6);
        if (!cancelled) setItems(best);
      } catch {
        if (!cancelled) setItems([]);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [isAuthed]);

  if (!isAuthed) {
    return <LoggedOutShowcase />;
  }

  if (items === null) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[260px] rounded-2xl border border-border bg-[rgba(122,92,255,0.16)] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface/60 p-6 text-center">
        <div className="text-sm font-semibold text-text">No recent images</div>
        <div className="mt-1 text-sm text-muted">
          Generate a poster to populate your showcase.
        </div>
        <div className="mt-4">
          <Link
            href="/dashboard#generator"
            className="inline-flex rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent2 transition-colors"
          >
            Generate now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <Tile key={it.sk} it={it} />
      ))}
    </div>
  );
}
