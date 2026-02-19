import Script from "next/script";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://kornea-poster-ai.com")
  .trim()
  .replace(/\/$/, "");

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Gallery — Kornea Poster AI",
    description: "Browse a selection of cinematic AI posters generated with Kornea Poster AI.",
    url: `${siteUrl}/gallery`,
    isPartOf: {
      "@type": "WebSite",
      name: "Kornea Poster AI",
      url: siteUrl,
    },
  };

  return (
    <>
      <Script
        id="ld-json-gallery"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
