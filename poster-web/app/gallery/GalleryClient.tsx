"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SHOWCASE } from "./showcase";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-surface2 px-2 py-1 text-xs text-muted hover:bg-gray-200 hover:border-accent transition-colors duration-300">
      {children}
    </span>
  );
}

export default function GalleryClient() {
  const [page, setPage] = useState(1);

  const itemsPerPage = 8;
  const startIndex = (page - 1) * itemsPerPage;
  const currentItems = SHOWCASE.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => p - 1);

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-text">
              Gallery
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              Examples of what you can generate. No sign-in required.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-surface2"
            >
              Back home
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent2"
            >
              Generate yours →
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {currentItems.map((it) => (
            <article
              key={it.id}
              className="rounded-2xl border border-border bg-surface shadow-soft hover:scale-105 hover:border-accent/30 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative overflow-hidden rounded-2xl border border-border bg-surface2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.src}
                  alt={it.alt || it.prompt || `Showcase poster ${it.id}`}
                  className="w-full h-auto object-cover transition-all duration-300 transform hover:scale-105 hover:opacity-90 hover:shadow-lg"
                  loading="lazy"
                />
              </div>

              <div className="mt-4 min-w-0 px-3 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  {it.tags?.map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                  {it.aspect ? <Chip>{it.aspect}</Chip> : null}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8 items-center gap-3">
          <button
            onClick={prevPage}
            disabled={page === 1}
            className="px-4 py-2 bg-accent text-white rounded-xl disabled:bg-gray-400"
          >
            Previous
          </button>

          <span className="px-4 py-2">{`Page ${page}`}</span>

          <button
            onClick={nextPage}
            disabled={page * itemsPerPage >= SHOWCASE.length}
            className="px-4 py-2 bg-accent text-white rounded-xl disabled:bg-gray-400"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
