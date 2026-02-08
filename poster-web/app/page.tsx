import Link from "next/link";
import HeroVisual from "./components/HeroVisual";
import RecentShowcase from "./components/RecentShowcase";
import LandingCTA from "./components/LandingCTA";

export default function HomePage() {
  return (
    <div className="py-10">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface/60 p-8 sm:p-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface2/60 px-3 py-1 text-xs text-muted">
              <span className="h-2 w-2 rounded-full bg-[rgba(61,255,154,1)] shadow-[0_0_25px_rgba(61,255,154,0.35)]" />
              Bedrock-powered • Credits • History
            </div>

            <h1 className="mt-4 text-3xl sm:text-5xl font-semibold tracking-tight text-text">
              Generate cinematic AI movie posters in seconds
            </h1>

            <p className="mt-4 max-w-xl text-muted">
              Prompt → poster. Save every generation to history, reuse prompts, and share
              public links — powered by AWS.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-xs">
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

            <div className="mt-7 flex flex-wrap items-center gap-3">
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

          <HeroVisual />
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="showcase" className="scroll-mt-6 text-lg font-semibold text-text">
              Showcase
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

      {/* FEATURES */}
      <section className="mt-14">
        <div className="mb-6">
          <h2
            id="features"
            className="scroll-mt-4 text-xl font-semibold tracking-tight text-text"
          >
            Key Features
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Everything you need to create high-quality AI-generated movie posters
            in one place.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              title: "Preset Styles",
              desc:
                "Not inspired? We got you! Choose from Cinematic, Noir, Horror, Animation and more — each style guides lighting, mood, and composition. Everything you need in one place.",
            },
            {
              title: "High Quality",
              desc:
                "Every image is produced at a resolution suitable for digital and print-ready use. Perfect for posters, social media content, branding visuals, storyboards, and more.",
            },
            {
              title: "History",
              desc:
                "Every generation is automatically saved with prompt and status, making it easy to review, reopen, and reuse past creations.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-surface/60 p-6 text-center shadow-soft hover:bg-surface2/50 transition"
            >
              <div className="text-sm font-semibold text-text">{f.title}</div>
              <div className="mt-2 text-sm text-muted">{f.desc}</div>
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

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "1. Enter Prompt",
              desc:
                "Describe the scene, characters, mood, lighting, and genre. The more specific you are, the better the result.",
            },
            {
              title: "2. Choose Style",
              desc:
                "Select a preset style to guide the visual direction. You can change or clear it at any time.",
            },
            {
              title: "3. Generate Poster",
              desc:
                "We generate via Bedrock, store the image in S3, and display it instantly. Credits are deducted and the result is saved to history.",
            },
          ].map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-border bg-surface/60 p-6 text-center shadow-soft hover:bg-surface2/50 transition"
            >
              <div className="text-sm font-semibold text-text">{s.title}</div>
              <div className="mt-2 text-sm text-muted">{s.desc}</div>
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
