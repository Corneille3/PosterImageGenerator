"use client";

import { useEffect, useState } from "react";
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
};

type HistoryResponse = {
  items: HistoryItem[];
  nextCursor?: string | null;
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

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
        const msg = data?.error || data?.message || `Request failed (${res.status})`;
        throw new Error(msg);
      }

      const parsed = data as HistoryResponse;

      setItems((prev) => (first ? parsed.items : [...prev, ...(parsed.items ?? [])]));
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

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">History</h1>
          <Link className="text-sm underline" href="/dashboard">
            Back to Dashboard
          </Link>
        </div>

        {loading && <div className="p-4 border rounded">Loading…</div>}

        {error && (
          <div className="p-4 border rounded">
            <div className="font-semibold">Error</div>
            <div className="text-sm opacity-80">{error}</div>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="p-4 border rounded">No history yet.</div>
        )}

        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.sk} className="border rounded p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium">{it.prompt || "(no prompt)"}</div>
                <div className="text-xs opacity-70">{it.createdAt || ""}</div>
              </div>

              <div className="text-sm opacity-80">
                <span className="font-medium">Status:</span> {it.status}
                {it.aspect_ratio ? <> · {it.aspect_ratio}</> : null}
                {it.output_format ? <> · {it.output_format}</> : null}
              </div>

              {it.status !== "SUCCESS" && it.errorMessage && (
                <div className="text-sm">
                  <span className="font-medium">Error:</span> {it.errorMessage}
                </div>
              )}

              {it.presigned_url && (
                <div className="space-y-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.presigned_url}
                    alt="generated"
                    className="max-w-full rounded border"
                  />
                  <a className="text-sm underline" href={it.presigned_url} target="_blank" rel="noreferrer">
                    Open image
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {nextCursor && !loading && !error && (
          <button
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            onClick={() => load(false)}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}
