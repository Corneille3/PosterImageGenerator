"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Nav() {
  const { data: session, status } = useSession();
  const isAdmin = session?.groups?.includes("admin");

  return (
    <nav className="w-full border-b px-6 py-4 flex items-center gap-4">
      <Link href="/" className="font-semibold">
        Poster Generator
      </Link>

      <Link href="/dashboard" className="underline">
        Dashboard
      </Link>

      {isAdmin && (
        <Link href="/admin" className="underline">
          Admin
        </Link>
      )}

      <div className="ml-auto">
        {status === "authenticated" ? (
          <button
            className="px-3 py-2 rounded bg-black text-white"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        ) : null}
      </div>
    </nav>
  );
}
