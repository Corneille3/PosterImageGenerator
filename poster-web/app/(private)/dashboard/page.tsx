import Link from "next/link";
import GeneratePoster from "../../components/GeneratePoster";

export default function DashboardPage() {
  return (
    <div className="py-10">
      {/* DASHBOARD HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface/60 p-8 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface2/60 px-3 py-1 text-xs text-muted">
              <span className="h-2 w-2 rounded-full bg-[rgba(61,255,154,1)] shadow-[0_0_25px_rgba(61,255,154,0.35)]" />
              Dashboard • Generate • History
            </div>

            <h1 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight text-text">
              Create a new poster
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-muted">
              Build a strong prompt, pick a style, and generate. Every result is
              saved automatically in your history.
            </p>
          </div>

          {/* Right */}
          <div>
            <Link
              href="/history"
              className="inline-flex items-center rounded-xl border border-border bg-surface2/50 px-5 py-3 text-sm font-semibold text-text hover:bg-surface2 transition-colors"
            >
              View history →
            </Link>
          </div>
        </div>

        {/* subtle glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_20%_0%,rgba(122,92,255,0.18),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_80%_0%,rgba(61,255,154,0.14),transparent_60%)]" />
      </section>

      {/* GENERATOR */}
      <section id="generator" className="mt-10">
        <GeneratePoster />
      </section>
    </div>
  );
}
