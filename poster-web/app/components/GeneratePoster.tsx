"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function GeneratePoster() {
  const { status } = useSession();
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);


  const generate = async () => {
    setError(null);
    setImageUrl(null);

    if (status !== "authenticated") {
      setError("Please sign in to generate a poster.");
      return;
    }

    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Please enter a prompt.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });

      const raw = await res.text();
      let data: any = {};

      try {
        data = JSON.parse(raw);
      } catch {
        data = { error: raw };
      }

      if (!res.ok) {
        if (res.status === 402) {
          setError("You have no credits remaining.");
          return;
        }
        setError(data?.error || `Generation failed (${res.status}).`);
        return;
      }

      const url = data?.presigned_url;
      if (!url) {
        setError("No image URL returned by backend.");
        return;
      }
      
      //✅ READ CREDITS FROM BACKEND RESPONSE
      if (typeof data?.credits_remaining === "number") {
        setCreditsRemaining(data.credits_remaining);
      }

      setImageUrl(url);

    } catch (e: any) {
      setError(e?.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

        {creditsRemaining !== null && (
          <div style={{ fontSize: 14, opacity: 0.8 }}>
            Credits remaining: <strong>{creditsRemaining}</strong>
          </div>
        )}

        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your poster"
          style={{ padding: 10 }}
        />

        <button
          onClick={generate}
          disabled={loading || !prompt.trim()}
          style={{ padding: 10 }}
        >
          {loading ? "Generating..." : "Generate"}
        </button>

        {error && (
          <div style={{ padding: 10, border: "1px solid #f5c2c7" }}>
            {error}
          </div>
        )}

        {imageUrl && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <img src={imageUrl} alt="poster" width={400} />
            <a href={imageUrl} target="_blank" rel="noreferrer">
              Open image
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
