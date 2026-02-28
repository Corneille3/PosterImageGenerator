import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-muted">
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <span>© {new Date().getFullYear()} Kornea</span>
        <div className="flex items-center gap-4">
          <Link href="/about" className="hover:text-text transition-colors">
            About
          </Link>
          <Link href="/privacy" className="hover:text-text transition-colors">
            Privacy
          </Link>
          <Link
            href="/data-deletion"
            className="hover:text-text transition-colors"
          >
            Data Deletion
          </Link>
        </div>
      </div>
    </footer>
  );
}
