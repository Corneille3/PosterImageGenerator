"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

import HeroVisual from "./components/HeroVisual";
import LandingCTA from "./components/LandingCTA";
import ShowcaseStrip from "./components/ShowcaseStrip";
import RecentShowcaseWrapper from "./components/RecentShowcaseWrapper";

export default function ClientHomePage() {
  const { data: session } = useSession();
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
              Prompt → poster. Save every generation to history, reuse prompts, and share public links — powered by AWS.
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
              {isAuthenticated && (
                <Link href="/history" className="text-sm text-muted hover:text-text transition-colors">
                  View history →
                </Link>
              )}
            </div>
          </div>

          <div className="animate-[fadeUp_0.6s_ease-out_0.2s_forwards]">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* SHOWCASE STRIP */}
      <ShowcaseStrip />

      {/* RECENT SHOWCASE (only if authenticated) */}
      {isAuthenticated && <RecentShowcaseWrapper />}

      {/* FEATURES */}
      <section className="mt-14">
        <div className="mb-6">
          <h2 id="features" className="scroll-mt-3 text-xl font-semibold tracking-tight text-text">
            Key Features
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Everything you need to create high-quality AI-generated movie posters in one place.
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Preset Styles",
              desc: "Not inspired? We got you! Choose from Cinematic, Noir, Horror, Animation and more — each style guides lighting, mood, and composition.",
              imgSrc: "/images/preset.jpg",
            },
            {
              title: "High Quality",
              desc: "Every image is produced at a resolution suitable for digital and print-ready use. Perfect for posters, social media content, branding visuals, storyboards, and more.",
              imgSrc: "/images/camera-lens.jpg",
            },
            {
              title: "History",
              desc: "Every generation is automatically saved with prompt and status, making it easy to review, reopen, and reuse past creations.",
              imgSrc: "/images/folder-icon.png",
            },
          ].map((f) => (
            <div key={f.title} className="relative rounded-2xl border border-border bg-surface/60 p-6 text-center shadow-soft transition-transform duration-300 hover:scale-105 hover:bg-surface2/60">
              <div className="absolute top-2 right-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#3dff9a]/40 to-[#7c5cff]/40 blur-[30px] pointer-events-none animate-pulse-slow" />
              <img src={f.imgSrc} alt={`${f.title} icon`} className="relative z-10 w-12 h-12 rounded-full p-2 bg-white/50 shadow-md" />
              <div className="text-sm font-semibold text-text mt-4 break-words">{f.title}</div>
              <div className="mt-2 text-sm text-muted break-words">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mt-14">
        <div className="mb-6">
          <h2 id="how-it-works" className="scroll-mt-4 text-xl font-semibold tracking-tight text-text">
            How to get the best out of the generator
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Follow these simple steps to guide the AI and generate cinematic-quality posters.
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "1. Enter Prompt",
              desc: "Describe the scene, characters, mood, lighting, and genre. The more specific you are, the better the result.",
              icon: "/images/pen-icon.png",
            },
            {
              title: "2. Choose Style",
              desc: "Select a preset style to guide the visual direction. You can change or clear it at any time.",
              icon: "/images/palette-icon.png",
            },
            {
              title: "3. Generate Poster",
              desc: "We generate via Bedrock, store the image in S3, and display it instantly. Credits are deducted and the result is saved to history.",
              icon: "/images/gear-icon.png",
            },
          ].map((step) => (
            <div key={step.title} className="relative rounded-2xl border border-border bg-surface/60 p-6 text-center shadow-soft transition-transform duration-300 hover:scale-105 hover:bg-surface2/60">
              <div className="absolute top-2 right-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#3dff9a]/40 to-[#7c5cff]/40 blur-[30px] pointer-events-none animate-pulse-slow" />
              <img src={step.icon} alt={`${step.title} icon`} className="relative z-10 w-12 h-12 rounded-full p-2 bg-white/50 shadow-md" />
              <div className="text-sm font-semibold text-text mt-4 break-words">{step.title}</div>
              <div className="mt-2 text-sm text-muted break-words">{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-14">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-[rgba(61,255,154,0.10)] p-10 text-center">
          <h2 className="text-2xl font-semibold text-text">Start generating realistic images</h2>
          <p className="mt-2 text-muted">Sign in, craft your prompt, pick a style, and generate your poster.</p>
          <div className="mt-6 flex justify-center">
            <LandingCTA variant="large" />
          </div>
        </div>
      </section>
    </div>
  );
}
