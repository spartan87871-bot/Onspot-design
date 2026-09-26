import { NextRequest, NextResponse } from "next/server";
import { generateImages } from "@/lib/replicate";
import { buildGarmentPhotoPrompt, type BlockPrintGarment } from "@/lib/prompts";
import { NATURAL_DYE_COLORS, type NaturalDyeColor } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Body {
  motifDescription?: string;
  colors?: string[];
  garment?: string;
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
  const garment: BlockPrintGarment =
    body.garment === "coord" ? "coord" : body.garment === "top" ? "top" : "kurta";
  const motifDescription = (body.motifDescription || "a hand block-printed motif").slice(0, 300);

  if (colors.length === 0) {
    return NextResponse.json({ error: "Pick 1-3 natural-dye colours" }, { status: 400 });
  }

  const hasKeys = Boolean(process.env.REPLICATE_API_TOKEN);

  try {
    const prompt = buildGarmentPhotoPrompt(motifDescription, colors, garment);
    const images = await generateImages({ prompt, count: 2, aspectRatio: "3:4" });
    return NextResponse.json({ images, demo: false });
  } catch (err) {
    console.error("POST /api/blockprint/garment-photo failed:", err);
    return NextResponse.json({
      images: [],
      demo: true,
      note: hasKeys
        ? "Live photorealistic generation hit a snag — try again, or use the instant concept mockup above."
        : "Live AI generation isn't configured for this demo — see the instant concept mockup above instead.",
    });
  }
}
