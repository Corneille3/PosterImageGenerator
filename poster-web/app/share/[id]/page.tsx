import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";

  const base = host ? `${proto}://${host}` : process.env.NEXTAUTH_URL ?? "";
  if (!base) throw new Error("Missing request host and NEXTAUTH_URL");

  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) throw new Error("Missing API_BASE_URL");

  const res = await fetch(`${apiBase}/moviePosterImageGenerator/share/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
  const text = await res.text().catch(() => "");
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-xl font-semibold tracking-tight text-text">
          Link not available
        </h1>
        <p className="mt-2 text-sm text-muted">
          This share link may have expired, been revoked, or is invalid.
        </p>

        {/* DEBUG (temporary) */}
        <div className="mt-4 rounded-2xl border border-border bg-surface p-3 text-xs text-text">
          <div><b>fetch url</b>: {`${base}/api/share/${id}`}</div>
          <div><b>status</b>: {res.status}</div>
          <div className="mt-2 whitespace-pre-wrap break-words">
            <b>body</b>: {text || "(empty)"}
          </div>
        </div>
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

        <div className="mt-4 rounded-2xl border border-border bg-surface p-3 text-xs text-text">
          <div>
            <b>res.status</b>: {res.status}
          </div>
          <div>
            <b>keys</b>: {Object.keys(data ?? {}).join(", ") || "(none)"}
          </div>
          <div className="mt-2 whitespace-pre-wrap break-words">
            <b>data</b>: {JSON.stringify(data)}
          </div>
        </div>

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
