import type { Metadata } from "next";
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
  return <GalleryClient />;
}
