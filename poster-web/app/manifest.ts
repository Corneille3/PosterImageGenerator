import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kornea Poster AI",
    short_name: "Kornea AI",
    description: "Cinematic AI movie poster generator.",
    start_url: "/",
    display: "standalone",
    background_color: "#03050a",
    theme_color: "#03050a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
