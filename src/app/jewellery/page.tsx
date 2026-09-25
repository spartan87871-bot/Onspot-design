"use client";

import { useState } from "react";
import UploadDropzone from "@/components/UploadDropzone";
import OptionPills from "@/components/OptionPills";
import LoadingState from "@/components/LoadingState";
import ResultGrid from "@/components/ResultGrid";
import DemoBadge from "@/components/DemoBadge";
import ScoreDial from "@/components/ScoreDial";
import type { JewelleryFeasibility, JewelleryMetal, JewelleryStyle, JewelleryType } from "@/lib/types";

const TYPE_OPTIONS: { value: JewelleryType; label: string }[] = [
  { value: "necklace", label: "Necklace" },
  { value: "earrings", label: "Earrings" },
  { value: "bangle", label: "Bangle" },
  { value: "ring", label: "Ring" },
];

const METAL_OPTIONS: { value: JewelleryMetal; label: string }[] = [
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "oxidised", label: "Oxidised" },
];

const STYLE_OPTIONS: { value: JewelleryStyle; label: string }[] = [
  { value: "temple", label: "Temple" },
  { value: "kundan", label: "Kundan" },
  { value: "minimal", label: "Minimal" },
  { value: "polki", label: "Polki" },
];

const GENERATE_MESSAGES = [
  "Sketching design directions…",
  "Studying the reference photos…",
  "Rendering studio shots…",
  "Adding the finishing shine…",
];
const REFINE_MESSAGES = ["Applying your notes…", "Re-rendering the piece…", "Polishing the details…"];
const FEASIBILITY_MESSAGES = [
  "Weighing the metal…",
  "Checking the stone-setting method…",
  "Estimating manufacturing difficulty…",
];

export default function JewelleryStudioPage() {
  const [prompt, setPrompt] = useState("");
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [type, setType] = useState<JewelleryType>("necklace");
  const [metal, setMetal] = useState<JewelleryMetal>("gold");
  const [style, setStyle] = useState<JewelleryStyle>("temple");

  const [variations, setVariations] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genDemo, setGenDemo] = useState(false);
  const [genNote, setGenNote] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const [refinePrompt, setRefinePrompt] = useState("");
  const [refining, setRefining] = useState(false);

  const [feasibility, setFeasibility] = useState<JewelleryFeasibility | null>(null);
  const [feasibilityLoading, setFeasibilityLoading] = useState(false);

  async function runGenerate() {
    if (!prompt.trim() && referenceImages.length === 0) {
      setError("Add a short description or upload a reference photo to get started.");
      return;
    }
    setError(null);
    setGenerating(true);
    setFeasibility(null);
    setSelected(null);
    try {
      const res = await fetch("/api/jewellery/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type, metal, style, referenceImages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setVariations(data.images);
      setGenDemo(Boolean(data.demo));
      setGenNote(data.note);
    } catch {
      setError("Something went wrong generating designs. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function runFeasibility() {
    if (selected === null || !variations) return;
    setFeasibilityLoading(true);
    setFeasibility(null);
    try {
      const res = await fetch("/api/jewellery/feasibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: variations[selected], type, metal, style }),
      });
      const data = await res.json();
      setFeasibility(data);
    } catch {
      setError("Couldn't run the feasibility check. Please try again.");
    } finally {
      setFeasibilityLoading(false);
    }
  }

  async function runRefine() {
    if (selected === null || !variations || !refinePrompt.trim()) return;
    setRefining(true);
    try {
      const res = await fetch("/api/jewellery/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: variations[selected],
          followUpPrompt: refinePrompt,
          type,
          metal,
          style,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const updated = [...variations];
      updated[selected] = data.images[0];
      setVariations(updated);
      setGenDemo(Boolean(data.demo));
      setGenNote(data.note);
      setFeasibility(null);
      setRefinePrompt("");
    } catch {
      setError("Couldn't refine that design. Please try again.");
    } finally {
      setRefining(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-14">
      <p className="text-xs font-semibold tracking-widest uppercase text-gold">
        Fine jewellery
      </p>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mt-2">
        Jewellery Design Studio
      </h1>
      <p className="text-ink-soft mt-3 max-w-2xl">
        Describe what you&rsquo;re after, or upload a few pieces you like and tell us what to
        borrow from each. We&rsquo;ll generate four fresh concepts, then check if the one you
        pick can realistically be made.
      </p>

      <div className="grid lg:grid-cols-[380px_1fr] gap-8 mt-10">
        <div className="space-y-6">
          <div>
            <label htmlFor="prompt" className="text-sm font-medium text-ink mb-2 block">
              Describe the design
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g. "I like the jhumka shape from this one and the stones from that one, but simpler"'
              rows={3}
              className="w-full rounded-2xl border hairline bg-cream px-4 py-3 text-ink placeholder:text-ink-soft/70 focus:outline-none focus:ring-2 focus:ring-indigo/40 resize-none"
            />
          </div>

          <UploadDropzone
            images={referenceImages}
            onChange={setReferenceImages}
            max={3}
            label="Upload up to 3 reference photos"
          />

          <OptionPills label="Type" options={TYPE_OPTIONS} value={type} onChange={setType} />
          <OptionPills label="Metal" options={METAL_OPTIONS} value={metal} onChange={setMetal} />
          <OptionPills label="Style" options={STYLE_OPTIONS} value={style} onChange={setStyle} />

          {error && <p className="text-sm text-madder">{error}</p>}

          <button
            type="button"
            onClick={runGenerate}
            disabled={generating}
            className="w-full inline-flex items-center justify-center rounded-full bg-indigo text-cream px-6 py-3.5 font-medium hover:bg-indigo-dark transition-colors disabled:opacity-60"
          >
            {generating ? "Generating…" : variations ? "Regenerate designs" : "Generate designs"}
          </button>
        </div>

        <div>
          {generating && <LoadingState messages={GENERATE_MESSAGES} />}

          {!generating && variations && (
            <div className="space-y-6">
              {genDemo && <DemoBadge note={genNote} />}

              <ResultGrid images={variations} selected={selected} onSelect={setSelected} labelPrefix="Jewellery design" />

              {selected !== null && (
                <div className="rounded-3xl border hairline bg-paper p-6 space-y-6">
                  <div>
                    <label htmlFor="refine" className="text-sm font-medium text-ink mb-2 block">
                      Refine this design
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        id="refine"
                        value={refinePrompt}
                        onChange={(e) => setRefinePrompt(e.target.value)}
                        placeholder='e.g. "make the drops longer" or "add a floral border"'
                        className="flex-1 rounded-full border hairline bg-cream px-4 py-2.5 text-ink placeholder:text-ink-soft/70 focus:outline-none focus:ring-2 focus:ring-indigo/40"
                      />
                      <button
                        type="button"
                        onClick={runRefine}
                        disabled={refining || !refinePrompt.trim()}
                        className="inline-flex items-center justify-center rounded-full border-2 border-indigo text-indigo px-5 py-2.5 font-medium hover:bg-indigo hover:text-cream transition-colors disabled:opacity-50 shrink-0"
                      >
                        {refining ? "Refining…" : "Refine"}
                      </button>
                    </div>
                    {refining && <LoadingState messages={REFINE_MESSAGES} compact />}
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={runFeasibility}
                      disabled={feasibilityLoading}
                      className="inline-flex items-center justify-center rounded-full bg-terracotta text-cream px-5 py-2.5 font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-60"
                    >
                      {feasibilityLoading ? "Checking…" : "Can it be made?"}
                    </button>

                    {feasibilityLoading && <LoadingState messages={FEASIBILITY_MESSAGES} compact />}

                    {feasibility && !feasibilityLoading && (
                      <div className="mt-5 space-y-5">
                        {feasibility.demo && <DemoBadge note={feasibility.note} />}
                        <ScoreDial score={feasibility.feasibilityScore} />
                        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                          <div className="rounded-xl bg-cream border hairline p-4">
                            <dt className="text-ink-soft">Approx. metal weight</dt>
                            <dd className="text-ink font-medium mt-1">{feasibility.metalWeightRange}</dd>
                          </div>
                          <div className="rounded-xl bg-cream border hairline p-4">
                            <dt className="text-ink-soft">Stone-setting method</dt>
                            <dd className="text-ink font-medium mt-1">{feasibility.stoneSettingMethod}</dd>
                          </div>
                          <div className="rounded-xl bg-cream border hairline p-4 sm:col-span-2">
                            <dt className="text-ink-soft">Manufacturing difficulty</dt>
                            <dd className="text-ink font-medium mt-1">{feasibility.manufacturingDifficulty}</dd>
                          </div>
                        </dl>
                        <div>
                          <p className="text-sm font-medium text-ink mb-2">
                            Suggested changes to simplify
                          </p>
                          <ul className="space-y-2">
                            {feasibility.suggestedChanges.map((s, i) => (
                              <li key={i} className="flex gap-2.5 text-sm text-ink-soft">
                                <span className="text-gold mt-0.5">✦</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {!generating && !variations && (
            <div className="rounded-3xl border-2 border-dashed hairline flex items-center justify-center h-full min-h-[320px] text-ink-soft text-sm p-8 text-center">
              Your four design concepts will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
