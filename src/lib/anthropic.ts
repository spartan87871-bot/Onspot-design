import Anthropic from "@anthropic-ai/sdk";
import { toBase64Image } from "./image";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  if (!client) {
    client = new Anthropic({ apiKey: key });
  }
  return client;
}

export interface AskClaudeOptions {
  system: string;
  prompt: string;
  /** Base64 data URLs or remote image URLs to include as vision input. */
  images?: string[];
  maxTokens?: number;
}

async function buildContentBlocks(
  prompt: string,
  images: string[] = []
): Promise<Anthropic.MessageParam["content"]> {
  const imageBlocks = await Promise.all(
    images.map(async (src) => {
      const { mediaType, data } = await toBase64Image(src);
      return {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: mediaType as
            | "image/png"
            | "image/jpeg"
            | "image/webp"
            | "image/gif",
          data,
        },
      };
    })
  );
  return [...imageBlocks, { type: "text" as const, text: prompt }];
}

/** Sends a prompt (optionally with vision images) to Claude and returns the raw text response. */
export async function askClaudeText({
  system,
  prompt,
  images,
  maxTokens = 1024,
}: AskClaudeOptions): Promise<string> {
  const anthropic = getAnthropicClient();
  if (!anthropic) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const content = await buildContentBlocks(prompt, images);
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text content");
  }
  return textBlock.text;
}

/** Extracts the first well-formed JSON object/array found in a model response. */
function extractJson(text: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.search(/[[{]/);
  if (start === -1) {
    throw new Error("No JSON found in Claude response");
  }
  let depth = 0;
  let end = -1;
  const openChar = candidate[start];
  const closeChar = openChar === "{" ? "}" : "]";
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
  if (end === -1) {
    throw new Error("Unbalanced JSON in Claude response");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

/** Sends a prompt asking Claude to answer in JSON, and parses that JSON out of the response. */
export async function askClaudeJson<T>(options: AskClaudeOptions): Promise<T> {
  const text = await askClaudeText(options);
  return extractJson(text) as T;
}
