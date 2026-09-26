"use client";

import { useState } from "react";
import UploadDropzone from "@/components/UploadDropzone";
import ColorSwatchPicker from "@/components/ColorSwatchPicker";
import LoadingState from "@/components/LoadingState";
import ResultGrid from "@/components/ResultGrid";
import DemoBadge from "@/components/DemoBadge";
import ScoreDial from "@/components/ScoreDial";
import GarmentPreview from "@/components/GarmentPreview";
import type { BlockPrintFeasibility, NaturalDyeColor, RemnantIdea } from "@/lib/types";

const MOTIF_MESSAGES = [
  "Sketching motif ideas…",
  "Mixing the natural-dye palette…",
  "Laying out the block-print grid…",
  "Adding the finishing detail…",
];
const TILE_MESSAGES = ["Building the seamless repeat…", "Laying it out as fabric…"];
const FEASIBILITY_MESSAGES = [
  "Checking line thickness for carving…",
  "Counting the blocks and colours…",
  "Estimating detail level…",
];
const REMNANT_MESSAGES = ["Thinking up remnant ideas…"];
const GARMENT_PHOTO_MESSAGES = [
  "Cutting and stitching the sample…",
  "Photographing it studio-style…",
  "Getting the drape right…",
];

export default function BlockPrintStudioPage() {
  const [prompt, setPrompt] = useState("");
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [colors, setColors] = useState<NaturalDyeColor[]>(["indigo"]);

  const [motifs, setMotifs] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genDemo, setGenDemo] = useState(false);
  const [genNote, setGenNote] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const [tile, setTile] = useState<string | null>(null);
  const [tileLoading, setTileLoading] = useState(false);
  const [tileDemo, setTileDemo] = useState(false);
  const [tileNote, setTileNote] = useState<string | undefined>();
  const [garment, setGarment] = useState<"kurta" | "coord">("kurta");

  const [garmentPhotos, setGarmentPhotos] = useState<string[] | null>(null);
  const [garmentPhotoLoading, setGarmentPhotoLoading] = useState(false);
  const [garmentPhotoDemo, setGarmentPhotoDemo] = useState(false);
  const [garmentPhotoNote, setGarmentPhotoNote] = useState<string | undefined>();

  const [feasibility, setFeasibility] = useState<BlockPrintFeasibility | null>(null);
  const [feasibilityLoading, setFeasibilityLoading] = useState(false);

  const [remnants, setRemnants] = useState<RemnantIdea[] | null>(null);
  const [remnantsLoading, setRemnantsLoading] = useState(false);
  const [remnantsDemo, setRemnantsDemo] = useState(false);
  const [remnantsNote, setRemnantsNote] = useState<string | undefined>();

  function selectMotif(i: number) {
    setSelected(i);
    setTile(null);
    setFeasibility(null);
    setRemnants(null);
    setGarmentPhotos(null);
  }

  function selectGarment(g: "kurta" | "coord") {
    setGarment(g);
    setGarmentPhotos(null);
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
    setGarmentPhotos(null);
    try {
      const res = await fetch("/api/blockprint/motifs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, colors, referenceImages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setMotifs(data.images);
      setGenDemo(Boolean(data.demo));
      setGenNote(data.note);
    } catch {
      setError("Something went wrong generating motifs. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function runTile() {
    if (selected === null || !motifs) return;
    setTileLoading(true);
    setTile(null);
    try {
      const res = await fetch("/api/blockprint/tile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motifImageUrl: motifs[selected], colors }),
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

  async function runGarmentPhoto() {
    if (selected === null || !motifs) return;
    setGarmentPhotoLoading(true);
    setGarmentPhotos(null);
    try {
      const res = await fetch("/api/blockprint/garment-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motifDescription: prompt, colors, garment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGarmentPhotos(data.images);
      setGarmentPhotoDemo(Boolean(data.demo));
      setGarmentPhotoNote(data.note);
    } catch {
      setError("Couldn't generate the photorealistic preview. Please try again.");
    } finally {
      setGarmentPhotoLoading(false);
    }
  }

  async function runFeasibility() {
    if (selected === null || !motifs) return;
    setFeasibilityLoading(true);
    setFeasibility(null);
    try {
      const res = await fetch("/api/blockprint/feasibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: motifs[selected] }),
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
        Describe a motif, or upload prints you like, pick a natural-dye palette, and
        we&rsquo;ll generate four motif ideas — ready to turn into a seamless fabric repeat
        and check for hand block-carving feasibility.
      </p>

      <div className="grid lg:grid-cols-[380px_1fr] gap-8 mt-10">
        <div className="space-y-6">
          <div>
            <label htmlFor="bp-prompt" className="text-sm font-medium text-ink mb-2 block">
              Describe the motif
            </label>
            <textarea
              id="bp-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g. "a small paisley booti, spaced in a diagonal grid"'
              rows={3}
              className="w-full rounded-2xl border hairline bg-cream px-4 py-3 text-ink placeholder:text-ink-soft/70 focus:outline-none focus:ring-2 focus:ring-indigo/40 resize-none"
            />
          </div>

          <UploadDropzone
            images={referenceImages}
            onChange={setReferenceImages}
            max={3}
            label="Upload up to 3 reference prints"
          />

          <ColorSwatchPicker value={colors} onChange={setColors} />

          {error && <p className="text-sm text-madder">{error}</p>}

          <button
            type="button"
            onClick={runGenerate}
            disabled={generating}
            className="w-full inline-flex items-center justify-center rounded-full bg-indigo text-cream px-6 py-3.5 font-medium hover:bg-indigo-dark transition-colors disabled:opacity-60"
          >
            {generating ? "Generating…" : motifs ? "Regenerate motifs" : "Generate motif ideas"}
          </button>
        </div>

        <div className="space-y-6">
          {generating && <LoadingState messages={MOTIF_MESSAGES} />}

          {!generating && motifs && (
            <div className="space-y-6">
              {genDemo && <DemoBadge note={genNote} />}
              <ResultGrid images={motifs} selected={selected} onSelect={selectMotif} labelPrefix="Motif" />

              {selected !== null && (
                <div className="rounded-3xl border hairline bg-paper p-6 space-y-6">
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={runTile}
                      disabled={tileLoading}
                      className="inline-flex items-center justify-center rounded-full bg-indigo text-cream px-5 py-2.5 font-medium hover:bg-indigo-dark transition-colors disabled:opacity-60"
                    >
                      {tileLoading ? "Building tile…" : "Turn into seamless repeat"}
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
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-ink">Garment preview</p>
                            <div className="flex gap-1 rounded-full bg-cream border hairline p-0.5">
                              {(["kurta", "coord"] as const).map((g) => (
                                <button
                                  key={g}
                                  type="button"
                                  onClick={() => selectGarment(g)}
                                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                    garment === g ? "bg-indigo text-cream" : "text-ink-soft"
                                  }`}
                                >
                                  {g === "kurta" ? "Kurta" : "Co-ord set"}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="rounded-2xl border hairline bg-cream flex items-center justify-center p-4 aspect-square">
                            <GarmentPreview tileUrl={tile} garment={garment} className="h-full w-auto" />
                          </div>
                          <p className="text-xs text-ink-soft mt-1.5">
                            Instant concept mockup — always available, never fails.
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 pt-5 border-t hairline">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div>
                            <p className="text-sm font-medium text-ink">
                              Want to see it as a real photo?
                            </p>
                            <p className="text-xs text-ink-soft mt-0.5">
                              Generates an actual studio product photo of the {garment === "kurta" ? "kurta" : "co-ord set"} in this print — takes longer, uses live AI.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={runGarmentPhoto}
                            disabled={garmentPhotoLoading}
                            className="inline-flex items-center justify-center rounded-full bg-gold text-cream px-5 py-2.5 font-medium hover:opacity-90 transition-opacity disabled:opacity-60 shrink-0"
                          >
                            {garmentPhotoLoading ? "Generating…" : "Generate real photo"}
                          </button>
                        </div>

                        {garmentPhotoLoading && <LoadingState messages={GARMENT_PHOTO_MESSAGES} compact />}

                        {garmentPhotos && !garmentPhotoLoading && garmentPhotos.length === 0 && (
                          <div className="mt-3">
                            <DemoBadge note={garmentPhotoNote} />
                          </div>
                        )}

                        {garmentPhotos && !garmentPhotoLoading && garmentPhotos.length > 0 && (
                          <div className="mt-4">
                            {garmentPhotoDemo && (
                              <div className="mb-3">
                                <DemoBadge note={garmentPhotoNote} />
                              </div>
                            )}
                            <div className="grid sm:grid-cols-2 gap-4">
                              {garmentPhotos.map((src, i) => (
                                <div key={i} className="rounded-2xl overflow-hidden border hairline aspect-[3/4]">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={src}
                                    alt={`Photorealistic ${garment} preview ${i + 1}`}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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

          {!generating && !motifs && (
            <div className="rounded-3xl border-2 border-dashed hairline flex items-center justify-center h-full min-h-[320px] text-ink-soft text-sm p-8 text-center">
              Your four motif ideas will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
