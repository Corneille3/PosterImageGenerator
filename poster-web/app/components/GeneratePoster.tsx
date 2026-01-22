"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function GeneratePoster() {
  const { data: session } = useSession();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");

  const generate = async () => {
    if (!session?.idToken) {
      alert("Please sign in");
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_POSTER_API_URL}?prompt=${encodeURIComponent(
        prompt
      )}`,
      {
        headers: {
          Authorization: `Bearer ${session.idToken}`,
        },
      }
    );

    const data = await res.json();
    setImageUrl(data.presigned_url);
  };

  return (
    <div>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your poster"
      />
      <button onClick={generate}>Generate</button>

      {imageUrl && <img src={imageUrl} alt="poster" width={400} />}
    </div>
  );
}
