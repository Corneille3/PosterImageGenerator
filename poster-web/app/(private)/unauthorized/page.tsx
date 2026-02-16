import { Suspense } from "react";
import UnauthorizedClient from "./UnauthorizedClient";

export const dynamic = "force-dynamic";

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<UnauthorizedFallback />}>
      <UnauthorizedClient />
    </Suspense>
  );
}

function UnauthorizedFallback() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Unauthorized</h1>
      <p>You do not have permission to access this page.</p>
      <p style={{ opacity: 0.7, marginTop: 8 }}>Loading…</p>
    </div>
  );
}
