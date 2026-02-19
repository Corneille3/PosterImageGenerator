import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FALLBACK_DESCRIPTION = "Shared poster from Kornea Poster AI.";

function toDescription(prompt?: string | null, max = 160) {
  if (!prompt) return FALLBACK_DESCRIPTION;
  const normalized = prompt.trim().replace(/\s+/g, " ");
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, Math.max(0, max - 3)).trimEnd()}...`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const apiBase = process.env.API_BASE_URL;
  const canonical = `/share/${id}`;

  const baseMetadata: Metadata = {
    title: "Shared poster",
    description: FALLBACK_DESCRIPTION,
    robots: { index: false, follow: true },
    alternates: { canonical },
  };

  if (!apiBase) {
    return {
      ...baseMetadata,
      title: "Link not available",
    };
  }

  try {
    const res = await fetch(
      `${apiBase}/moviePosterImageGenerator/share/${id}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return {
        ...baseMetadata,
        title: "Link not available",
      };
    }

    const data = await res.json();
    const imageUrl = data.public_image_url ?? data.presigned_url;
    const description = toDescription(data.prompt);

    return {
      title: "Shared poster",
      description,
      robots: { index: false, follow: true },
      alternates: { canonical },
      openGraph: {
        title: "Shared poster",
        description,
        url: canonical,
        type: "website",
        images: imageUrl ? [{ url: imageUrl }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: "Shared poster",
        description,
        images: imageUrl ? [imageUrl] : undefined,
      },
    };
  } catch {
    return {
      ...baseMetadata,
      title: "Link not available",
    };
  }
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) throw new Error("Missing API_BASE_URL");

  const res = await fetch(`${apiBase}/moviePosterImageGenerator/share/${id}`, {
    cache: "no-store",
  });

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

          {/* DEBUG (temporary) */}
        </div>
      </div>
    );
  }

  const data = await res.json();
  const imageUrl = data.public_image_url ?? data.presigned_url;

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-xl font-semibold tracking-tight text-text">
          Shared poster
        </h1>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
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
