import Link from "next/link";
import GeneratePoster from "../components/GeneratePoster";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>

        {/* 👇 History link */}
        <Link
          href="/history"
          className="text-sm underline opacity-80 hover:opacity-100"
        >
          View history
        </Link>
      </div>

      <GeneratePoster />
    </div>
  );
}
