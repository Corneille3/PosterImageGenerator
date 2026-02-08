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
        "relative text-sm transition-colors duration-200 transform hover:-translate-y-0.5",
        active ? "text-text" : "text-muted hover:text-text"
      )}
    >
      {children}

      {/* Underline */}
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

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[rgba(15,18,32,0.95)] backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 transition-transform duration-200 hover:-translate-y-1"
        >
          {/* Logo circle */}
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface2 shadow-md transition-transform duration-200 hover:scale-105">
            <span className="h-3 w-3 rounded-full bg-[rgba(61,255,154,1)] shadow-[0_0_30px_rgba(61,255,154,0.5)] animate-pulse" />
          </span>

          {/* Brand name gradient */}
          <span className="text-lg font-bold bg-gradient-to-r from-[#3dff9a] to-[#7c5cff] bg-clip-text text-transparent transition-transform duration-200 hover:scale-105">
            Poster Generator
          </span>

          {/* Beta badge */}
          <span className="ml-1 inline-block rounded-full bg-accent px-2 text-xs font-semibold text-white
                           transition-transform duration-200 hover:scale-110 hover:bg-accent2">
            Beta
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
            className="relative text-sm text-muted hover:text-text transition-colors duration-200 transform hover:-translate-y-0.5"
          >
            Showcase
            <span className="absolute left-0 -bottom-1 h-0.5 bg-accent w-0 transition-all duration-200 group-hover:w-full" />
          </Link>
          <Link
            href="/#features"
            className="relative text-sm text-muted hover:text-text transition-colors duration-200 transform hover:-translate-y-0.5"
          >
            Features
            <span className="absolute left-0 -bottom-1 h-0.5 bg-accent w-0 transition-all duration-200 group-hover:w-full" />
          </Link>
          <Link
            href="/#how-it-works"
            className="relative text-sm text-muted hover:text-text transition-colors duration-200 transform hover:-translate-y-0.5"
          >
            How it works
            <span className="absolute left-0 -bottom-1 h-0.5 bg-accent w-0 transition-all duration-200 group-hover:w-full" />
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Open App button with image */}
          <Link
            href="/dashboard#generator"
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-white
                       shadow-[0_0_34px_rgba(122,92,255,0.18)]
                       hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_0_50px_rgba(122,92,255,0.3)]
                       transition-all duration-200 active:translate-y-0"
          >
            <img
              src="/images/poster-icon.png" // make sure the file exists in /public/images
              alt="Poster Generator Icon"
              className="w-5 h-5"
            />
            Open App
          </Link>

          {/* Sign in / Sign out buttons */}
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
