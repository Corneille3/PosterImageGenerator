"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type HistoryItem = {
  pk: string;
  sk: string;
  status: "SUCCESS" | "FAILED" | string;
  createdAt?: string;
  prompt?: string;
  aspect_ratio?: string;
  output_format?: string;
  presigned_url?: string;
  errorMessage?: string;
  featured?: boolean;
};

type HistoryResponse = {
  items: HistoryItem[];
  nextCursor?: string | null;
};

function formatDate(input?: string) {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleString();
}

function StatusBadge({ status }: { status: string }) {
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

function HistorySkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-soft">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="h-4 w-56 animate-pulse rounded bg-surface2" />
            <div className="h-3 w-40 animate-pulse rounded bg-surface2" />
          </div>
          <div className="h-6 w-20 animate-pulse rounded-full bg-surface2" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="h-10 animate-pulse rounded-xl bg-surface2" />
          <div className="h-10 animate-pulse rounded-xl bg-surface2" />
          <div className="h-10 animate-pulse rounded-xl bg-surface2" />
        </div>

        <div className="mt-4 h-48 animate-pulse rounded-xl bg-surface2" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 text-center shadow-soft">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-accent">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2l1.2 6.2L19 9.4l-5.8 1.2L12 17l-1.2-6.4L5 9.4l5.8-1.2L12 2z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-text">No generations yet</h2>
      <p className="mt-1 text-sm text-muted">
        Generate your first poster from the dashboard and it will show up here.
      </p>
      <div className="mt-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent2"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

function HistoryItemCard({
  it,
  onDelete,
  deleting,
  onSetHero,
  pinning,
  justPinned,
}: {
  it: HistoryItem;
  onDelete: (sk: string) => void;
  deleting?: boolean;
  onSetHero: (sk: string) => void;
  pinning?: boolean;
  justPinned?: boolean;
}) {
  const hasImage = Boolean(it.presigned_url);
  const [loaded, setLoaded] = useState(false);

  const isSuccess = (it.status || "").toUpperCase() === "SUCCESS";
  const canPin = hasImage && isSuccess && !deleting && !pinning && !it.featured;

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <StatusBadge status={it.status} />

              {it.featured ? (
                <span
                  className={[
                    "inline-flex items-center gap-1 rounded-full border border-accent/35 bg-accent/15 px-2 py-1 text-xs text-text",
                    justPinned ? "animate-[heroPop_220ms_ease-out]" : "",
                  ].join(" ")}
                >
                  <span className={justPinned ? "animate-[heroGlow_1.8s_ease-in-out]" : ""}>
                    ⭐
                  </span>
                  Hero
                </span>
              ) : null}

              {it.createdAt ? (
                <span className="text-xs text-muted">{formatDate(it.createdAt)}</span>
              ) : null}
            </div>

            <div className="mt-2 line-clamp-3 text-sm font-medium text-text">
              {it.prompt || "(no prompt)"}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
              {it.aspect_ratio ? (
                <span className="rounded-full border border-border bg-surface2 px-2 py-1">
                  {it.aspect_ratio}
                </span>
              ) : null}
              {it.output_format ? (
                <span className="rounded-full border border-border bg-surface2 px-2 py-1">
                  {it.output_format}
                </span>
              ) : null}
            </div>

            {it.status !== "SUCCESS" && it.errorMessage ? (
              <div className="mt-3 rounded-xl border border-danger/25 bg-danger/10 p-3 text-sm text-text">
                <div className="text-xs font-semibold text-danger">Error</div>
                <div className="mt-1 text-sm text-muted">{it.errorMessage}</div>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:justify-end">
            {/* ✅ Phase 2: Pin button */}
            {hasImage && isSuccess ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSetHero(it.sk);
                }}
                disabled={!canPin}
                className={[
                  "inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm",
                  it.featured
                    ? "border-accent/35 bg-accent/15 text-text"
                    : "border-border bg-surface text-text hover:bg-surface2",
                  !canPin ? "opacity-50" : "",
                ].join(" ")}
                title={it.featured ? "Hero" : "Set as hero"}
              >
                {it.featured ? "⭐ Hero" : pinning ? "Pinning…" : "Set as hero"}
              </button>
            ) : null}

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(it.sk);
              }}
              disabled={deleting || pinning}
              className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-surface2 disabled:opacity-50"
              title="Delete"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>

            {hasImage ? (
              <a
                className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-surface2"
                href={it.presigned_url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                Open ↗
              </a>
            ) : null}
          </div>
        </div>

        {hasImage ? (
          <div className="relative mt-4 overflow-hidden rounded-2xl border border-border bg-surface2">
            {/* ⭐ overlay badge on image */}
            {it.featured ? (
              <div
                className={[
                  "absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full",
                  "border border-accent/35 bg-[rgba(15,18,32,0.70)] px-2 py-1 text-xs text-text backdrop-blur",
                  justPinned ? "animate-[heroPop_220ms_ease-out]" : "",
                ].join(" ")}
              >
                <span className={justPinned ? "animate-[heroGlow_1.8s_ease-in-out]" : ""}>
                  ⭐
                </span>
                Hero
              </div>
            ) : null}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.presigned_url}
              alt="generated"
              loading="lazy"
              className={[
                "h-auto w-full object-cover",
                "transition duration-500 ease-out",
                loaded ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]",
              ].join(" ")}
              onLoad={() => setLoaded(true)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const [deletingSk, setDeletingSk] = useState<string | null>(null);
  const [pinningSk, setPinningSk] = useState<string | null>(null);
  const [justPinnedSk, setJustPinnedSk] = useState<string | null>(null);

  const canLoadMore = useMemo(
    () => Boolean(nextCursor) && !loading && !error,
    [nextCursor, loading, error]
  );

  async function load(first = false) {
    try {
      if (first) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const url = new URL("/api/history", window.location.origin);
      url.searchParams.set("limit", "10");
      if (!first && nextCursor) url.searchParams.set("cursor", nextCursor);

      const res = await fetch(url.toString(), { method: "GET" });

      const raw = await res.text();
      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        data = { error: raw };
      }

      if (!res.ok) {
        const msg =
          data?.error || data?.message || `Request failed (${res.status})`;
        throw new Error(msg);
      }

      const parsed = data as HistoryResponse;

      setItems((prev) =>
        first ? parsed.items : [...prev, ...(parsed.items ?? [])]
      );
      setNextCursor((parsed.nextCursor as string | null) ?? null);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      if (first) setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onDelete(sk: string) {
    const ok = window.confirm("Delete this history item?");
    if (!ok) return;

    setDeletingSk(sk);

    const prev = items;
    setItems((cur) => cur.filter((x) => x.sk !== sk)); // optimistic

    try {
      const res = await fetch("/api/history/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sk }),
      });

      if (res.status === 204) return;

      // rollback if failed
      setItems(prev);

      const raw = await res.text();
      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        data = { error: raw };
      }

      const msg =
        data?.error || data?.message || `Delete failed (${res.status})`;
      throw new Error(msg);
    } catch (e: any) {
      alert(e?.message || "Delete failed.");
    } finally {
      setDeletingSk(null);
    }
  }

  async function onSetHero(sk: string) {
  setPinningSk(sk);

  // 1️⃣ snapshot BEFORE optimistic update
  const prev = items;

  // 2️⃣ optimistic UI: exactly ONE hero
  setItems((cur) =>
    cur.map((x) => ({
      ...x,
      featured: x.sk === sk,
    }))
  );
  setJustPinnedSk(sk);

  try {
    const res = await fetch("/api/history/featured", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sk }),
    });

    if (!res.ok) {
      // rollback on failure
      setItems(prev);

      const raw = await res.text();
      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        data = { error: raw };
      }

      const msg =
        data?.error || data?.message || `Pin failed (${res.status})`;
      throw new Error(msg);
    }

    // 3️⃣ OPTIMIZED hero update (no refetch)
    // Find the pinned item from the snapshot
    const pinned = prev.find((x) => x.sk === sk);
    const pinnedUrl = pinned?.presigned_url;

    if (pinnedUrl) {
      window.dispatchEvent(
        new CustomEvent("hero:set", {
          detail: { url: pinnedUrl },
        })
      );
    }
  } catch (e: any) {
    alert(e?.message || "Pin failed.");
  } finally {
    setPinningSk(null);
    window.setTimeout(() => setJustPinnedSk(null), 350);
  }
}
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6">
          <h1
            id="your-history"
            className="scroll-mt-24 text-xl font-semibold tracking-tight text-text"
          >
            Your History
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Review past generations, open images in full resolution, and reuse prompts.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="hidden sm:block" />
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-surface2"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-danger/25 bg-danger/10 p-4 shadow-soft">
            <div className="text-sm font-semibold text-text">Error</div>
            <div className="mt-1 text-sm text-muted">{error}</div>
            <button
              className="mt-3 inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent2"
              onClick={() => load(true)}
              type="button"
            >
              Retry
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <HistorySkeleton />
            <HistorySkeleton />
          </div>
        ) : !error && items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((it) => (
              <HistoryItemCard
                key={it.sk}
                it={it}
                onDelete={onDelete}
                deleting={deletingSk === it.sk}
                onSetHero={onSetHero}
                pinning={pinningSk === it.sk}
                justPinned={justPinnedSk === it.sk}
              />
            ))}
          </div>
        )}

        {canLoadMore ? (
          <div className="mt-8 flex justify-center">
            <button
              className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-4 py-2 text-sm text-text hover:bg-surface2 disabled:opacity-50"
              onClick={() => load(false)}
              disabled={loadingMore}
              type="button"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
