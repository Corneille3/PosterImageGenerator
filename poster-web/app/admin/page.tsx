"use client";

import { useSession } from "next-auth/react";

export default function Admin() {
  const { data: session } = useSession();

  return (
    <div style={{ padding: 24 }}>
      <h1>Admin (Protected)</h1>
      <p>Groups: {session?.groups?.join(", ") ?? "(none)"}</p>
      <p>If you can see this page, middleware allowed you in.</p>
    </div>
  );
}


