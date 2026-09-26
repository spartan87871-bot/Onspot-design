"use client";

import { useState } from "react";
import UploadDropzone from "@/components/UploadDropzone";
import ColorSwatchPicker from "@/components/ColorSwatchPicker";
import OptionPills from "@/components/OptionPills";
import LoadingState from "@/components/LoadingState";
import ResultGrid from "@/components/ResultGrid";
import DemoBadge from "@/components/DemoBadge";
import ScoreDial from "@/components/ScoreDial";
import GarmentPreview from "@/components/GarmentPreview";
import type { BlockPrintGarment } from "@/lib/prompts";
import type { BlockPrintFeasibility, NaturalDyeColor, RemnantIdea } from "@/lib/types";

const GARMENT_OPTIONS: { value: BlockPrintGarment; label: string }[] = [
  { value: "kurta", label: "Kurta" },
  { value: "top", label: "Top / Tunic" },
  { value: "coord", label: "Co-ord set" },
];

const DESIGN_MESSAGES = [
  "Sketching design directions…",
  "Mixing the natural-dye palette…",
  "Cutting and printing the sample…",
  "Photographing it studio-style…",
];
const TILE_MESSAGES = ["Building the seamless repeat…", "Laying it out as fabric…"];
const FEASIBILITY_MESSAGES = [
  "Checking line thickness for carving…",
  "Counting the blocks and colours…",
  "Estimating detail level…",
];
const REMNANT_MESSAGES = ["Thinking up remnant ideas…"];

export default function BlockPrintStudioPage() {
  const [prompt, setPrompt] = useState("");
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [colors, setColors] = useState<NaturalDyeColor[]>(["indigo"]);
  const [garment, setGarment] = useState<BlockPrintGarment>("kurta");

  const [designs, setDesigns] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genDemo, setGenDemo] = useState(false);
  const [genNote, setGenNote] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const [tile, setTile] = useState<string | null>(null);
  const [tileLoading, setTileLoading] = useState(false);
  const [tileDemo, setTileDemo] = useState(false);
  const [tileNote, setTileNote] = useState<string | undefined>();

  const [feasibility, setFeasibility] = useState<BlockPrintFeasibility | null>(null);
  const [feasibilityLoading, setFeasibilityLoading] = useState(false);

  const [remnants, setRemnants] = useState<RemnantIdea[] | null>(null);
  const [remnantsLoading, setRemnantsLoading] = useState(false);
  const [remnantsDemo, setRemnantsDemo] = useState(false);
  const [remnantsNote, setRemnantsNote] = useState<string | undefined>();

  function selectDesign(i: number) {
    setSelected(i);
    setTile(null);
    setFeasibility(null);
    setRemnants(null);
  }

  async function runGenerate() {
    if (!prompt.trim() && referenceImages.length === 0) {
      setError("Add a short description or upload a reference photo to get started.");
      return;
    }
    if (colors.length === 0) {
      setError("Pick at least one natural-dye colour.");
      return;
    }
    setError(null);
    setGenerating(true);
    setSelected(null);
    setTile(null);
    setFeasibility(null);
    setRemnants(null);
    try {
      const res = await fetch("/api/blockprint/motifs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, colors, referenceImages, garment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setDesigns(data.images);
      setGenDemo(Boolean(data.demo));
      setGenNote(data.note);
    } catch {
      setError("Something went wrong generating designs. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function runTile() {
    if (selected === null || !designs) return;
    setTileLoading(true);
    setTile(null);
    try {
      const res = await fetch("/api/blockprint/tile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motifImageUrl: designs[selected], motifDescription: prompt, colors }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTile(data.images[0]);
      setTileDemo(Boolean(data.demo));
      setTileNote(data.note);
    } catch {
      setError("Couldn't build the seamless tile. Please try again.");
    } finally {
      setTileLoading(false);
    }
  }

  async function runFeasibility() {
    if (selected === null || !designs) return;
    setFeasibilityLoading(true);
    setFeasibility(null);
    try {
      const res = await fetch("/api/blockprint/feasibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: designs[selected] }),
      });
      const data = await res.json();
      setFeasibility(data);
    } catch {
      setError("Couldn't run the feasibility check. Please try again.");
    } finally {
      setFeasibilityLoading(false);
    }
  }

  async function runRemnants() {
    setRemnantsLoading(true);
    setRemnants(null);
    try {
      const res = await fetch("/api/blockprint/remnants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motifDescription: prompt }),
      });
      const data = await res.json();
      setRemnants(data.ideas);
      setRemnantsDemo(Boolean(data.demo));
      setRemnantsNote(data.note);
    } catch {
      setError("Couldn't fetch remnant ideas. Please try again.");
    } finally {
      setRemnantsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-14">
      <p className="text-xs font-semibold tracking-widest uppercase text-indigo">
        Hand block-printed cotton
      </p>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mt-2">
        Block-Print Studio
      </h1>
      <p className="text-ink-soft mt-3 max-w-2xl">
        Describe a print, or upload photos you like, pick a natural-dye palette, and
        we&rsquo;ll generate four design ideas — shown worn, ready to check for hand
        block-carving feasibility.
      </p>

      <div className="grid lg:grid-cols-[380px_1fr] gap-8 mt-10">
        <div className="space-y-6">
          <div>
            <label htmlFor="bp-prompt" className="text-sm font-medium text-ink mb-2 block">
              Describe the print (optional)
            </label>
            <textarea
              id="bp-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g. "a small paisley booti, spaced in a diagonal grid" — or leave blank and just upload photos'
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

          <ColorSwatchPicker value={colors} onChange={setColors} />

          <OptionPills label="Garment" options={GARMENT_OPTIONS} value={garment} onChange={setGarment} />

          {error && <p className="text-sm text-madder">{error}</p>}

          <button
            type="button"
            onClick={runGenerate}
            disabled={generating}
            className="w-full inline-flex items-center justify-center rounded-full bg-indigo text-cream px-6 py-3.5 font-medium hover:bg-indigo-dark transition-colors disabled:opacity-60"
          >
            {generating ? "Generating…" : designs ? "Regenerate designs" : "Generate design ideas"}
          </button>
        </div>

        <div className="space-y-6">
          {generating && <LoadingState messages={DESIGN_MESSAGES} />}

          {!generating && designs && (
            <div className="space-y-6">
              {genDemo && <DemoBadge note={genNote} />}
              <ResultGrid
                images={designs}
                selected={selected}
                onSelect={selectDesign}
                labelPrefix="Design"
                aspectClass="aspect-[3/4]"
              />

              {selected !== null && (
                <div className="rounded-3xl border hairline bg-paper p-6 space-y-6">
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={runTile}
                      disabled={tileLoading}
                      className="inline-flex items-center justify-center rounded-full bg-indigo text-cream px-5 py-2.5 font-medium hover:bg-indigo-dark transition-colors disabled:opacity-60"
                    >
                      {tileLoading ? "Building tile…" : "See print as flat fabric"}
                    </button>
                    <button
                      type="button"
                      onClick={runFeasibility}
                      disabled={feasibilityLoading}
                      className="inline-flex items-center justify-center rounded-full bg-terracotta text-cream px-5 py-2.5 font-medium hover:bg-terracotta-dark transition-colors disabled:opacity-60"
                    >
                      {feasibilityLoading ? "Checking…" : "Can it be block printed?"}
                    </button>
                    <button
                      type="button"
                      onClick={runRemnants}
                      disabled={remnantsLoading}
                      className="inline-flex items-center justify-center rounded-full border-2 border-gold text-gold px-5 py-2.5 font-medium hover:bg-gold hover:text-cream transition-colors disabled:opacity-60"
                    >
                      {remnantsLoading ? "Thinking…" : "Remnant fabric ideas"}
                    </button>
                  </div>

                  {tileLoading && <LoadingState messages={TILE_MESSAGES} compact />}

                  {tile && !tileLoading && (
                    <div>
                      {tileDemo && (
                        <div className="mb-3">
                          <DemoBadge note={tileNote} />
                        </div>
                      )}
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <p className="text-sm font-medium text-ink mb-2">Fabric repeat</p>
                          <div className="rounded-2xl overflow-hidden border hairline aspect-square">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={tile} alt="Seamless fabric tile" className="h-full w-full object-cover" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink mb-2">Instant concept mockup</p>
                          <div className="rounded-2xl border hairline bg-cream flex items-center justify-center p-4 aspect-square">
                            <GarmentPreview tileUrl={tile} garment={garment} className="h-full w-auto" />
                          </div>
                          <p className="text-xs text-ink-soft mt-1.5">
                            Flat vector mockup — always available, never fails.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {feasibilityLoading && <LoadingState messages={FEASIBILITY_MESSAGES} compact />}

                  {feasibility && !feasibilityLoading && (
                    <div className="space-y-5">
                      {feasibility.demo && <DemoBadge note={feasibility.note} />}
                      <ScoreDial score={feasibility.feasibilityScore} />
                      <dl className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div className="rounded-xl bg-cream border hairline p-4">
                          <dt className="text-ink-soft">Line thickness for carving</dt>
                          <dd className="text-ink font-medium mt-1">
                            {feasibility.lineThicknessOk ? "Safe to hand-carve" : "Too fine — needs simplifying"}
                          </dd>
                        </div>
                        <div className="rounded-xl bg-cream border hairline p-4">
                          <dt className="text-ink-soft">Detail level</dt>
                          <dd className="text-ink font-medium mt-1">{feasibility.detailLevel}</dd>
                        </div>
                        <div className="rounded-xl bg-cream border hairline p-4">
                          <dt className="text-ink-soft">Blocks needed</dt>
                          <dd className="text-ink font-medium mt-1">{feasibility.blocksNeeded}</dd>
                        </div>
                        <div className="rounded-xl bg-cream border hairline p-4">
                          <dt className="text-ink-soft">Colours needed</dt>
                          <dd className="text-ink font-medium mt-1">{feasibility.colorsNeeded}</dd>
                        </div>
                      </dl>
                      <div>
                        <p className="text-sm font-medium text-ink mb-2">Suggested simplifications</p>
                        <ul className="space-y-2">
                          {feasibility.suggestedSimplifications.map((s, i) => (
                            <li key={i} className="flex gap-2.5 text-sm text-ink-soft">
                              <span className="text-indigo mt-0.5">✦</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {remnantsLoading && <LoadingState messages={REMNANT_MESSAGES} compact />}

                  {remnants && !remnantsLoading && (
                    <div>
                      {remnantsDemo && (
                        <div className="mb-3">
                          <DemoBadge note={remnantsNote} />
                        </div>
                      )}
                      <p className="text-sm font-medium text-ink mb-3">
                        Ideas for leftover fabric remnants
                      </p>
                      <div className="grid sm:grid-cols-3 gap-3">
                        {remnants.map((idea) => (
                          <div key={idea.title} className="rounded-2xl bg-cream border hairline p-4">
                            <p className="font-display font-semibold text-ink">{idea.title}</p>
                            <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">
                              {idea.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!generating && !designs && (
            <div className="rounded-3xl border-2 border-dashed hairline flex items-center justify-center h-full min-h-[320px] text-ink-soft text-sm p-8 text-center">
              Your four design ideas will appear here, worn.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
