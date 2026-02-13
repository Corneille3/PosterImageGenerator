"use client";

import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";


const STYLES = [
  {
    id: "cinematic",
    name: "Cinematic",
    blurb: "Big contrast, dramatic lighting, blockbuster feel",
    stylePrompt:
      "cinematic lighting, high contrast, ultra-detailed, movie poster composition",
  },
  {
    id: "noir",
    name: "Noir Thriller",
    blurb: "Moody shadows, gritty, mystery tone",
    stylePrompt:
      "dark noir, high contrast, dramatic shadows, film grain, moody atmosphere",
  },
  {
    id: "animation",
    name: "Kids Animation",
    blurb: "Colorful, playful, friendly characters",
    stylePrompt:
      "colorful animated style, playful mood, bright lighting, family-friendly poster",
  },
  {
    id: "horror",
    name: "Horror Minimal",
    blurb: "Minimal, eerie, unsettling negative space",
    stylePrompt:
      "minimalist horror, eerie mood, strong negative space, subtle fog, ominous lighting",
  },
] as const;

const PRESETS = [
  {
    id: "kids-animation",
    label: "Kids Animation",
    prompt:
      "Colorful animated movie poster, playful characters, bright lighting, friendly mood, Pixar-style composition",
  },
  {
    id: "cinematic-sci-fi",
    label: "Cinematic Sci-Fi",
    prompt:
      "Cinematic movie poster, futuristic sci-fi setting, dramatic lighting, ultra-detailed, high contrast, epic scale",
  },
  {
    id: "safari-documentary",
    label: "Safari Documentary",
    prompt:
      "Cinematic wildlife documentary poster, African savanna at sunrise, elephants and giraffes in natural motion, warm natural lighting, authentic cultural textures, earthy color palette, ultra-realistic detail",
  },
  {
    id: "tribal-adventure",
    label: "Tribal Adventure",
    prompt:
      "Adventure movie poster inspired by African tribal artistry, bold geometric patterns, warm ochre and red tones, savanna landscape, dramatic lighting, symbolic cultural motifs, epic storytelling energy",
  },
  {
    id: "noir-thriller",
    label: "Noir Thriller",
    prompt:
      "Dark noir movie poster, high contrast black and white, dramatic shadows, mysterious mood, cinematic lighting",
  },
  {
    id: "savanna-epic",
    label: "Savanna Epic",
    prompt:
      "Epic African savanna scene, sweeping landscapes, wildlife silhouettes against a glowing sky, cultural patterns subtly integrated into the design, high-contrast cinematic style",
  },
  {
    id: "epic-adventure",
    label: "Epic Adventure",
    prompt:
      "Epic adventure movie poster, wide landscape, heroic character, cinematic lighting, dramatic clouds",
  },
  {
    id: "horror-minimal",
    label: "Horror Minimal",
    prompt:
      "Minimalist horror movie poster, dark tones, unsettling atmosphere, strong negative space, eerie lighting",
  },
];

const ASPECT_RATIOS = [
  { value: "1:1", label: "Square (1:1 · default)" },
  { value: "16:9", label: "Widescreen (16:9)" },
] as const;

const OUTPUT_FORMATS = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
] as const;

type AspectRatio = (typeof ASPECT_RATIOS)[number]["value"];
type OutputFormat = (typeof OUTPUT_FORMATS)[number]["value"];

export default function GeneratePoster() {
  const { status } = useSession();

  const [prompt, setPrompt] = useState("");
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);

  // ✅ only supported defaults
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("png");

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

useEffect(() => {
  let cancelled = false;

  async function loadCredits() {
    if (status !== "authenticated") return;

    try {
      const res = await fetch("/api/credits", { method: "GET" });
      if (!res.ok) return;

      const data = await res.json();
      const c = data?.credits;

      if (!cancelled && typeof c === "number") {
        setCreditsRemaining(c);
      }
    } catch {
      // ignore
    }
  }

  loadCredits();
  return () => {
    cancelled = true;
  };
}, [status]);

  const canGenerate = useMemo(() => {
    const hasPrompt = Boolean(prompt.trim());
    const hasCredits = creditsRemaining === null ? true : creditsRemaining > 0;
    return status === "authenticated" && hasPrompt && hasCredits && !loading;
  }, [prompt, status, creditsRemaining, loading]);

  function applyStyle(styleId: string) {
    const style = STYLES.find((s) => s.id === styleId);
    if (!style) return;

    setSelectedStyleId(styleId);

    const trimmed = prompt.trim();
    if (!trimmed) {
      setPrompt(style.stylePrompt);
      return;
    }

    const withoutOldStyle = trimmed.replace(/\n?Style:\s.*$/i, "").trim();
    setPrompt(`${withoutOldStyle}\n\nStyle: ${style.stylePrompt}`);
  }

  function clearStyle() {
    setSelectedStyleId(null);
    setPrompt((p) => p.replace(/\n?Style:\s.*$/i, "").trim());
  }

  const resetOptions = () => {
    setAspectRatio("1:1");
    setOutputFormat("png");
  };

  const generate = async () => {
    setError(null);
    setImageUrl(null);
    setImageLoaded(false);

    if (status !== "authenticated") {
      setError("Please sign in to generate a poster.");
      return;
    }

    const trimmed = prompt.trim();
    if (!trimmed) {
      setError("Please enter a prompt.");
      return;
    }

    if (creditsRemaining !== null && creditsRemaining <= 0) {
      setError("You have no credits remaining.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          aspect_ratio: aspectRatio,
          output_format: outputFormat,
        }),
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

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt.trim());
    } catch {
      // ignore
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr] lg:items-start">
      {/* LEFT: controls */}
      <div className="grid gap-4">
        {/* Top row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-text">
              Generate a poster
            </h2>
            <p className="mt-1 text-sm text-muted">
              Describe a scene, mood, and style — we’ll turn it into a cinematic
              movie poster.
            </p>
          </div>

          {/* Credits pill */}
          {creditsRemaining !== null ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
              <span className="text-sm text-muted">Credits</span>
              <span className="text-sm font-semibold text-text">
                {creditsRemaining}
              </span>
            </div>
          ) : null}
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft sm:p-5">
          <label className="text-sm font-medium text-text">Prompt</label>

          {/* Presets */}
          <div className="mt-3 mb-3 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPrompt(p.prompt)}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text hover:bg-accent/15 hover:border-accent/30 transition"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Options */}
          <div className="mb-4 rounded-2xl border border-border bg-surface2/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-text">
                  Generation options
                </div>
                <div className="mt-1 text-xs text-muted">
                  Aspect ratio and output format are sent to the backend.
                </div>
              </div>

              <button
                type="button"
                onClick={resetOptions}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text hover:bg-surface2 transition"
              >
                Reset
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-1 text-xs font-medium text-muted">
                  Aspect ratio
                </div>
                <select
                  value={aspectRatio}
                  onChange={(e) =>
                    setAspectRatio(e.target.value as AspectRatio)
                  }
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/40"
                >
                  {ASPECT_RATIOS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="mb-1 text-xs font-medium text-muted">
                  Output format
                </div>
                <select
                  value={outputFormat}
                  onChange={(e) =>
                    setOutputFormat(e.target.value as OutputFormat)
                  }
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent/40"
                >
                  {OUTPUT_FORMATS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Style grid (RESTORED: label + clear style) */}
          <div className="mb-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium text-text">Style</div>
              {selectedStyleId ? (
                <button
                  type="button"
                  onClick={clearStyle}
                  className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition"
                >
                  ✕ Clear style
                </button>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {STYLES.map((s) => {
                const selected = selectedStyleId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => applyStyle(s.id)}
                    className={[
                      "text-left rounded-2xl border p-4 transition",
                      selected
                        ? "border-accent/40 bg-accent/10"
                        : "border-border bg-surface hover:bg-surface2",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-text">{s.name}</div>
                      {selected ? (
                        <span className="text-xs rounded-full border border-accent/30 bg-accent/15 px-2 py-1 text-accent">
                          Selected
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 text-xs text-muted">{s.blurb}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='Example: "A lone astronaut walking through neon rain on a cyberpunk street, dramatic lighting, cinematic"'
            className="min-h-[110px] w-full resize-none rounded-2xl border border-border bg-surface2 px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
          />

          {/* Actions */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyPrompt}
                disabled={!prompt.trim()}
                className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-surface2 disabled:opacity-50"
              >
                Copy prompt
              </button>

              <span className="hidden text-xs text-muted sm:inline">
                Tip: add genre + mood + lighting for best results.
              </span>
            </div>

            <button
              type="button"
              onClick={generate}
              disabled={!canGenerate}
              className="inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent2 disabled:opacity-50"
            >
              {loading ? "Generating poster…" : "Generate poster"}
            </button>
          </div>

          {/* Error */}
          {error ? (
            <div className="mt-4 rounded-2xl border border-danger/25 bg-danger/10 p-4">
              <div className="text-sm font-semibold text-text">
                Something went wrong
              </div>
              <div className="mt-1 text-sm text-muted">{error}</div>
            </div>
          ) : null}

          {/* Auth hint */}
          {status !== "authenticated" ? (
            <div className="mt-4 rounded-2xl border border-border bg-surface2 p-4 text-sm text-muted">
              Sign in to generate posters and track your history.
            </div>
          ) : null}

          {/* No credits hint */}
          {creditsRemaining !== null && creditsRemaining <= 0 ? (
            <div className="mt-4 rounded-2xl border border-danger/25 bg-danger/10 p-4 text-sm text-muted">
              You’re out of credits. Check again in 24 for 10 more. FREE!!!!!!
            </div>
          ) : null}
        </div>
      </div>

      {/* RIGHT: preview */}
      <div className="lg:sticky lg:top-24">
        <PreviewPanel
          loading={loading}
          imageUrl={imageUrl}
          imageLoaded={imageLoaded}
          setImageLoaded={setImageLoaded}
          aspectRatio={aspectRatio}
          outputFormat={outputFormat}
        />
      </div>
    </div>
  );
}

function PreviewPanel({
  loading,
  imageUrl,
  imageLoaded,
  setImageLoaded,
  aspectRatio,
  outputFormat,
}: {
  loading: boolean;
  imageUrl: string | null;
  imageLoaded: boolean;
  setImageLoaded: (v: boolean) => void;
  aspectRatio: string;
  outputFormat: string;
}) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-accent/20 bg-surface2 shadow-soft">
        <div className="flex items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
          <div>
            <div className="text-sm font-semibold text-text">Generating…</div>
            <div className="mt-1 text-xs text-muted">
              {aspectRatio} • {outputFormat.toUpperCase()}
            </div>
          </div>
          <div className="text-xs text-muted">Preview</div>
        </div>

        {/* glow + shimmer */}
        <div className="relative h-[420px] w-full">
          <div className="absolute inset-0 animate-pulse bg-surface2" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent animate-[shimmer_1.2s_infinite]" />
          <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(122,92,255,0.18)]" />
        </div>
      </div>
    );
  }

  // RESTORED: empty state with small round "logo"
  if (!imageUrl) {
    return (
      <div className="rounded-2xl border border-border bg-surface shadow-soft">
        <div className="border-b border-border p-4 sm:p-5">
          <div className="text-sm font-semibold text-text">Preview</div>
          <div className="mt-1 text-xs text-muted">
            {aspectRatio} • {outputFormat.toUpperCase()}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface2">
            <div className="flex h-[420px] flex-col items-center justify-center gap-3 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent border border-accent/25">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2l1.2 6.2L19 9.4l-5.8 1.2L12 17l-1.2-6.4L5 9.4l5.8-1.2L12 2z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="text-sm font-semibold text-text">No poster yet</div>
              <div className="max-w-[26rem] text-xs text-muted">
                Write a prompt, pick a style, then click <span className="text-text">Generate poster</span>.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-soft">
      <div className="flex items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
        <div>
          <div className="text-sm font-semibold text-text">Result</div>
          <div className="mt-1 text-xs text-muted">
            {aspectRatio} • {outputFormat.toUpperCase()}
          </div>
        </div>

        <a
          className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-surface2"
          href={imageUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open
        </a>
      </div>

      <div className="p-4 sm:p-5">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="poster"
            className={[
              "h-auto w-full object-cover",
              "transition duration-500 ease-out",
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]",
            ].join(" ")}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      </div>
    </div>
  );
}
