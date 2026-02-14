"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cx(
        "relative text-lg transition-colors duration-200 transform hover:-translate-y-0.5",
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const authLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/history", label: "History" },
  ];

  const landingLinks = [
    { href: "/#showcase-strip", label: "Showcase" },
    { href: "/#features", label: "Features" },
    { href: "/gallery", label: "Gallery" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[rgba(15,18,32,0.95)] backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 transition-transform duration-200 hover:-translate-y-1"
        >
          <span
            className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30
                       shadow-[0_0_20px_var(--brand-gradient-from)] animate-pulse-slow
                       transition-transform duration-200 hover:scale-105 overflow-hidden"
            style={{ '--brand-gradient-from': '#3dff9a', '--brand-gradient-to': '#7c5cff' } as React.CSSProperties}
          >
            <img
              src="/images/logo1.jpg"
              alt="Brand Logo"
              className="h-12 w-12 object-contain"
            />
          </span>

          <span className="text-2xl font-extrabold bg-gradient-to-r from-[#3dff9a] via-[#7c5cff] to-[#3dff9a] bg-clip-text text-transparent drop-shadow-[0_0_5px_rgba(61,255,154,0.6)] transition-transform duration-200 hover:scale-105">
            Poster Generator
          </span>

          <span className="ml-1 inline-block rounded-full bg-accent px-3 py-1 text-xs sm:text-sm font-semibold text-white
                          shadow-[0_0_10px_rgba(122,92,255,0.5)]
                          animate-pulse-slow
                          transition-transform duration-200 hover:scale-110 hover:bg-accent2">
            Beta
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink href="/">Home</NavLink>
          {status === "authenticated" &&
            authLinks.map((link) => <NavLink key={link.href} href={link.href}>{link.label}</NavLink>)}
          {landingLinks.map((link) => <NavLink key={link.href} href={link.href}>{link.label}</NavLink>)}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Hamburger for mobile */}
          {isMobile && (
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
              className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-surface2 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Desktop CTA */}
          {!isMobile && (
            <Link
              href="/dashboard#generator"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-white
                         shadow-[0_0_34px_rgba(122,92,255,0.18)]
                         hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_0_50px_rgba(122,92,255,0.3)]
                         transition-all duration-200 active:translate-y-0"
            >
              <img src="/images/poster-icon.png" alt="Poster Generator Icon" className="w-5 h-5" />
              Open App
            </Link>
          )}

          {/* Sign in / Sign out */}
          {status !== "authenticated" ? (
            <Link
              href="/api/auth/signin"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-surface2 transition-colors hover:-translate-y-0.5 active:translate-y-0"
            >
              Sign in
            </Link>
          ) : (
            !isMobile && (
              <button
                className="rounded-xl border border-danger/25 bg-danger/10 px-3 py-2 text-sm text-text hover:bg-danger/15 transition-colors hover:-translate-y-0.5 active:translate-y-0"
                onClick={() => signOut()}
              >
                Sign out
              </button>
            )
          )}
        </div>
      </div>

      {/* Mobile Full-Screen Overlay (panel style) */}
      {isMobile && isMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-[rgba(15,18,32,0.85)] backdrop-blur
                    flex items-center justify-center px-6"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          onMouseDown={() => setIsMenuOpen(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl border border-border bg-surface/80 shadow-[0_30px_90px_rgba(0,0,0,0.55)]
                      p-6"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header row */}
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm font-semibold text-text">Menu</div>

              <button
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-surface2/60 p-2 hover:bg-surface2 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-text"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-col gap-3">
              <NavLink href="/" onClick={() => setIsMenuOpen(false)}>
                Home
              </NavLink>

              {status === "authenticated" &&
                authLinks.map((link) => (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                ))}

              {landingLinks.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Divider */}
            <div className="my-6 h-px w-full bg-border" />

            {/* Sign in / Sign out */}
            <div className="flex justify-center">
              {status !== "authenticated" ? (
                <Link
                  href="/api/auth/signin"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex items-center justify-center rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-white
                            shadow-[0_0_34px_rgba(122,92,255,0.18)]
                            hover:bg-accent2 transition-colors"
                >
                  Sign in
                </Link>
              ) : (
                <button
                  className="inline-flex items-center justify-center rounded-2xl border border-danger/25 bg-danger/10 px-6 py-3 text-sm text-text
                            hover:bg-danger/15 transition-colors"
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
