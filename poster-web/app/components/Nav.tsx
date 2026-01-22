"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export function Nav() {
  const { data: session } = useSession();

  return (
    <nav style={{ display: "flex", gap: 16, marginBottom: 16 }}>
      <Link href="/">Home</Link>
      <Link href="/dashboard">Dashboard</Link>

      {session?.groups?.includes("admin") && (
        <Link href="/admin">Admin</Link>
      )}
    </nav>
  );
}
