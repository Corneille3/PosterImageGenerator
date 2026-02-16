"use client";

import { useSession } from "next-auth/react";

export default function AdminPage() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div className="p-6">Loading…</div>;

  if (status !== "authenticated") {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Unauthorized</h1>
        <p>You must be signed in to access this page.</p>
      </div>
    );
  }

  const isAdmin = session?.groups?.includes("admin");

  if (!isAdmin) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Unauthorized</h1>
        <p>You do not have permission to access this page.</p>
        <p className="mt-2 text-sm opacity-70">
          Groups: {(session?.groups ?? []).join(", ") || "(none)"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Admin (Protected)</h1>
      <p>If you can see this, you are in the admin group.</p>
      <p className="mt-2 text-sm opacity-70">
        Groups: {(session.groups ?? []).join(", ")}
      </p>
    </div>
  );
}
