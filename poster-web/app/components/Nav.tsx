"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cx(
        "text-sm transition-colors",
        active ? "text-text" : "text-muted hover:text-text"
      )}
    >
      {children}
    </Link>
  );
}

export default function Nav() {
  const { status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[rgba(15,18,32,0.95)] backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-surface2">
            <span className="h-2.5 w-2.5 rounded-full bg-[rgba(61,255,154,1)] shadow-[0_0_26px_rgba(61,255,154,0.45)]" />
          </span>
          <span className="text-sm font-semibold text-text">
            Poster Generator
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/history">History</NavLink>

          {/* Landing sections */}
          <Link
            href="/#showcase"
            className="text-sm text-muted hover:text-text transition-colors"
          >
            Showcase
          </Link>
          <Link
            href="/#features"
            className="text-sm text-muted hover:text-text transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm text-muted hover:text-text transition-colors"
          >
            How it works
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard#generator"
            className="hidden sm:inline-flex rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent2 transition-colors
                       shadow-[0_0_34px_rgba(122,92,255,0.18)]
                       hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(122,92,255,0.18)] active:translate-y-0"
          >
            Open App
          </Link>

          {status !== "authenticated" ? (
            <Link
              href="/api/auth/signin"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-surface2 transition-colors
                         hover:-translate-y-0.5 active:translate-y-0"
            >
              Sign in
            </Link>
          ) : (
            <button
              className="rounded-xl border border-danger/25 bg-danger/10 px-3 py-2 text-sm text-text hover:bg-danger/15 transition-colors
                         hover:-translate-y-0.5 active:translate-y-0"
              onClick={() => signOut()}
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
