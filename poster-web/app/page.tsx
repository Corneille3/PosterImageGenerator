import type { Metadata } from "next";
import ClientHomePage from "./ClientHomePage";

export const metadata: Metadata = {
  title: "Kornea Poster AI — Cinematic AI Movie Poster Generator",
  description:
    "Generate cinematic AI movie posters in seconds. Save history, reuse prompts, and share public links — powered by AWS.",
};

export default function Page() {
  return <ClientHomePage />;
}
