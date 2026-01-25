"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function Unauthorized() {
  const params = useSearchParams();
  const router = useRouter();
  const from = params.get("from");

  return (
    <div style={{ padding: 24 }}>
      <h1>Unauthorized</h1>
      <p>You do not have permission to access this page.</p>

      {from && (
        <p style={{ opacity: 0.7, marginTop: 8 }}>
          Attempted to access: <code>{from}</code>
        </p>
      )}

      <button
        style={{ marginTop: 16 }}
        onClick={() => router.push("/dashboard")}
      >
        Go back to dashboard
      </button>
    </div>
  );
}
