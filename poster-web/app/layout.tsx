// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";
import Nav from "./components/Nav";
import { SpeedInsights } from "@vercel/speed-insights/next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://kornea-poster-ai.com")
  .trim()
  .replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Kornea Poster AI — Cinematic AI Movie Poster Generator",
    template: "%s — Kornea Poster AI",
  },
  description:
    "Generate cinematic AI movie posters in seconds. Save history, reuse prompts, and share public links — powered by AWS.",

  applicationName: "Kornea Poster AI",

  // Global default is indexable; private routes override via app/(private)/layout.tsx
  robots: { index: true, follow: true },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Kornea Poster AI",
    title: "Kornea Poster AI — Cinematic AI Movie Poster Generator",
    description:
      "Generate cinematic AI movie posters in seconds. Save history, reuse prompts, and share public links — powered by AWS.",
    images: [
      {
        url: new URL("/images/joy1.png", siteUrl).toString(),
        width: 1200,
        height: 630,
        alt: "Kornea Poster AI",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Kornea Poster AI — Cinematic AI Movie Poster Generator",
    description:
      "Generate cinematic AI movie posters in seconds. Save history, reuse prompts, and share public links — powered by AWS.",
    images: [new URL("/images/joy1.png", siteUrl).toString()],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Kornea",
      url: siteUrl,
      logo: new URL("/icon-512.png", siteUrl).toString(),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Kornea Poster AI",
      url: siteUrl,
      description:
        "Generate cinematic AI movie posters in seconds. Save history, reuse prompts, and share public links — powered by AWS.",
    },
  ];

  return (
    <html lang="en">
      <body className="bg-bg text-text min-h-dvh">
        <Script
          id="ld-json-global"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <Providers>
          <Nav />
          <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            {children}
          </main>
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
