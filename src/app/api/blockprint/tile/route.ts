import { NextRequest, NextResponse } from "next/server";
import { generateImages } from "@/lib/replicate";
import { getBlockprintTile, DEMO_NOTE_CALL_FAILED, DEMO_NOTE_NO_KEYS } from "@/lib/demo";
import { isUsableImageSource } from "@/lib/image";
import { buildSeamlessTilePrompt } from "@/lib/prompts";
import { NATURAL_DYE_COLORS, type NaturalDyeColor } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  motifImageUrl?: string;
  motifDescription?: string;
  colors?: string[];
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const colors = (Array.isArray(body.colors) ? body.colors : [])
    .filter((c): c is NaturalDyeColor => NATURAL_DYE_COLORS.includes(c as NaturalDyeColor))
    .slice(0, 3);

  if (colors.length === 0) {
    return NextResponse.json({ error: "Pick 1-3 natural-dye colours" }, { status: 400 });
  }
  if (!body.motifImageUrl) {
    return NextResponse.json({ error: "motifImageUrl is required" }, { status: 400 });
  }

  const hasKeys = Boolean(process.env.REPLICATE_API_TOKEN);
  const referenceImage = isUsableImageSource(body.motifImageUrl) ? body.motifImageUrl : undefined;

  try {
    const prompt = buildSeamlessTilePrompt(
      body.motifDescription?.slice(0, 300) || "the chosen motif",
      colors
    );
    const images = await generateImages({
      prompt,
      count: 1,
      referenceImage,
      promptStrength: 0.65,
    });
    return NextResponse.json({ images, demo: false });
  } catch {
    return NextResponse.json({
      images: [getBlockprintTile()],
      demo: true,
      note: hasKeys ? DEMO_NOTE_CALL_FAILED : DEMO_NOTE_NO_KEYS,
    });
  }
}
