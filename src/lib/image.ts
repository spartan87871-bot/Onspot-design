export interface Base64Image {
  mediaType: string;
  data: string;
}

/**
 * Splits a `data:image/png;base64,AAAA...` string into media type + payload.
 * Throws if the string is not a recognizable base64 data URL.
 */
export function parseDataUrl(dataUrl: string): Base64Image {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new Error("Expected a base64 image data URL");
  }
  return { mediaType: match[1], data: match[2] };
}

const ALLOWED_MEDIA_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

function hasSupportedImageMediaType(dataUrl: string): boolean {
  try {
    const { mediaType } = parseDataUrl(dataUrl);
    return ALLOWED_MEDIA_TYPES.has(mediaType);
  } catch {
    return false;
  }
}

export function isSupportedImageDataUrl(dataUrl: unknown): dataUrl is string {
  return typeof dataUrl === "string" && hasSupportedImageMediaType(dataUrl);
}

/** A data URL with a supported image type, or a remote http(s) URL — usable as an image source. */
export function isUsableImageSource(value: unknown): value is string {
  if (typeof value !== "string") return false;
  return hasSupportedImageMediaType(value) || value.startsWith("http://") || value.startsWith("https://");
}

/** Fetches a remote image (e.g. a Replicate output URL) and returns it as base64. */
export async function urlToBase64(url: string): Promise<Base64Image> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch image (${res.status})`);
  }
  const mediaType = res.headers.get("content-type") ?? "image/png";
  const buf = Buffer.from(await res.arrayBuffer());
  return { mediaType, data: buf.toString("base64") };
}

/** Accepts either a base64 data URL or a remote URL and normalizes to base64. */
export async function toBase64Image(source: string): Promise<Base64Image> {
  if (source.startsWith("data:")) {
    return parseDataUrl(source);
  }
  return urlToBase64(source);
}
