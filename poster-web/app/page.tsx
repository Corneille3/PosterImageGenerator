// app/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-text">
          Kornea Poster AI
        </h1>
        <p className="mt-2 text-sm text-muted">
          Generate cinematic AI movie posters in seconds.
        </p>
      </div>
    </div>
  );
}
