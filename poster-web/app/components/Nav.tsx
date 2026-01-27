"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "rounded-xl px-3 py-2 text-sm transition-colors",
        active
          ? "bg-accent/15 text-text border border-accent/25"
          : "text-muted hover:text-text hover:bg-surface2 border border-transparent",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export default function Nav() {
  const { data: session, status } = useSession();
  const isAdmin = session?.groups?.includes("admin");

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
        {/* Brand */}
        <Link href="/" className="group mr-1 flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            {/* simple icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="text-sm font-semibold tracking-tight text-text group-hover:text-accent2 transition-colors">
            Poster Generator
          </span>
        </Link>

        {/* Links */}
        <div className="ml-2 flex items-center gap-1">
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/history">History</NavLink>
          {isAdmin ? <NavLink href="/admin">Admin</NavLink> : null}
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {status === "authenticated" ? (
            <button
              className="rounded-xl border border-danger/25 bg-danger/10 px-3 py-2 text-sm text-text hover:bg-danger/15 transition-colors"
              onClick={() => signOut()}
            >
              Sign out
            </button>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
