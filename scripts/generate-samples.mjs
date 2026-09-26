#!/usr/bin/env node
/**
 * One-off script: calls the real Replicate (FLUX) and Anthropic (Claude) APIs to
 * (re)generate the demo-mode sample assets in public/samples, and rewrites
 * public/samples/manifest.json to point at them.
 *
 * Run once, review the output, then commit the changed files under public/samples.
 * Without this script (or without API keys), the app ships with a committed set of
 * original placeholder SVG sketches so the demo still works out of the box.
 *
 * Usage:
 *   REPLICATE_API_TOKEN=... ANTHROPIC_API_KEY=... node scripts/generate-samples.mjs
 * or put both keys in .env.local and just run:
 *   node scripts/generate-samples.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Replicate from "replicate";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SAMPLES_DIR = path.join(ROOT, "public", "samples");

async function loadDotEnvLocal() {
  const file = path.join(ROOT, ".env.local");
  try {
    const text = await fs.readFile(file, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // .env.local is optional
  }
}

await loadDotEnvLocal();

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const FLUX_MODEL = process.env.FLUX_MODEL || "black-forest-labs/flux-schnell";
const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

if (!REPLICATE_TOKEN) {
  console.error("Missing REPLICATE_API_TOKEN — set it in .env.local or the environment.");
  process.exit(1);
}
if (!ANTHROPIC_KEY) {
  console.error("Missing ANTHROPIC_API_KEY — set it in .env.local or the environment.");
  process.exit(1);
}

const replicate = new Replicate({ auth: REPLICATE_TOKEN });
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

function normalizeOutputs(output) {
  if (output == null) return [];
  const arr = Array.isArray(output) ? output : [output];
  return arr
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item.url === "function") {
        const u = item.url();
        return typeof u === "string" ? u : u?.href ?? String(u);
      }
      if (item && typeof item === "object" && "url" in item) return String(item.url);
      return null;
    })
    .filter((u) => typeof u === "string" && u.length > 0);
}

async function generateImages(prompt, count = 1) {
  // Note: we use the low-level predictions API + wait() rather than replicate.run() —
  // in replicate-js 1.4.0, run() was observed to resolve with a null output even on a
  // successfully completed, image-producing prediction.
  let prediction = await replicate.predictions.create({
    model: FLUX_MODEL,
    input: {
      prompt,
      num_outputs: count,
      aspect_ratio: "1:1",
      output_format: "png",
      megapixel: "1",
    },
  });
  prediction = await replicate.wait(prediction);
  if (prediction.status !== "succeeded") {
    throw new Error(`Replicate prediction ${prediction.status}: ${JSON.stringify(prediction.error)}`);
  }
  const urls = normalizeOutputs(prediction.output);
  if (urls.length === 0) throw new Error("Replicate returned no images");
  return urls;
}

async function downloadTo(url, destAbsPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(destAbsPath), { recursive: true });
  await fs.writeFile(destAbsPath, buf);
}

async function urlToBase64(url) {
  const res = await fetch(url);
  const mediaType = res.headers.get("content-type") ?? "image/png";
  const buf = Buffer.from(await res.arrayBuffer());
  return { mediaType, data: buf.toString("base64") };
}

function extractJson(text) {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.search(/[[{]/);
  const openChar = candidate[start];
  const closeChar = openChar === "{" ? "}" : "]";
  let depth = 0;
  let end = -1;
  for (let i = start; i < candidate.length; i++) {
    if (candidate[i] === openChar) depth++;
    else if (candidate[i] === closeChar) {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

async function askClaudeJson(system, prompt, imageUrls, maxTokens = 600) {
  const images = await Promise.all(
    imageUrls.map(async (u) => {
      const { mediaType, data } = await urlToBase64(u);
      return { type: "image", source: { type: "base64", media_type: mediaType, data } };
    })
  );
  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: [...images, { type: "text", text: prompt }] }],
  });
  const textBlock = message.content.find((b) => b.type === "text");
  return extractJson(textBlock.text);
}

async function askClaudeJsonTextOnly(system, prompt, maxTokens = 400) {
  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: prompt }],
  });
  const textBlock = message.content.find((b) => b.type === "text");
  return extractJson(textBlock.text);
}

async function main() {
  console.log(`Using FLUX model: ${FLUX_MODEL}`);
  console.log(`Using Claude model: ${CLAUDE_MODEL}`);

  // ---------- Jewellery ----------
  console.log("\nGenerating jewellery variations…");
  const jewelleryBriefs = [
    "a handcrafted Indian necklace in gold, temple style craftsmanship, layered pendant with fine granulation",
    "a pair of handcrafted Indian jhumka earrings in gold, kundan style stone setting",
    "a handcrafted Indian bangle in oxidised silver, minimal style, thin clean band",
    "a handcrafted Indian statement ring in gold, polki style floral stone cluster",
  ];
  const jewelleryVariationUrls = [];
  for (let i = 0; i < jewelleryBriefs.length; i++) {
    const prompt = `Professional studio product photograph of a single ${jewelleryBriefs[i]}. Centered on a soft neutral backdrop, clean even studio lighting, sharp focus, high detail on metalwork and stone-setting, no text, no watermark, no human model, no brand markings, original design not based on any existing brand.`;
    const [url] = await generateImages(prompt, 1);
    jewelleryVariationUrls.push(url);
    const dest = path.join(SAMPLES_DIR, "jewellery", `variation-${i + 1}.png`);
    await downloadTo(url, dest);
    console.log(`  saved variation-${i + 1}.png`);
  }

  console.log("Generating refined jewellery sample…");
  const refinedPrompt = `Professional studio product photograph of a single handcrafted Indian necklace in gold, temple style craftsmanship, refined with longer hanging pearl drops and a wider dome base. Centered on a soft neutral backdrop, clean even studio lighting, sharp focus, high detail, no text, no watermark, no human model, no brand markings, original design not based on any existing brand.`;
  const [refinedUrl] = await generateImages(refinedPrompt, 1);
  await downloadTo(refinedUrl, path.join(SAMPLES_DIR, "jewellery", "refined-1.png"));
  console.log("  saved refined-1.png");

  console.log("Running jewellery feasibility check on variation-1…");
  const jewelleryFeasibility = await askClaudeJson(
    "You are a precise, practical jewellery manufacturing consultant. You always answer with strict JSON and nothing else.",
    `Look closely at this jewellery design image: a necklace in gold, temple style.
Act as an experienced Indian jewellery manufacturing consultant. Assess how feasible it is to produce by hand/small workshop methods.
Respond with ONLY a single JSON object (no markdown fences, no commentary) with exactly these keys:
{
  "feasibilityScore": number from 1-10 (10 = very easy to manufacture),
  "metalWeightRange": short string like "6 - 9 grams (22kt gold)",
  "stoneSettingMethod": short string naming the realistic setting technique,
  "manufacturingDifficulty": one of "Easy" | "Moderate" | "Difficult" | "Very difficult",
  "suggestedChanges": array of 2-4 short, concrete strings
}`,
    [jewelleryVariationUrls[0]]
  );

  // ---------- Block print ----------
  console.log("\nGenerating block-print motifs…");
  const motifBriefs = [
    { desc: "a traditional kairi paisley motif", colors: "deep natural indigo blue" },
    { desc: "a small repeating booti floral sprig", colors: "warm brick-toned madder red" },
    { desc: "a geometric diamond jaal lattice", colors: "iron-rust black (kali mitti) on natural off-white cotton" },
    { desc: "a leaf and vine buta motif", colors: "deep natural indigo blue and soft turmeric yellow" },
  ];
  const motifUrls = [];
  for (let i = 0; i < motifBriefs.length; i++) {
    const { desc, colors } = motifBriefs[i];
    const prompt = `Flat, top-down illustration of a single traditional Indian hand block-print textile motif, in the style of Bagru/Sanganeri natural-dye block printing on cotton: ${desc}. Using only these natural dye colours: ${colors}. Clean bold outlines suitable for hand-carved wood block printing, on a plain natural cotton background, no fabric folds, no text, no watermark, original motif not based on any existing brand.`;
    const [url] = await generateImages(prompt, 1);
    motifUrls.push(url);
    await downloadTo(url, path.join(SAMPLES_DIR, "blockprint", `motif-${i + 1}.png`));
    console.log(`  saved motif-${i + 1}.png`);
  }

  console.log("Generating seamless fabric tile from motif-1…");
  const tilePrompt = `A seamless, tileable, repeating pattern swatch of a traditional Indian hand block-print textile motif (${motifBriefs[0].desc}), using only these natural dye colours: ${motifBriefs[0].colors}. Flat top-down view as if photographing folded cotton fabric, edge-to-edge repeat with no visible seams, even lighting, no text, no watermark, no folds or wrinkles.`;
  const [tileUrl] = await generateImages(tilePrompt, 1);
  await downloadTo(tileUrl, path.join(SAMPLES_DIR, "blockprint", "tile-seamless.png"));
  console.log("  saved tile-seamless.png");

  console.log("Running block-print feasibility check on motif-1…");
  const blockprintFeasibility = await askClaudeJson(
    "You are a precise, practical hand block-print artisan and block carver. You always answer with strict JSON and nothing else.",
    `Look closely at this textile motif image. Act as an experienced hand block-print artisan / block carver in Rajasthan.
Assess how feasible this motif is to hand-carve into a wooden printing block and print accurately.
Respond with ONLY a single JSON object (no markdown fences, no commentary) with exactly these keys:
{
  "feasibilityScore": number from 1-10,
  "lineThicknessOk": boolean,
  "blocksNeeded": integer,
  "colorsNeeded": integer,
  "detailLevel": one of "Low" | "Medium" | "High" | "Very high",
  "suggestedSimplifications": array of 2-4 short, concrete strings
}`,
    [motifUrls[0]]
  );

  console.log("Generating remnant fabric product ideas…");
  const remnants = await askClaudeJsonTextOnly(
    "You are a resourceful textile-waste product designer. You always answer with strict JSON and nothing else.",
    `A block-print textile brand has leftover fabric remnants printed with a kairi paisley motif in indigo.
Suggest exactly 3 small, sellable products they could make from the leftover fabric scraps.
Respond with ONLY a JSON array of exactly 3 objects, each with keys:
{ "title": short product name (max 5 words), "description": one sentence, max 22 words }`
  );

  // ---------- Manifest ----------
  const manifest = {
    jewellery: {
      variations: [1, 2, 3, 4].map((n) => `/samples/jewellery/variation-${n}.png`),
      refined: "/samples/jewellery/refined-1.png",
      feasibility: jewelleryFeasibility,
    },
    blockprint: {
      motifs: [1, 2, 3, 4].map((n) => `/samples/blockprint/motif-${n}.png`),
      tile: "/samples/blockprint/tile-seamless.png",
      feasibility: blockprintFeasibility,
      remnants,
    },
  };

  await fs.writeFile(
    path.join(SAMPLES_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n"
  );
  console.log("\nWrote public/samples/manifest.json");
  console.log("Done. Review the new samples, then commit public/samples/.");
}

main().catch((err) => {
  console.error("\nSample generation failed:", err);
  process.exit(1);
});
