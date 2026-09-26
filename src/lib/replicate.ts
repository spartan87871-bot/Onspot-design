import Replicate from "replicate";

const FLUX_MODEL =
  (process.env.FLUX_MODEL as `${string}/${string}` | undefined) ??
  "black-forest-labs/flux-schnell";

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

  // Note: we deliberately use the low-level predictions API + wait() rather than
  // replicate.run() — in replicate-js 1.4.0, run() was observed to resolve with a
  // null output even on a successfully completed, image-producing prediction.
  let prediction = await replicate.predictions.create({
    model: FLUX_MODEL,
    input,
  });
  prediction = await replicate.wait(prediction);

  if (prediction.status !== "succeeded") {
    const detail =
      typeof prediction.error === "string" ? prediction.error : JSON.stringify(prediction.error);
    throw new Error(`Replicate prediction ${prediction.status}: ${detail}`);
  }

  const urls = normalizeOutputs(prediction.output);
  if (urls.length === 0) {
    throw new Error("Replicate returned no images");
  }
  return urls;
}
