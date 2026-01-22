"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full p-8 border rounded-xl space-y-4">
        <h1 className="text-2xl font-semibold">Poster Generator</h1>

        {status === "authenticated" ? (
          <>
            <p>Signed in ✅</p>

            {/* Show groups for visibility/debug */}
            <p className="text-sm text-gray-600">
              Groups: {session?.groups?.join(", ") || "(none)"}
            </p>

            {/* Admin link only for admin users */}
            {session?.groups?.includes("admin") && (
              <Link
                href="/admin"
                className="block text-blue-600 underline"
              >
                Go to Admin
              </Link>
            )}

            <Link
              href="/dashboard"
              className="block text-blue-600 underline"
            >
              Go to Dashboard
            </Link>

            <button
              className="px-4 py-2 rounded bg-black text-white"
              onClick={() => signOut()}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <p>Not signed in ❌</p>
            <button
              className="px-4 py-2 rounded bg-black text-white"
              onClick={() => signIn("cognito")}
            >
              Sign in with Cognito
            </button>
          </>
        )}
      </div>
    </div>
  );
}
