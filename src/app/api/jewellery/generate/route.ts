import { NextRequest, NextResponse } from "next/server";
import { askClaudeText } from "@/lib/anthropic";
import { generateImages } from "@/lib/replicate";
import { getJewelleryVariations, DEMO_NOTE_CALL_FAILED, DEMO_NOTE_NO_KEYS } from "@/lib/demo";
import { isSupportedImageDataUrl } from "@/lib/image";
import {
  buildJewelleryImagePrompt,
  buildJewelleryReferenceDescriptionPrompt,
  JEWELLERY_VISION_SYSTEM,
} from "@/lib/prompts";
import type { JewelleryMetal, JewelleryOptions, JewelleryStyle, JewelleryType } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const TYPES: JewelleryType[] = ["necklace", "earrings", "bangle", "ring"];
const METALS: JewelleryMetal[] = ["gold", "silver", "oxidised"];
const STYLES: JewelleryStyle[] = ["temple", "kundan", "minimal", "polki"];

interface Body {
  prompt?: string;
  type?: string;
  metal?: string;
  style?: string;
  referenceImages?: string[];
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const type = TYPES.includes(body.type as JewelleryType) ? (body.type as JewelleryType) : "necklace";
  const metal = METALS.includes(body.metal as JewelleryMetal) ? (body.metal as JewelleryMetal) : "gold";
  const style = STYLES.includes(body.style as JewelleryStyle) ? (body.style as JewelleryStyle) : "temple";
  const prompt = typeof body.prompt === "string" ? body.prompt.slice(0, 800) : "";
  const referenceImages = (Array.isArray(body.referenceImages) ? body.referenceImages : [])
    .filter(isSupportedImageDataUrl)
    .slice(0, 3);

  if (!prompt.trim() && referenceImages.length === 0) {
    return NextResponse.json(
      { error: "Provide a text prompt or at least one reference image" },
      { status: 400 }
    );
  }

  const options: JewelleryOptions = { type, metal, style };
  const hasKeys = Boolean(process.env.REPLICATE_API_TOKEN);

  try {
    let referenceNotes: string | undefined;
    if (referenceImages.length > 0 && process.env.ANTHROPIC_API_KEY) {
      try {
        referenceNotes = await askClaudeText({
          system: JEWELLERY_VISION_SYSTEM,
          prompt: buildJewelleryReferenceDescriptionPrompt(referenceImages.length),
          images: referenceImages,
          maxTokens: 300,
        });
      } catch {
        // Non-fatal: continue without reference notes.
      }
    }

    const enrichedPrompt = buildJewelleryImagePrompt(prompt, options, referenceNotes);
    const images = await generateImages({ prompt: enrichedPrompt, count: 4 });
    return NextResponse.json({ images, demo: false });
  } catch {
    return NextResponse.json({
      images: getJewelleryVariations(),
      demo: true,
      note: hasKeys ? DEMO_NOTE_CALL_FAILED : DEMO_NOTE_NO_KEYS,
    });
  }
}
