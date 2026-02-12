"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={cx(
        "relative text-sm transition-colors duration-200 transform hover:-translate-y-0.5",
        active ? "text-text" : "text-muted hover:text-text"
      )}
    >
      {children}
      <span
        className={cx(
          "absolute left-0 -bottom-1 h-0.5 bg-accent transition-all duration-200",
          active ? "w-full" : "w-0 group-hover:w-full"
        )}
      />
    </Link>
  );
}

export default function Nav() {
  const { status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[rgba(15,18,32,0.95)] backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 shadow-[0_0_20px_var(--brand-gradient-from)] animate-pulse-slow">
            <img src="/images/logo1.jpg" alt="Brand Logo" className="h-12 w-12 object-contain" />
          </span>
          <span className="text-2xl font-extrabold bg-gradient-to-r from-[#3dff9a] via-[#7c5cff] to-[#3dff9a] bg-clip-text text-transparent">
            Poster Generator
          </span>
          <span className="ml-1 inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
            Beta
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/history">History</NavLink>
          <Link href="/#showcase" className="text-sm text-muted hover:text-text">Showcase</Link>
          <Link href="/#features" className="text-sm text-muted hover:text-text">Features</Link>
          <Link href="/gallery" className="text-sm text-muted hover:text-text">Gallery</Link>
        </nav>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-3">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
            <svg className="w-6 h-6 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden flex flex-col gap-3 px-4 py-2 border-t border-border bg-[rgba(15,18,32,0.95)]">
          <Link href="/dashboard#generator" className="rounded-xl bg-accent px-4 py-2 text-white text-center font-semibold">Open App</Link>
          {status !== "authenticated" ? (
            <Link href="/api/auth/signin" className="rounded-xl border px-4 py-2 text-center">Sign in</Link>
          ) : (
            <button onClick={() => signOut()} className="rounded-xl border px-4 py-2 text-center">Sign out</button>
          )}
        </div>
      )}
    </header>
  );
}
