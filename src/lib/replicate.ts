import Replicate from "replicate";

const FLUX_MODEL =
  (process.env.FLUX_MODEL as `${string}/${string}` | undefined) ??
  "black-forest-labs/flux-schnell";

// Kontext models take real reference-image pixels as input (not just a text description of
// them), so "mix the shape from this photo with the stones from that one" is literally true
// rather than a text paraphrase. single: one reference image. multi: exactly two.
const FLUX_KONTEXT_SINGLE_MODEL =
  (process.env.FLUX_KONTEXT_SINGLE_MODEL as `${string}/${string}` | undefined) ??
  "black-forest-labs/flux-kontext-pro";
const FLUX_KONTEXT_MULTI_MODEL =
  (process.env.FLUX_KONTEXT_MULTI_MODEL as `${string}/${string}` | undefined) ??
  "flux-kontext-apps/multi-image-kontext-pro";

let client: Replicate | null = null;

export function getReplicateClient(): Replicate | null {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return null;
  if (!client) {
    client = new Replicate({ auth: token });
  }
  return client;
}

/** Normalizes the various shapes replicate-js can return for file outputs into plain URL strings. */
function normalizeOutputs(output: unknown): string[] {
  if (output == null) return [];
  const arr = Array.isArray(output) ? output : [output];
  return arr
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const maybeUrlFn = (item as { url?: unknown }).url;
        if (typeof maybeUrlFn === "function") {
          const u = (maybeUrlFn as () => unknown).call(item);
          if (typeof u === "string") return u;
          if (u && typeof u === "object" && "href" in u) {
            return String((u as { href: string }).href);
          }
        }
        if ("url" in (item as Record<string, unknown>)) {
          return String((item as Record<string, unknown>).url);
        }
      }
      return null;
    })
    .filter((u): u is string => typeof u === "string" && u.length > 0);
}

/**
 * Runs a single Replicate prediction to completion and returns its output URLs.
 * Uses the low-level predictions API + wait() rather than replicate.run() — in
 * replicate-js 1.4.0, run() was observed to resolve with a null output even on a
 * successfully completed, image-producing prediction.
 */
async function runPrediction(
  replicate: Replicate,
  model: `${string}/${string}`,
  input: Record<string, unknown>
): Promise<string[]> {
  let prediction = await replicate.predictions.create({ model, input });
  prediction = await replicate.wait(prediction);

  if (prediction.status !== "succeeded") {
    const detail =
      typeof prediction.error === "string" ? prediction.error : JSON.stringify(prediction.error);
    throw new Error(`Replicate prediction ${prediction.status}: ${detail}`);
  }

  return normalizeOutputs(prediction.output);
}

export interface GenerateOptions {
  prompt: string;
  count?: number;
  aspectRatio?: string;
  /** Base64 data URL or remote URL used as an img2img reference/starting point. */
  referenceImage?: string;
  /** 0-1, only used when referenceImage is set. Higher = further from the reference. */
  promptStrength?: number;
}

/** Runs FLUX on Replicate and returns image URLs. Throws on any failure — callers fall back to demo mode. */
export async function generateImages({
  prompt,
  count = 4,
  aspectRatio = "1:1",
  referenceImage,
  promptStrength = 0.75,
}: GenerateOptions): Promise<string[]> {
  const replicate = getReplicateClient();
  if (!replicate) {
    throw new Error("REPLICATE_API_TOKEN is not configured");
  }

  const input: Record<string, unknown> = {
    prompt,
    num_outputs: count,
    aspect_ratio: aspectRatio,
    output_format: "png",
    megapixel: "1",
  };

  if (referenceImage) {
    input.image = referenceImage;
    input.prompt_strength = promptStrength;
  }

  const urls = await runPrediction(replicate, FLUX_MODEL, input);
  if (urls.length === 0) {
    throw new Error("Replicate returned no images");
  }
  return urls;
}

export interface GenerateWithReferencesOptions {
  prompt: string;
  /** 1-2 base64 data URLs or remote URLs, fed to the model as real pixels (not text). */
  referenceImages: string[];
  count?: number;
  aspectRatio?: string;
}

/**
 * Runs FLUX Kontext on Replicate, feeding 1-2 real reference images as pixel input
 * (via flux-kontext-pro for one image, or flux-kontext-apps/multi-image-kontext-pro for
 * two) rather than just describing them in text. Fires `count` predictions in parallel —
 * since Kontext models only ever return one image per call — and returns whichever ones
 * succeed. Throws only if every attempt fails, so callers fall back to demo mode.
 */
export async function generateImagesFromReferences({
  prompt,
  referenceImages,
  count = 4,
  aspectRatio = "1:1",
}: GenerateWithReferencesOptions): Promise<string[]> {
  const replicate = getReplicateClient();
  if (!replicate) {
    throw new Error("REPLICATE_API_TOKEN is not configured");
  }
  if (referenceImages.length === 0) {
    throw new Error("generateImagesFromReferences requires at least one reference image");
  }

  const [image1, image2] = referenceImages;
  const useMulti = Boolean(image2);
  const model = useMulti ? FLUX_KONTEXT_MULTI_MODEL : FLUX_KONTEXT_SINGLE_MODEL;
  const input: Record<string, unknown> = useMulti
    ? { prompt, input_image_1: image1, input_image_2: image2, aspect_ratio: aspectRatio, output_format: "png" }
    : { prompt, input_image: image1, aspect_ratio: aspectRatio, output_format: "png" };

  const attempts = await Promise.allSettled(
    Array.from({ length: count }, () => runPrediction(replicate, model, input))
  );

  const urls = attempts
    .filter((r): r is PromiseFulfilledResult<string[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);

  if (urls.length === 0) {
    const firstError = attempts.find((r): r is PromiseRejectedResult => r.status === "rejected");
    throw new Error(
      firstError ? String(firstError.reason) : "Replicate returned no images from any attempt"
    );
  }
  return urls;
}
