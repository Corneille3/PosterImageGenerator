import type { Metadata } from "next";
import Link from "next/link";
import HeroVisual from "./components/HeroVisual";
import RecentShowcase from "./components/RecentShowcase";
import LandingCTA from "./components/LandingCTA";
import ShowcaseStrip from "./components/ShowcaseStrip";
import { useSession } from "next-auth/react"; // or your auth hook!

export const metadata: Metadata = {
  title: "Kornea Poster AI — Cinematic AI Movie Poster Generator",
  description:
    "Generate cinematic AI movie posters in seconds. Save history, reuse prompts, and share public links — powered by AWS.",
};

export default function HomePage() {
  const { data: session } = useSession(); // check if user is logged in
  const isAuthenticated = !!session;

  return (
    <div className="py-10">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface/60 p-8 sm:p-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface2/60 px-3 py-1 text-xs text-muted animate-[fadeUp_0.4s_ease-out_forwards]">
              <span className="h-2 w-2 rounded-full bg-[rgba(61,255,154,1)] shadow-[0_0_25px_rgba(61,255,154,0.35)]" />
              Bedrock-powered • Credits • History
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-text animate-[fadeUp_0.5s_ease-out_0.1s_forwards]">
              Generate cinematic AI movie posters in seconds
            </h1>

            <p className="mt-4 max-w-xl text-muted animate-[fadeUp_0.5s_ease-out_0.2s_forwards]">
              Prompt → poster. Save every generation to history, reuse prompts, and
              share public links — powered by AWS.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-xs animate-[fadeUp_0.5s_ease-out_0.3s_forwards]">
              {["Public share links", "Reusable prompts", "High-res output", "Fast iterations"].map((t) => (
                <span key={t} className="rounded-full border border-border bg-surface2/60 px-3 py-1 text-muted">
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3 animate-[fadeUp_0.5s_ease-out_0.4s_forwards]">
              <LandingCTA />
              <Link
                href="#showcase"
                className="rounded-xl border border-border bg-surface2/50 px-5 py-3 text-sm font-semibold text-text hover:bg-surface2 transition-colors"
              >
                See examples
              </Link>
              <Link href="/history" className="text-sm text-muted hover:text-text transition-colors">
                View history →
              </Link>
            </div>
          </div>

          <div className="animate-[fadeUp_0.6s_ease-out_0.2s_forwards]">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* STATIC EXAMPLES STRIP */}
      <ShowcaseStrip />

      {/* PERSONAL RECENT SHOWCASE (only for authenticated users) */}
      {isAuthenticated && (
        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="showcase" className="scroll-mt-4 text-lg font-semibold text-text">
                Your Recent Generations
              </h2>
              <p className="mt-1 text-sm text-muted">
                A few recent generations from your account.
              </p>
            </div>

            <Link
              href="/history"
              className="text-sm text-muted hover:text-text transition-colors"
            >
              View history →
            </Link>
          </div>

          <div className="mt-5">
            <RecentShowcase />
          </div>
        </section>
      )}

      {/* FEATURES, HOW IT WORKS, CTA */}
      {/* ... keep the rest unchanged ... */}
    </div>
  );
}
