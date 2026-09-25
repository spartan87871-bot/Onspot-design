import { NextRequest, NextResponse } from "next/server";
import { askClaudeJson } from "@/lib/anthropic";
import { getJewelleryFeasibilitySample, DEMO_NOTE_CALL_FAILED, DEMO_NOTE_NO_KEYS } from "@/lib/demo";
import { buildJewelleryFeasibilityPrompt } from "@/lib/prompts";
import type {
  JewelleryFeasibility,
  JewelleryMetal,
  JewelleryOptions,
  JewelleryStyle,
  JewelleryType,
} from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const TYPES: JewelleryType[] = ["necklace", "earrings", "bangle", "ring"];
const METALS: JewelleryMetal[] = ["gold", "silver", "oxidised"];
const STYLES: JewelleryStyle[] = ["temple", "kundan", "minimal", "polki"];
const DIFFICULTIES = ["Easy", "Moderate", "Difficult", "Very difficult"];

interface Body {
  imageUrl?: string;
  type?: string;
  metal?: string;
  style?: string;
}

type ClaudeFeasibility = Omit<JewelleryFeasibility, "demo" | "note">;

function isValidFeasibility(v: unknown): v is ClaudeFeasibility {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.feasibilityScore === "number" &&
    typeof o.metalWeightRange === "string" &&
    typeof o.stoneSettingMethod === "string" &&
    typeof o.manufacturingDifficulty === "string" &&
    DIFFICULTIES.includes(o.manufacturingDifficulty as string) &&
    Array.isArray(o.suggestedChanges)
  );
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

  if (!body.imageUrl || typeof body.imageUrl !== "string") {
    return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
  }

  const options: JewelleryOptions = { type, metal, style };
  const hasKeys = Boolean(process.env.ANTHROPIC_API_KEY);

  try {
    const result = await askClaudeJson<unknown>({
      system:
        "You are a precise, practical jewellery manufacturing consultant. You always answer with strict JSON and nothing else.",
      prompt: buildJewelleryFeasibilityPrompt(options),
      images: [body.imageUrl],
      maxTokens: 600,
    });

    if (!isValidFeasibility(result)) {
      throw new Error("Malformed feasibility response");
    }

    const clamped: JewelleryFeasibility = {
      ...result,
      feasibilityScore: Math.max(1, Math.min(10, Math.round(result.feasibilityScore))),
      suggestedChanges: result.suggestedChanges.slice(0, 4).map(String),
      demo: false,
    };
    return NextResponse.json(clamped);
  } catch {
    const sample = getJewelleryFeasibilitySample();
    return NextResponse.json({
      ...sample,
      demo: true,
      note: hasKeys ? DEMO_NOTE_CALL_FAILED : DEMO_NOTE_NO_KEYS,
    });
  }
}
