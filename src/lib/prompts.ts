import type { JewelleryOptions, NaturalDyeColor } from "./types";

export const JEWELLERY_VISION_SYSTEM = `You are a senior jewellery design consultant for an Indian fine-jewellery brand.
You look at reference photos a customer has uploaded and describe, in plain design language,
the specific elements worth borrowing from each one (silhouette, motif, stone pattern, texture, finish).
Be concrete and concise. Never mention brand names even if you recognise a piece — describe the design elements only.`;

export function buildJewelleryReferenceDescriptionPrompt(count: number): string {
  return `The customer uploaded ${count} reference photo(s) of jewellery they like, in order. These are very
likely ordinary product photos or website screenshots — possibly worn on a hand, ear, or neck, not a
plain studio flat-lay.
Ignore the person, skin, pose, background, and lighting entirely.
For each photo, write one short sentence naming ONLY the piece's design element worth reusing: its
silhouette, motif, stone pattern, or texture (e.g. "Photo 1: a domed temple-style jhumka silhouette with
a stepped tiered base"). If a photo shows no jewellery clearly, say so in one short clause instead of guessing.
Then write one final sentence combining the most compatible elements into a single coherent design
direction that could be redrawn as a new standalone piece.
Keep the whole answer under 80 words. Plain text, no markdown, no preamble.`;
}

export function buildJewelleryImagePrompt(
  userPrompt: string,
  options: JewelleryOptions,
  referenceNotes?: string
): string {
  const parts = [
    `Professional studio product photograph of a single handcrafted Indian ${options.type}`,
    `in ${options.metal} metal, ${options.style} style craftsmanship`,
    userPrompt.trim() ? `Design brief: ${userPrompt.trim()}.` : "",
    referenceNotes ? `Incorporate these reference elements: ${referenceNotes}` : "",
    "Centered on a soft neutral backdrop, clean even studio lighting, sharp focus, high detail on metalwork and stone-setting, no text, no watermark, no human model, no brand markings, original design not based on any existing brand.",
  ];
  return parts.filter(Boolean).join(" ");
}

/** For flux-kontext, which edits/combines the actual reference image(s) it's given rather than generating from a blank canvas. */
export function buildJewelleryKontextPrompt(
  userPrompt: string,
  options: JewelleryOptions,
  extraNotes?: string
): string {
  const parts = [
    `Using the reference photo(s) provided, design a new, original handcrafted Indian ${options.type} in ${options.metal} metal, ${options.style} style craftsmanship.`,
    userPrompt.trim() ? `Combine them like this: ${userPrompt.trim()}.` : "Blend the most distinctive elements of the references into one coherent new design.",
    extraNotes ? `Additional direction: ${extraNotes}` : "",
    "Result should read as a professional studio product photograph, centered on a soft neutral backdrop, clean even studio lighting, sharp focus, high detail on metalwork and stone-setting, no text, no watermark, no human model, no brand markings. This must be a new original design, not a copy of the reference or any existing brand's product.",
  ];
  return parts.filter(Boolean).join(" ");
}

export function buildJewelleryFeasibilityPrompt(
  options: JewelleryOptions
): string {
  return `Look closely at this jewellery design image: a ${options.type} in ${options.metal}, ${options.style} style.
Act as an experienced Indian jewellery manufacturing consultant. Assess how feasible it is to produce by hand/small workshop methods.
Respond with ONLY a single JSON object (no markdown fences, no commentary) with exactly these keys:
{
  "feasibilityScore": number from 1-10 (10 = very easy to manufacture),
  "metalWeightRange": short string like "6 - 9 grams (22kt gold)",
  "stoneSettingMethod": short string naming the realistic setting technique (e.g. "kundan foil setting", "prong setting", "bezel setting"),
  "manufacturingDifficulty": one of "Easy" | "Moderate" | "Difficult" | "Very difficult",
  "suggestedChanges": array of 2-4 short, concrete strings suggesting changes to make it easier or cheaper to produce
}`;
}

export function buildBlockPrintReferenceDescriptionPrompt(count: number): string {
  return `The customer uploaded ${count} reference photo(s) of a print they like. These are very likely
ordinary product photos or website screenshots — a model wearing a full kurta, dress, or co-ord set,
photographed from a distance, not a close-up fabric swatch.
Ignore the person, pose, garment silhouette, background, and lighting entirely.
For each photo, write one short sentence naming ONLY the printed motif/pattern itself: its shape,
repeat layout, and scale (e.g. "Photo 1: bold interlocking rounded-square lattice with a dotted circle
inside each square, large-scale repeat"). If a photo shows no usable print (plain fabric, or the print
isn't visible), say so in one short clause instead of guessing.
Then write one final sentence combining the most compatible elements into a single coherent motif
direction that could be redrawn as a flat, standalone illustration.
Keep the whole answer under 80 words. Plain text, no markdown, no preamble.`;
}

export const BLOCKPRINT_VISION_SYSTEM = `You are a senior textile print designer specializing in traditional Indian hand block printing (bagru/dabu/sanganeri style) on cotton.
You look at reference photos and describe, in plain design language, the specific motif or layout elements worth reusing.
Never mention brand names even if you recognise a print — describe the design elements only.`;

const DYE_COLOR_DESCRIPTIONS: Record<NaturalDyeColor, string> = {
  indigo: "deep natural indigo blue",
  "madder-red": "warm brick-toned madder red",
  "iron-black": "iron-rust black (kali mitti/iron-acetate black)",
  "turmeric-yellow": "soft natural turmeric yellow",
  "natural-off-white": "undyed natural off-white cotton base",
};

export function describeColors(colors: NaturalDyeColor[]): string {
  return colors.map((c) => DYE_COLOR_DESCRIPTIONS[c]).join(", ");
}

export function buildBlockPrintMotifPrompt(
  userPrompt: string,
  colors: NaturalDyeColor[],
  referenceNotes?: string
): string {
  const paletteDesc = describeColors(colors);
  const parts = [
    "Flat, top-down illustration of a single traditional Indian hand block-print textile motif,",
    "in the style of Bagru/Sanganeri natural-dye block printing on cotton,",
    `using only these natural dye colours: ${paletteDesc}.`,
    userPrompt.trim() ? `Design brief: ${userPrompt.trim()}.` : "",
    referenceNotes ? `Incorporate these reference elements: ${referenceNotes}` : "",
    "Clean bold outlines suitable for hand-carved wood block printing, on a plain natural cotton background, no fabric folds, no text, no watermark, original motif not based on any existing brand.",
  ];
  return parts.filter(Boolean).join(" ");
}

/** For flux-kontext, which edits/combines the actual reference image(s) it's given rather than generating from a blank canvas. */
export function buildBlockPrintKontextPrompt(
  userPrompt: string,
  colors: NaturalDyeColor[],
  extraNotes?: string
): string {
  const paletteDesc = describeColors(colors);
  const parts = [
    "Using the reference photo(s) provided, design a new, original traditional Indian hand block-print textile motif, in the style of Bagru/Sanganeri natural-dye block printing on cotton,",
    `using only these natural dye colours: ${paletteDesc}.`,
    userPrompt.trim() ? `Combine them like this: ${userPrompt.trim()}.` : "Blend the most distinctive elements of the references into one coherent new motif.",
    extraNotes ? `Additional direction: ${extraNotes}` : "",
    "Result should be a flat, top-down illustration with clean bold outlines suitable for hand-carved wood block printing, on a plain natural cotton background, no fabric folds, no text, no watermark. This must be a new original motif, not a copy of the reference or any existing brand's print.",
  ];
  return parts.filter(Boolean).join(" ");
}

export function buildSeamlessTilePrompt(
  motifDescription: string,
  colors: NaturalDyeColor[]
): string {
  const paletteDesc = describeColors(colors);
  return `A seamless, tileable, repeating pattern swatch of a traditional Indian hand block-print textile motif (${motifDescription}), using only these natural dye colours: ${paletteDesc}. Flat top-down view as if photographing folded cotton fabric, edge-to-edge repeat with no visible seams, even lighting, no text, no watermark, no folds or wrinkles.`;
}

export function buildGarmentPhotoPrompt(
  motifDescription: string,
  colors: NaturalDyeColor[],
  garment: "kurta" | "coord"
): string {
  const paletteDesc = describeColors(colors);
  const garmentDesc =
    garment === "kurta"
      ? "a relaxed A-line cotton kurta, mid-thigh length, front button placket, side pockets, worn over solid-coloured straight-leg pants"
      : "a co-ord set: a relaxed cropped top paired with matching wide-leg pants, both cut from the same fabric";
  return `Professional editorial fashion product photograph of a woman wearing ${garmentDesc}, made from 100% cotton hand block-printed fabric featuring a repeating motif (${motifDescription}), using only these natural dye colours: ${paletteDesc}. Plain neutral studio backdrop, soft natural daylight, relaxed candid standing pose, shot from the waist up to mid-thigh, sharp focus on the fabric print and texture, realistic fabric drape and folds, no visible face close-up needed, no text, no watermark, no logos, no brand markings, original garment not based on any existing brand.`;
}

export function buildBlockPrintFeasibilityPrompt(): string {
  return `Look closely at this textile motif image. Act as an experienced hand block-print artisan / block carver in Rajasthan.
Assess how feasible this motif is to hand-carve into a wooden printing block and print accurately.
Respond with ONLY a single JSON object (no markdown fences, no commentary) with exactly these keys:
{
  "feasibilityScore": number from 1-10 (10 = very easy to block print),
  "lineThicknessOk": boolean (true if line/detail thickness is safe for hand carving without the wood chipping),
  "blocksNeeded": integer, realistic number of separate wooden blocks needed (outline "rekh" block plus one "datta" block per fill colour),
  "colorsNeeded": integer, number of distinct print colours/passes needed,
  "detailLevel": one of "Low" | "Medium" | "High" | "Very high",
  "suggestedSimplifications": array of 2-4 short, concrete strings suggesting simplifications for easier hand carving/printing
}`;
}

export function buildRemnantIdeasPrompt(motifDescription: string): string {
  return `A block-print textile brand has leftover fabric remnants printed with this motif: ${motifDescription}.
Suggest exactly 3 small, sellable products they could make from the leftover fabric scraps (e.g. bags, pouches, textile jewellery, accessories).
Respond with ONLY a JSON array (no markdown fences, no commentary) of exactly 3 objects, each with keys:
{ "title": short product name (max 5 words), "description": one sentence, max 22 words }`;
}
