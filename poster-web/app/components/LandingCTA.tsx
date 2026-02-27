"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { COGNITO_LOGIN_URL } from "../lib/auth";

export default function LandingCTA({ variant }: { variant?: "large" }) {
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  const base =
    variant === "large"
      ? "inline-flex rounded-2xl bg-accent px-6 py-4 text-base font-semibold text-white hover:bg-accent2 transition-colors shadow-[0_0_34px_rgba(122,92,255,0.18)]"
      : "rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent2 transition-colors shadow-[0_0_34px_rgba(122,92,255,0.18)]";

  return isAuthed ? (
    <Link href="/dashboard" className={base}>
      Open app
    </Link>
  ) : (
    <Link href={COGNITO_LOGIN_URL} className={base}>
      Sign in to generate
    </Link>
  );
}
