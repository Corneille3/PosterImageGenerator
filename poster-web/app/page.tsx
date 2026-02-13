import type { Metadata } from "next";
import ClientHomePage from "./ClientHomePage";
import Link from "next/link";
import HeroVisual from "./components/HeroVisual";
import LandingCTA from "./components/LandingCTA";
import ShowcaseStrip from "./components/ShowcaseStrip";
import RecentShowcaseWrapper from "./components/RecentShowcaseWrapper";

export const metadata: Metadata = {
  title: "Kornea Poster AI — Cinematic AI Movie Poster Generator",
  description:
    "Generate cinematic AI movie posters in seconds. Save history, reuse prompts, and share public links — powered by AWS.",
};

export default function Page() {
  return <ClientHomePage />;
export default function HomePage() {
  return (
    <div className="py-10">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface/60 p-8 sm:p-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface2/60 px-3 py-1 text-xs text-muted
                            animate-[fadeUp_0.4s_ease-out_forwards]">
              <span className="h-2 w-2 rounded-full bg-[rgba(61,255,154,1)] shadow-[0_0_25px_rgba(61,255,154,0.35)]" />
              Bedrock-powered • Credits • History
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-text
                          animate-[fadeUp_0.5s_ease-out_0.1s_forwards]">
              Generate cinematic AI movie posters in seconds
            </h1>

            <p className="mt-4 max-w-xl text-muted
                          animate-[fadeUp_0.5s_ease-out_0.2s_forwards]">
              Prompt → poster. Save every generation to history, reuse prompts, and
              share public links — powered by AWS.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-xs
                            animate-[fadeUp_0.5s_ease-out_0.3s_forwards]">
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

            <div className="mt-7 flex flex-wrap items-center gap-3
                            animate-[fadeUp_0.5s_ease-out_0.4s_forwards]">
              <LandingCTA />

              <Link
                href="#showcase"
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
            </div>
          </div>

          <div className="animate-[fadeUp_0.6s_ease-out_0.2s_forwards]">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* Showcase Strip (main examples section) */}
      <ShowcaseStrip />

      {/* Recent Showcase (only if authenticated) */}
      <section className="mt-12">
        <RecentShowcaseWrapper />
      </section>

      {/* FEATURES */}
      <section className="mt-14">
        {/* ...same as before, unchanged... */}
      </section>

      {/* HOW IT WORKS */}
      <section className="mt-14">
        {/* ...same as before, unchanged... */}
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
