export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const base = process.env.NEXTAUTH_URL || "";
  const res = await fetch(`${base}/api/share/${id}`, { cache: "no-store" });

  if (!res.ok) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <h1 className="text-xl font-semibold tracking-tight text-text">
            Link not available
          </h1>
          <p className="mt-2 text-sm text-muted">
            This share link may have expired, been revoked, or is invalid.
          </p>
        </div>
      </div>
    );
  }

  const data = await res.json();

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-xl font-semibold tracking-tight text-text">
          Shared poster
        </h1>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.presigned_url}
            alt="shared poster"
            className="h-auto w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-surface p-4 shadow-soft">
          <div className="text-xs font-semibold text-muted">Prompt</div>
          <div className="mt-1 text-sm text-text break-words">
            {data.prompt || "(no prompt)"}
          </div>
        </div>
      </div>
    </div>
  );
}
