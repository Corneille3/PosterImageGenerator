"use client";

import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

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
  { value: "1:1", label: "Square" },
  { value: "16:9", label: "Wide" },
] as const;

const OUTPUT_FORMATS = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
] as const;

type AspectRatio = (typeof ASPECT_RATIOS)[number]["value"];
type OutputFormat = (typeof OUTPUT_FORMATS)[number]["value"];

type TabId = "prompt" | "presets" | "style" | "options";

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition",
        active
          ? "bg-accent/15 text-accent border border-accent/25"
          : "bg-surface text-text border border-border hover:bg-surface2",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StylePreviewBadge({ id }: { id: string }) {
  const map: Record<
    string,
    { top: string; mid: string; bottom: string; tag: string }
  > = {
    cinematic: {
      top: "bg-gradient-to-r from-accent/35 via-accent/10 to-transparent",
      mid: "bg-gradient-to-b from-white/10 to-transparent",
      bottom: "bg-gradient-to-t from-black/35 to-transparent",
      tag: "CINEMA",
    },
    noir: {
      top: "bg-gradient-to-r from-white/10 via-transparent to-white/5",
      mid: "bg-gradient-to-b from-black/20 to-transparent",
      bottom: "bg-gradient-to-t from-black/45 to-transparent",
      tag: "NOIR",
    },
    animation: {
      top: "bg-gradient-to-r from-accent/25 via-white/10 to-accent/10",
      mid: "bg-gradient-to-b from-white/12 to-transparent",
      bottom: "bg-gradient-to-t from-black/25 to-transparent",
      tag: "KIDS",
    },
    horror: {
      top: "bg-gradient-to-r from-black/40 via-white/5 to-transparent",
      mid: "bg-gradient-to-b from-black/30 to-transparent",
      bottom: "bg-gradient-to-t from-black/55 to-transparent",
      tag: "HORROR",
    },
  };

  const v = map[id] ?? map.cinematic;

  return (
    <div className="relative h-16 overflow-hidden rounded-xl border border-border bg-surface2">
      <div className={["absolute inset-0", v.top].join(" ")} />
      <div className={["absolute inset-0", v.mid].join(" ")} />
      <div className={["absolute inset-0", v.bottom].join(" ")} />
      <div className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-2 py-1 text-[10px] font-semibold text-text backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(168,85,247,0.55)]" />
        {v.tag}
      </div>
      <div className="absolute bottom-2 right-2 text-[10px] text-muted">
        preview
      </div>
    </div>
  );
}

function StyleCard({
  name,
  blurb,
  previewId,
  selected,
  onClick,
}: {
  name: string;
  blurb: string;
  previewId: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "text-left rounded-2xl border bg-surface p-4 transition",
        "hover:bg-surface2 active:scale-[0.99]",
        "focus:outline-none focus:ring-2 focus:ring-accent/35",
        selected
          ? "border-accent/40 bg-accent/10 shadow-[0_10px_30px_rgba(168,85,247,0.12)]"
          : "border-border",
      ].join(" ")}
    >
      <StylePreviewBadge id={previewId} />

      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="font-semibold text-text">{name}</div>
        {selected ? (
          <span className="text-xs rounded-full border border-accent/30 bg-accent/15 px-2 py-1 text-accent">
            Selected
          </span>
        ) : null}
      </div>

      <div className="mt-1 text-xs text-muted">{blurb}</div>

      <div className="mt-3 inline-flex items-center gap-2 text-xs text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-accent/70" />
        Adds “Style:” to prompt
      </div>
    </button>
  );
}

function PresetPreviewBadge({ label }: { label: string }) {
  // deterministic-ish “category” from label keywords
  const lower = label.toLowerCase();
  const key =
    lower.includes("noir") || lower.includes("thriller")
      ? "noir"
      : lower.includes("horror")
      ? "horror"
      : lower.includes("kids") || lower.includes("animation")
      ? "animation"
      : lower.includes("safari") || lower.includes("savanna") || lower.includes("tribal")
      ? "savanna"
      : "cinematic";

  const map: Record<
    string,
    { top: string; mid: string; bottom: string; tag: string }
  > = {
    cinematic: {
      top: "bg-gradient-to-r from-accent/30 via-accent/10 to-transparent",
      mid: "bg-gradient-to-b from-white/10 to-transparent",
      bottom: "bg-gradient-to-t from-black/35 to-transparent",
      tag: "PRESET",
    },
    noir: {
      top: "bg-gradient-to-r from-white/10 via-transparent to-white/5",
      mid: "bg-gradient-to-b from-black/20 to-transparent",
      bottom: "bg-gradient-to-t from-black/50 to-transparent",
      tag: "NOIR",
    },
    animation: {
      top: "bg-gradient-to-r from-accent/25 via-white/12 to-accent/10",
      mid: "bg-gradient-to-b from-white/14 to-transparent",
      bottom: "bg-gradient-to-t from-black/25 to-transparent",
      tag: "KIDS",
    },
    horror: {
      top: "bg-gradient-to-r from-black/45 via-white/6 to-transparent",
      mid: "bg-gradient-to-b from-black/25 to-transparent",
      bottom: "bg-gradient-to-t from-black/60 to-transparent",
      tag: "HORROR",
    },
    savanna: {
      top: "bg-gradient-to-r from-accent/18 via-white/10 to-transparent",
      mid: "bg-gradient-to-b from-white/10 to-transparent",
      bottom: "bg-gradient-to-t from-black/35 to-transparent",
      tag: "SAVANNA",
    },
  };

  const v = map[key];

  return (
    <div className="relative h-16 overflow-hidden rounded-xl border border-border bg-surface2">
      <div className={["absolute inset-0", v.top].join(" ")} />
      <div className={["absolute inset-0", v.mid].join(" ")} />
      <div className={["absolute inset-0", v.bottom].join(" ")} />
      <div className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-2 py-1 text-[10px] font-semibold text-text backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(168,85,247,0.45)]" />
        {v.tag}
      </div>
      <div className="absolute bottom-2 right-2 text-[10px] text-muted">
        preset
      </div>
    </div>
  );
}

function PresetCard({
  label,
  prompt,
  onUse,
}: {
  label: string;
  prompt: string;
  onUse: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onUse}
      className={[
        "rounded-2xl border border-border bg-surface p-4 text-left transition",
        "hover:bg-surface2 active:scale-[0.99]",
        "focus:outline-none focus:ring-2 focus:ring-accent/35",
      ].join(" ")}
    >
      <PresetPreviewBadge label={label} />

      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="font-semibold text-text">{label}</div>
        <span className="text-xs rounded-full border border-border bg-surface2 px-2 py-1 text-muted">
          Use
        </span>
      </div>

      <div className="mt-2 line-clamp-3 text-xs text-muted">{prompt}</div>

      <div className="mt-3 inline-flex items-center gap-2 text-xs text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-accent/70" />
        Fills prompt
      </div>
    </button>
  );
}

export default function GeneratePoster() {
  const { status } = useSession();

  const [prompt, setPrompt] = useState("");
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);

  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("png");

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<TabId>("prompt");
  const [presetQuery, setPresetQuery] = useState("");

  const selectedStyle = useMemo(() => {
    if (!selectedStyleId) return null;
    return STYLES.find((s) => s.id === selectedStyleId) ?? null;
  }, [selectedStyleId]);

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

  const filteredPresets = useMemo(() => {
    const q = presetQuery.trim().toLowerCase();
    if (!q) return PRESETS;
    return PRESETS.filter(
      (p) =>
        p.label.toLowerCase().includes(q) || p.prompt.toLowerCase().includes(q)
    );
  }, [presetQuery]);

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
      setActiveTab("prompt");
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

  const setPresetIntoPrompt = (presetPrompt: string) => {
    setPrompt(presetPrompt);
    setActiveTab("prompt");
  };

  return (
  <>
    <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr] lg:items-start">
      {/* LEFT: controls panel */}
      <div className="rounded-3xl border border-border bg-surface/70 shadow-soft backdrop-blur">
        <div className="border-b border-border p-4 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-text">
            Generate a poster
          </h2>
          <p className="mt-1 text-sm text-muted">
            Describe a scene, mood, and style — we’ll turn it into a cinematic
            movie poster.
          </p>

          {/* Tabs */}
          <div className="mt-4 flex flex-wrap gap-2">
            <TabButton
              active={activeTab === "prompt"}
              onClick={() => setActiveTab("prompt")}
            >
              Prompt
            </TabButton>
            <TabButton
              active={activeTab === "presets"}
              onClick={() => setActiveTab("presets")}
            >
              Presets
            </TabButton>
            <TabButton
              active={activeTab === "style"}
              onClick={() => setActiveTab("style")}
            >
              Style
            </TabButton>
            <TabButton
              active={activeTab === "options"}
              onClick={() => setActiveTab("options")}
            >
              Options
            </TabButton>
          </div>
        </div>

        {/* Body: bottom padding so mobile sticky bar doesn't cover content */}
        <div className="grid gap-4 p-4 pb-28 sm:p-6 sm:pb-32 lg:pb-6">
          {/* Error banner */}
          {error ? (
            <div className="rounded-2xl border border-danger/25 bg-danger/10 p-4">
              <div className="text-sm font-semibold text-text">
                Something went wrong
              </div>
              <div className="mt-1 text-sm text-muted">{error}</div>
            </div>
          ) : null}

          {/* Auth hint */}
          {status !== "authenticated" ? (
            <div className="rounded-2xl border border-border bg-surface2 p-4 text-sm text-muted">
              Sign in to generate posters and track your history.
            </div>
          ) : null}

          {/* TAB: PROMPT */}
          {activeTab === "prompt" ? (
            <div className="grid gap-4">
              <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft sm:p-5">
                <label className="text-sm font-medium text-text">Prompt</label>

                {/* ✅ Selected style chip */}
                {selectedStyle ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
                      <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgba(168,85,247,0.55)]" />
                      Style: {selectedStyle.name}
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("style")}
                      className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text hover:bg-surface2 transition"
                    >
                      Change
                    </button>

                    <button
                      type="button"
                      onClick={clearStyle}
                      className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-muted">No style selected.</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("style")}
                      className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text hover:bg-surface2 transition"
                    >
                      Pick a style
                    </button>
                  </div>
                )}

                <div className="mt-3">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder='Example: "A lone astronaut walking through neon rain on a cyberpunk street, dramatic lighting, cinematic"'
                    className="min-h-[150px] w-full resize-none rounded-2xl border border-border bg-surface2 px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={copyPrompt}
                    disabled={!prompt.trim()}
                    className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-surface2 disabled:opacity-50"
                  >
                    Copy prompt
                  </button>

                  <span className="text-xs text-muted">
                    Tip: add genre + mood + lighting for best results.
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* TAB: PRESETS */}
          {activeTab === "presets" ? (
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft sm:p-5">
              <div>
                <div className="text-sm font-semibold text-text">Presets</div>
                <div className="mt-1 text-xs text-muted">
                  Search and tap a preset to fill your prompt.
                </div>
              </div>

              <div className="mt-4">
                <input
                  value={presetQuery}
                  onChange={(e) => setPresetQuery(e.target.value)}
                  placeholder="Search presets… (e.g., sci-fi, noir, safari)"
                  className="w-full rounded-2xl border border-border bg-surface2 px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPresets.map((p) => (
                  <PresetCard
                    key={p.id}
                    label={p.label}
                    prompt={p.prompt}
                    onUse={() => setPresetIntoPrompt(p.prompt)}
                  />
                ))}
              </div>

              {filteredPresets.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-border bg-surface2 p-4 text-sm text-muted">
                  No presets found. Try another search.
                </div>
              ) : null}
            </div>
          ) : null}

          {/* TAB: STYLE */}
          {activeTab === "style" ? (
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-text">Style</div>
                  <div className="mt-1 text-xs text-muted">
                    Pick a look — it will append a “Style:” hint to your prompt.
                  </div>
                </div>

                {selectedStyleId ? (
                  <button
                    type="button"
                    onClick={clearStyle}
                    className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition"
                  >
                    ✕ Clear
                  </button>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {STYLES.map((s) => (
                  <StyleCard
                    key={s.id}
                    name={s.name}
                    blurb={s.blurb}
                    previewId={s.id}
                    selected={selectedStyleId === s.id}
                    onClick={() => applyStyle(s.id)}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* TAB: OPTIONS */}
          {activeTab === "options" ? (
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-soft sm:p-5">
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
          ) : null}

          {/* Desktop-only actions (mobile uses sticky bar) */}
          <div className="hidden lg:block rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              {creditsRemaining !== null ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
                  <span className="text-sm text-muted">Credits</span>
                  <span className="text-sm font-semibold text-text">
                    {creditsRemaining}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-muted"> </div>
              )}

              <button
                type="button"
                onClick={generate}
                disabled={!canGenerate}
                className={[
                  "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white transition",
                  "bg-accent hover:bg-accent2 disabled:opacity-50",
                  "shadow-[0_10px_30px_rgba(168,85,247,0.25)]",
                ].join(" ")}
              >
                {loading ? "Generating poster…" : "Generate poster"}
              </button>
            </div>

            {creditsRemaining !== null && creditsRemaining <= 0 ? (
              <div className="mt-3 rounded-2xl border border-danger/25 bg-danger/10 p-4 text-sm text-muted">
                You’re out of credits. Check again in 24h for 10 more.
              </div>
            ) : null}
          </div>
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

    {/* Mobile sticky action bar (outside the grid) */}
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-border bg-[rgba(15,18,32,0.85)] backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-3">
        {/* Quick settings row (mobile) */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted">Ratio</span>
            <div className="inline-flex overflow-hidden rounded-xl border border-border bg-surface/40">
              {ASPECT_RATIOS.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setAspectRatio(a.value)}
                  className={[
                    "px-3 py-1.5 text-[11px] font-semibold transition",
                    aspectRatio === a.value
                      ? "bg-accent/20 text-accent"
                      : "text-text hover:bg-surface2/60",
                  ].join(" ")}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted">Format</span>
            <div className="inline-flex overflow-hidden rounded-xl border border-border bg-surface/40">
              {OUTPUT_FORMATS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setOutputFormat(f.value)}
                  className={[
                    "px-3 py-1.5 text-[11px] font-semibold transition",
                    outputFormat === f.value
                      ? "bg-accent/20 text-accent"
                      : "text-text hover:bg-surface2/60",
                  ].join(" ")}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          {creditsRemaining !== null ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
              <span className="text-sm text-muted">Credits</span>
              <span className="text-sm font-semibold text-text">
                {creditsRemaining}
              </span>
            </div>
          ) : (
            <div className="text-xs text-muted"> </div>
          )}

          <button
            type="button"
            onClick={generate}
            disabled={!canGenerate}
            className={[
              "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white transition",
              "bg-accent hover:bg-accent2 disabled:opacity-50",
              "shadow-[0_10px_30px_rgba(168,85,247,0.25)]",
              "min-w-[160px]",
            ].join(" ")}
          >
            {loading ? "Generating…" : "Generate"}
          </button>
        </div>

        {creditsRemaining !== null && creditsRemaining <= 0 ? (
          <div className="mt-2 rounded-2xl border border-danger/25 bg-danger/10 p-3 text-xs text-muted">
            You’re out of credits. Check again in 24h for 10 more.
          </div>
        ) : null}
      </div>
    </div>
  </>
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);

  const canInteract = Boolean(imageUrl) && !loading;

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const zoomIn = () => setZoom((z) => clamp(Number((z + 0.25).toFixed(2)), 1, 3));
  const zoomOut = () =>
    setZoom((z) => clamp(Number((z - 0.25).toFixed(2)), 1, 3));
  const rotateRight = () => setRotate((r) => (r + 90) % 360);
  const resetView = () => {
    setZoom(1);
    setRotate(0);
  };

  const openFullscreen = () => {
    if (!imageUrl) return;
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  // ESC closes fullscreen
  useEffect(() => {
    if (!isFullscreen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFullscreen();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-" || e.key === "_") zoomOut();
      if (e.key.toLowerCase() === "r") rotateRight();
      if (e.key === "0") resetView();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullscreen]);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-3xl border border-accent/20 bg-surface shadow-soft">
        <div className="flex items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
          <div>
            <div className="text-sm font-semibold text-text">Generating…</div>
            <div className="mt-1 text-xs text-muted">
              {aspectRatio} • {outputFormat.toUpperCase()}
            </div>
          </div>
          <div className="text-xs text-muted">Preview</div>
        </div>

        <div className="relative h-[420px] w-full bg-surface2">
          <div className="absolute inset-0 animate-pulse bg-surface2" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent animate-[shimmer_1.2s_infinite]" />
          <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(122,92,255,0.18)]" />
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="rounded-3xl border border-border bg-surface shadow-soft">
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
                Write a prompt, pick a style, then click{" "}
                <span className="text-text">Generate</span>.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-3xl border border-border bg-surface shadow-soft">
        <div className="flex items-center justify-between gap-3 border-b border-border p-4 sm:p-5">
          <div>
            <div className="text-sm font-semibold text-text">Result</div>
            <div className="mt-1 text-xs text-muted">
              {aspectRatio} • {outputFormat.toUpperCase()}
            </div>
          </div>

          {/* ✅ Rotate is now visible even without fullscreen */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={rotateRight}
              disabled={!canInteract}
              className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-surface2 disabled:opacity-50"
              title="Rotate 90°"
            >
              Rotate
            </button>

            <button
              type="button"
              onClick={resetView}
              disabled={!canInteract}
              className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-surface2 disabled:opacity-50"
              title="Reset view"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={openFullscreen}
              disabled={!canInteract}
              className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-surface2 disabled:opacity-50"
              title="Fullscreen"
            >
              Fullscreen
            </button>

            <a
              className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-surface2"
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              title="Open in new tab"
            >
              Open
            </a>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface2">
            <div
              className="inline-block w-full"
              style={{
                transform: `scale(${zoom}) rotate(${rotate}deg)`,
                transformOrigin: "center center",
                transition: "transform 120ms ease-out",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="poster"
                className={[
                  "h-auto w-full object-cover cursor-zoom-in",
                  "transition duration-500 ease-out",
                  imageLoaded ? "opacity-100" : "opacity-0",
                ].join(" ")}
                onLoad={() => setImageLoaded(true)}
                // ✅ mobile-friendly open
                onPointerUp={openFullscreen}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openFullscreen();
                }}
              />
            </div>
          </div>

          <div className="mt-3 text-xs text-muted">
            Tip: click/tap the image for fullscreen. Rotate works on this preview too.
          </div>
        </div>
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[300] bg-[rgba(3,5,10,0.82)]"
          role="dialog"
          aria-modal="true"
          aria-label="Poster preview"
          onClick={closeFullscreen}
        >
          <div
            className="relative mx-auto h-full w-full max-w-6xl px-4 py-4 sm:px-6 sm:py-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-border bg-[rgba(15,18,32,0.92)] px-3 py-3 backdrop-blur">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-text truncate">
                  Poster preview
                </div>
                <div className="mt-0.5 text-xs text-muted">
                  Zoom: {(zoom * 100).toFixed(0)}% • Rotate: {rotate}°
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={zoomOut}
                  className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-surface2"
                  title="Zoom out (-)"
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={zoomIn}
                  className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-surface2"
                  title="Zoom in (+)"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={rotateRight}
                  className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-surface2"
                  title="Rotate (R)"
                >
                  Rotate
                </button>
                <button
                  type="button"
                  onClick={resetView}
                  className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-surface2"
                  title="Reset (0)"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={closeFullscreen}
                  className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text hover:bg-surface2"
                  title="Close (Esc)"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex h-[calc(100%-72px)] items-center justify-center">
              <div className="max-h-full max-w-full overflow-hidden rounded-3xl border border-border bg-[rgba(15,18,32,0.6)] shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
                <div className="p-3 sm:p-4">
                  <div className="relative max-h-[78vh] max-w-[92vw] overflow-auto rounded-2xl bg-black/20">
                    <div
                      className="inline-block"
                      style={{
                        transform: `scale(${zoom}) rotate(${rotate}deg)`,
                        transformOrigin: "center center",
                        transition: "transform 120ms ease-out",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="poster fullscreen"
                        className="block h-auto w-full select-none"
                        draggable={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 text-center text-xs text-muted">
              Shortcuts: <span className="text-text">Esc</span> close •{" "}
              <span className="text-text">+</span>/<span className="text-text">-</span>{" "}
              zoom • <span className="text-text">R</span> rotate •{" "}
              <span className="text-text">0</span> reset
            </div>
          </div>
        </div>
      )}
    </>
  );
}

