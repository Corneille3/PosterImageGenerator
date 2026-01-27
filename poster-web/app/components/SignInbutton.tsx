"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function SignInButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="h-9 w-24 animate-pulse rounded-xl bg-surface2" />
    );
  }

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="inline-flex items-center justify-center rounded-xl border border-danger/25 bg-danger/10 px-3 py-2 text-sm text-text hover:bg-danger/15 transition-colors"
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("cognito")}
      className="inline-flex items-center justify-center rounded-xl bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent2 transition-colors"
    >
      Sign in
    </button>
  );
}
