import { NextRequest, NextResponse } from "next/server";
import { generateImages } from "@/lib/replicate";
import { getJewelleryRefined, DEMO_NOTE_CALL_FAILED, DEMO_NOTE_NO_KEYS } from "@/lib/demo";
import { isUsableImageSource } from "@/lib/image";
import { buildJewelleryImagePrompt } from "@/lib/prompts";
import type { JewelleryMetal, JewelleryOptions, JewelleryStyle, JewelleryType } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const TYPES: JewelleryType[] = ["necklace", "earrings", "bangle", "ring"];
const METALS: JewelleryMetal[] = ["gold", "silver", "oxidised"];
const STYLES: JewelleryStyle[] = ["temple", "kundan", "minimal", "polki"];

interface Body {
  imageUrl?: string;
  followUpPrompt?: string;
  type?: string;
  metal?: string;
  style?: string;
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
  const followUpPrompt = typeof body.followUpPrompt === "string" ? body.followUpPrompt.slice(0, 500) : "";

  if (!followUpPrompt.trim()) {
    return NextResponse.json({ error: "Describe what to change" }, { status: 400 });
  }

  const options: JewelleryOptions = { type, metal, style };
  const hasKeys = Boolean(process.env.REPLICATE_API_TOKEN);
  const referenceImage = isUsableImageSource(body.imageUrl) ? body.imageUrl : undefined;

  try {
    const enrichedPrompt = buildJewelleryImagePrompt(followUpPrompt, options);
    const images = await generateImages({
      prompt: enrichedPrompt,
      count: 1,
      referenceImage,
      promptStrength: 0.55,
    });
    return NextResponse.json({ images, demo: false });
  } catch {
    return NextResponse.json({
      images: [getJewelleryRefined()],
      demo: true,
      note: hasKeys ? DEMO_NOTE_CALL_FAILED : DEMO_NOTE_NO_KEYS,
    });
  }
}
