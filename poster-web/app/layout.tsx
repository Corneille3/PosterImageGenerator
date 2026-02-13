import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Nav from "./components/Nav";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    "Generate cinematic AI movie posters in seconds. Save history, reuse prompts, and share public links - powered by AWS.",
  applicationName: "Kornea Poster AI",

  robots: {
    index: true,
    follow: true,
  },

  // ✅ Absolute canonical
  alternates: {
    canonical: new URL(siteUrl),
  },

  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Kornea Poster AI",
    title: "Kornea Poster AI — Cinematic AI Movie Poster Generator",
    description:
      "Generate stunning AI-powered cinematic movie posters in seconds with Kornea Poster AI. Save your creations, reuse prompts, and share public links—powered by AWS.",
    images: [
      {
        url: new URL("/images/joy1.png", siteUrl).toString(),
        width: 1200,
        height: 630,
        alt: "Kornea Poster AI – AI Movie Poster Generator",
      },
      {
        url: new URL("/images/joy2.png", siteUrl).toString(),
        width: 1200,
        height: 630,
        alt: "Poster 2",
      },
      {
        url: new URL("/images/joy3.png", siteUrl).toString(),
        width: 1200,
        height: 630,
        alt: "Poster 3",
      },
      {
        url: new URL("/images/joy4.png", siteUrl).toString(),
        width: 1200,
        height: 630,
        alt: "Poster 4",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Kornea Poster AI — Cinematic AI Movie Poster Generator",
    description:
      "Generate stunning AI-powered cinematic movie posters in seconds with Kornea Poster AI. Save your creations, reuse prompts, and share public links—powered by AWS.",
    images: [new URL("/images/joy1.png", siteUrl).toString()],
      "Generate cinematic AI movie posters in seconds. Save history, reuse prompts, and share public links — powered by AWS.",
    images: [
      new URL("/images/joy1.png", siteUrl).toString(),
      new URL("/images/joy2.png", siteUrl).toString(),
      new URL("/images/joy3.png", siteUrl).toString(),
      new URL("/images/joy4.png", siteUrl).toString(),
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    "@context": "http://schema.org",
    "@type": "WebPage",
    "name": "Kornea Poster AI — Cinematic AI Movie Poster Generator",
    "description":
      "Generate cinematic AI movie posters in seconds. Save history, reuse prompts, and share public links — powered by AWS.",
    "url": siteUrl,
    "image": [
      {
        "@type": "ImageObject",
        "url": new URL("/images/joy1.png", siteUrl).toString(),
        "width": 1200,
        "height": 630,
        "alt": "Kornea Poster AI – AI Movie Poster Generator",
      },
      {
        "@type": "ImageObject",
        "url": new URL("/images/joy2.png", siteUrl).toString(),
        "width": 1200,
        "height": 630,
        "alt": "Poster 2",
      },
      {
        "@type": "ImageObject",
        "url": new URL("/images/joy3.png", siteUrl).toString(),
        "width": 1200,
        "height": 630,
        "alt": "Poster 3",
      },
      {
        "@type": "ImageObject",
        "url": new URL("/images/joy4.png", siteUrl).toString(),
        "width": 1200,
        "height": 630,
        "alt": "Poster 4",
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        {/* Inject structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-bg text-text min-h-dvh`}
      >
        {/* AI Watermark / Glow Background */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10"
        >
          <div className="absolute inset-0 bg-[#03050a]" />
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background:
                "radial-gradient(1200px 1200px at 15% 50%, rgba(61,255,154,0.22), transparent 70%), radial-gradient(1200px 1200px at 85% 50%, rgba(122,92,255,0.22), transparent 70%)",
              filter: "blur(1.2px)",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_0%,rgba(255,255,255,0.06),transparent_60%)]" />
        </div>

        <Providers>
          <Nav />

          {/* Page shell */}
          <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="mt-16 border-t border-border bg-surface/40">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 text-sm text-muted flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>© {new Date().getFullYear()} Poster Generator</span>
              <div className="flex gap-4">
                <a className="hover:text-text" href="#">
                  Terms
                </a>
                <a className="hover:text-text" href="#">
                  Privacy
                </a>
              </div>
            </div>
          </footer>

          {/* Vercel Speed Insights */}
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
