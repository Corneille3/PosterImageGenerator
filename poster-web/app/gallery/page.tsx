import type { Metadata } from "next";
import GalleryClient from "./GalleryClient";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://kornea-poster-ai.com")
  .trim()
  .replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Gallery — Kornea Poster AI",
  description:
    "Browse a selection of cinematic AI posters generated with Kornea Poster AI.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    type: "website",
    url: "/gallery",
    title: "Gallery — Kornea Poster AI",
    description:
      "Browse a selection of cinematic AI posters generated with Kornea Poster AI.",
    images: [
      {
        url: new URL("/images/dish3.png", siteUrl).toString(),
        width: 1200,
        height: 630,
        alt: "Kornea Poster AI Gallery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gallery — Kornea Poster AI",
    description:
      "Browse a selection of cinematic AI posters generated with Kornea Poster AI.",
    images: [new URL("/images/dish3.png", siteUrl).toString()],
  },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
