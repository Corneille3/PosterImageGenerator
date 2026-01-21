"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full p-8 border rounded-xl space-y-4">
        <h1 className="text-2xl font-semibold">Poster Generator</h1>

        {status === "authenticated" ? (
          <>
            <p>Signed in ✅</p>
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
