import { NextRequest, NextResponse } from "next/server";
import { askClaudeText } from "@/lib/anthropic";
import { generateImages } from "@/lib/replicate";
import { getBlockprintMotifs, DEMO_NOTE_CALL_FAILED, DEMO_NOTE_NO_KEYS } from "@/lib/demo";
import { isSupportedImageDataUrl } from "@/lib/image";
import {
  BLOCKPRINT_VISION_SYSTEM,
  buildBlockPrintMotifPrompt,
  buildBlockPrintReferenceDescriptionPrompt,
} from "@/lib/prompts";
import { NATURAL_DYE_COLORS, type NaturalDyeColor } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  prompt?: string;
  colors?: string[];
  referenceImages?: string[];
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.slice(0, 800) : "";
  const colors = (Array.isArray(body.colors) ? body.colors : [])
    .filter((c): c is NaturalDyeColor => NATURAL_DYE_COLORS.includes(c as NaturalDyeColor))
    .slice(0, 3);
  const referenceImages = (Array.isArray(body.referenceImages) ? body.referenceImages : [])
    .filter(isSupportedImageDataUrl)
    .slice(0, 3);

  if (!prompt.trim() && referenceImages.length === 0) {
    return NextResponse.json(
      { error: "Provide a text prompt or at least one reference image" },
      { status: 400 }
    );
  }
  if (colors.length === 0) {
    return NextResponse.json({ error: "Pick 1-3 natural-dye colours" }, { status: 400 });
  }

  const hasKeys = Boolean(process.env.REPLICATE_API_TOKEN);

  try {
    let referenceNotes: string | undefined;
    if (referenceImages.length > 0 && process.env.ANTHROPIC_API_KEY) {
      try {
        referenceNotes = await askClaudeText({
          system: BLOCKPRINT_VISION_SYSTEM,
          prompt: buildBlockPrintReferenceDescriptionPrompt(referenceImages.length),
          images: referenceImages,
          maxTokens: 300,
        });
      } catch {
        // Non-fatal: continue without reference notes.
      }
    }

    const enrichedPrompt = buildBlockPrintMotifPrompt(prompt, colors, referenceNotes);
    const images = await generateImages({ prompt: enrichedPrompt, count: 4 });
    return NextResponse.json({ images, demo: false });
  } catch {
    return NextResponse.json({
      images: getBlockprintMotifs(),
      demo: true,
      note: hasKeys ? DEMO_NOTE_CALL_FAILED : DEMO_NOTE_NO_KEYS,
    });
  }
}
