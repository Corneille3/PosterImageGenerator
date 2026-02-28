import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About Kornea Poster AI.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="py-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold text-text">About Kornea Poster AI</h1>
        <p className="mt-3 text-muted">
          Kornea Poster AI helps creators turn ideas into cinematic posters in
          minutes. Describe a scene, generate a polished visual, and keep every
          result in one place.
        </p>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-text">What We Do</h2>
          <p className="mt-2 text-muted">
            We provide a simple workflow for creating movie-style posters with
            AI, plus built-in history, sharing, and credit-based usage so you
            can iterate quickly and stay organized.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-text">Why We Built It</h2>
          <p className="mt-2 text-muted">
            We built Kornea Poster AI to make high-quality poster creation
            accessible to filmmakers, marketers, and storytellers without
            complex tooling.
          </p>
        </section>
      </div>
    </div>
  );
}
