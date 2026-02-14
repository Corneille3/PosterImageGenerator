"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

import HeroVisual from "./components/HeroVisual";
import ShowcaseStrip from "./components/ShowcaseStrip";
import LandingCTA from "./components/LandingCTA";

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

export default function ClientHomePage() {
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  // Recent posters (signed-in only)
  const [recent, setRecent] = useState<HistoryItem[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentError, setRecentError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRecent() {
      if (!isAuthed) {
        setRecent([]);
        setRecentLoading(false);
        setRecentError(null);
        return;
      }

      try {
        setRecentLoading(true);
        setRecentError(null);

        const url = new URL("/api/history", window.location.origin);
        url.searchParams.set("limit", "6");

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
        const items = Array.isArray(parsed.items) ? parsed.items : [];

        if (!cancelled) setRecent(items);
      } catch (e: any) {
        if (!cancelled) setRecentError(e?.message || "Something went wrong.");
      } finally {
        if (!cancelled) setRecentLoading(false);
      }
    }

    loadRecent();
    return () => {
      cancelled = true;
    };
  }, [isAuthed]);

  const recentWithImages = useMemo(() => {
    // Only show actual posters (avoid empty thumbnails / failures)
    return recent.filter(
      (it) =>
        Boolean(it.presigned_url) &&
        (it.status || "").toUpperCase() === "SUCCESS"
    );
  }, [recent]);

  return (
    <div className="py-10">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface/60 p-8 sm:p-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface2/60 px-3 py-1 text-xs text-muted
                            animate-[fadeUp_0.4s_ease-out_forwards]"
            >
              <span className="h-2 w-2 rounded-full bg-[rgba(61,255,154,1)] shadow-[0_0_25px_rgba(61,255,154,0.35)]" />
              Bedrock-powered • Credits • History
            </div>

            <h1
              className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-text
                          animate-[fadeUp_0.5s_ease-out_0.1s_forwards]"
            >
              {isAuthed
                ? "Welcome back — ready to generate?"
                : "Generate cinematic AI movie posters in seconds"}
            </h1>

            <p
              className="mt-4 max-w-xl text-muted
                          animate-[fadeUp_0.5s_ease-out_0.2s_forwards]"
            >
              {isAuthed
                ? "Jump straight into the generator, review your history, or browse the gallery."
                : "Prompt → poster. Save every generation to history, reuse prompts, and share public links — powered by AWS."}
            </p>

            {!isAuthed ? (
              <div
                className="mt-5 flex flex-wrap gap-2 text-xs
                            animate-[fadeUp_0.5s_ease-out_0.3s_forwards]"
              >
                {[
                  "Public share links",
                  "Reusable prompts",
                  "High-res output",
                  "Fast iterations",
                ].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border bg-surface2/60 px-3 py-1 text-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}

            <div
              className="mt-7 flex flex-wrap items-center gap-3
                            animate-[fadeUp_0.5s_ease-out_0.4s_forwards]"
            >
              {isAuthed ? (
                <>
                  <Link
                    href="/dashboard#generator"
                    className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent2 transition-colors shadow-[0_0_34px_rgba(122,92,255,0.18)]"
                  >
                    Generate now
                  </Link>

                  <Link
                    href="/history"
                    className="rounded-xl border border-border bg-surface2/50 px-5 py-3 text-sm font-semibold text-text hover:bg-surface2 transition-colors"
                  >
                    View history
                  </Link>

                  <Link
                    href="/gallery"
                    className="text-sm text-muted hover:text-text transition-colors"
                  >
                    Browse gallery →
                  </Link>
                </>
              ) : (
                <>
                  <LandingCTA />

                  <Link
                    href="#showcase-strip"
                    className="rounded-xl border border-border bg-surface2/50 px-5 py-3 text-sm font-semibold text-text hover:bg-surface2 transition-colors"
                  >
                    See examples
                  </Link>

                  <Link
                    href="/history"
                    className="text-sm text-muted hover:text-text transition-colors"
                  >
                    View history →
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="animate-[fadeUp_0.6s_ease-out_0.2s_forwards]">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* SIGNED-IN ONLY: RECENT POSTERS (only if there are items with images) */}
      {isAuthed ? (
        recentWithImages.length > 0 ? (
          <section className="mt-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-text">
                  Your recent posters
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Quick access to your latest successful generations.
                </p>
              </div>

              <Link
                href="/history"
                className="text-sm text-muted hover:text-text transition-colors"
              >
                View all →
              </Link>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentWithImages.slice(0, 6).map((it) => (
                <Link
                  key={it.sk}
                  href="/history"
                  className="group overflow-hidden rounded-2xl border border-border bg-surface/60 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.presigned_url}
                    alt={it.prompt ? it.prompt : "Generated poster"}
                    loading="lazy"
                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="p-4">
                    <div className="text-sm font-semibold text-text line-clamp-1">
                      {it.prompt || "(no prompt)"}
                    </div>
                    {it.createdAt ? (
                      <div className="mt-1 text-xs text-muted">
                        {new Date(it.createdAt).toLocaleString()}
                      </div>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : recentLoading ? (
          // Don't show an empty block; only show a light loading hint.
          <section className="mt-12">
            <div className="text-sm text-muted">Loading your recent posters…</div>
          </section>
        ) : recentError ? (
          // Also keep this subtle (no big empty panel).
          <section className="mt-12">
            <div className="text-sm text-muted">
              Could not load recent posters.
            </div>
          </section>
        ) : null
      ) : null}

      {/* SHOWCASE STRIP (public examples) */}
      <ShowcaseStrip />

      {/* FEATURES */}
      <section className="mt-14">
        <div className="mb-6">
          <h2
            id="features"
            className="scroll-mt-3 text-xl font-semibold tracking-tight text-text"
          >
            Key Features
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Everything you need to create high-quality AI-generated movie posters
            in one place.
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Preset Styles",
              desc:
                "Not inspired? We got you! Choose from Cinematic, Noir, Horror, Animation and more — each style guides lighting, mood, and composition. Everything you need in one place.",
              imgSrc: "/images/preset.jpg",
            },
            {
              title: "High Quality",
              desc:
                "Every image is produced at a resolution suitable for digital and print-ready use. Perfect for posters, social media content, branding visuals, storyboards, and more.",
              imgSrc: "/images/camera-lens.jpg",
            },
            {
              title: "History",
              desc:
                "Every generation is automatically saved with prompt and status, making it easy to review, reopen, and reuse past creations.",
              imgSrc: "/images/folder-icon.png",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="relative rounded-2xl border border-border bg-surface/60 p-6 text-center shadow-soft
                        transition-transform duration-300 hover:scale-105 hover:bg-surface2/60"
            >
              {/* Pulsing glow behind icon */}
              <div
                className="absolute top-2 right-2 flex h-14 w-14 items-center justify-center rounded-full 
                              bg-gradient-to-tr from-[#3dff9a]/40 to-[#7c5cff]/40 blur-[30px] pointer-events-none
                              animate-pulse-slow"
              />

              {/* Icon */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.imgSrc}
                alt={`${f.title} icon`}
                className="relative z-10 w-12 h-12 rounded-full p-2 bg-white/50 shadow-md"
              />

              <div className="text-sm font-semibold text-text mt-4 break-words">
                {f.title}
              </div>
              <div className="mt-2 text-sm text-muted break-words">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mt-14">
        <div className="mb-6">
          <h2
            id="how-it-works"
            className="scroll-mt-4 text-xl font-semibold tracking-tight text-text"
          >
            How to get the best out of the generator
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Follow these simple steps to guide the AI and generate
            cinematic-quality posters.
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "1. Enter Prompt",
              desc:
                "Describe the scene, characters, mood, lighting, and genre. The more specific you are, the better the result.",
              icon: "/images/pen-icon.png",
            },
            {
              title: "2. Choose Style",
              desc:
                "Select a preset style to guide the visual direction. You can change or clear it at any time.",
              icon: "/images/palette-icon.png",
            },
            {
              title: "3. Generate Poster",
              desc:
                "We generate via Bedrock, store the image in S3, and display it instantly. Credits are deducted and the result is saved to history.",
              icon: "/images/gear-icon.png",
            },
          ].map((step) => (
            <div
              key={step.title}
              className="relative rounded-2xl border border-border bg-surface/60 p-6 text-center shadow-soft
                        transition-transform duration-300 hover:scale-105 hover:bg-surface2/60"
            >
              {/* Pulsing glow behind icon */}
              <div
                className="absolute top-2 right-2 flex h-14 w-14 items-center justify-center rounded-full 
                              bg-gradient-to-tr from-[#3dff9a]/40 to-[#7c5cff]/40 blur-[30px] pointer-events-none
                              animate-pulse-slow"
              />

              {/* Icon */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={step.icon}
                alt={`${step.title} icon`}
                className="relative z-10 w-12 h-12 rounded-full p-2 bg-white/50 shadow-md"
              />

              <div className="text-sm font-semibold text-text mt-4 break-words">
                {step.title}
              </div>
              <div className="mt-2 text-sm text-muted break-words">
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-14">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-[rgba(61,255,154,0.10)] p-10 text-center">
          <h2 className="text-2xl font-semibold text-text">
            Start generating realistic images
          </h2>
          <p className="mt-2 text-muted">
            Sign in, craft your prompt, pick a style, and generate your poster.
          </p>

          <div className="mt-6 flex justify-center">
            <LandingCTA variant="large" />
          </div>
        </div>
      </section>
    </div>
  );
}
