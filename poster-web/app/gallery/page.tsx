import type { Metadata } from "next";
import Script from "next/script";
import GalleryClient from "./GalleryClient";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://kornea-poster-ai.com")
  .trim()
  .replace(/\/$/, "");

const ogImage = new URL("/images/dish3.png", siteUrl).toString();

export const metadata: Metadata = {
  title: "Gallery — Kornea Poster AI",
  description:
    "Browse a selection of cinematic AI posters generated with Kornea Poster AI.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "Gallery — Kornea Poster AI",
    description:
      "Browse a selection of cinematic AI posters generated with Kornea Poster AI.",
    url: "/gallery",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "Kornea Poster AI Gallery",
      },
    ],
  },
  twitter: {
    title: "Gallery — Kornea Poster AI",
    description:
      "Browse a selection of cinematic AI posters generated with Kornea Poster AI.",
    images: [ogImage],
  },
};

export default function GalleryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Gallery",
        item: `${siteUrl}/gallery`,
      },
    ],
  };

  return (
    <>
      <Script
        id="ld-json-gallery-breadcrumbs"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GalleryClient />
    </>
  );
}
