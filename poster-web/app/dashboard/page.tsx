import Link from "next/link";
import GeneratePoster from "../components/GeneratePoster";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-8">

        {/* existing header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted">
              Create cinematic posters with AI.
            </p>
          </div>

          <Link
            href="/history"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-surface2"
          >
            View history
          </Link>
        </div>

        <GeneratePoster />
      </div>
    </div>
  );
}
