import { NextRequest, NextResponse } from "next/server";
import { askClaudeJson } from "@/lib/anthropic";
import { getBlockprintFeasibilitySample, DEMO_NOTE_CALL_FAILED, DEMO_NOTE_NO_KEYS } from "@/lib/demo";
import { buildBlockPrintFeasibilityPrompt } from "@/lib/prompts";
import type { BlockPrintFeasibility, DetailLevel } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const DETAIL_LEVELS: DetailLevel[] = ["Low", "Medium", "High", "Very high"];

interface Body {
  imageUrl?: string;
}

type ClaudeFeasibility = Omit<BlockPrintFeasibility, "demo" | "note">;

function isValidFeasibility(v: unknown): v is ClaudeFeasibility {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.feasibilityScore === "number" &&
    typeof o.lineThicknessOk === "boolean" &&
    typeof o.blocksNeeded === "number" &&
    typeof o.colorsNeeded === "number" &&
    typeof o.detailLevel === "string" &&
    DETAIL_LEVELS.includes(o.detailLevel as DetailLevel) &&
    Array.isArray(o.suggestedSimplifications)
  );
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.imageUrl || typeof body.imageUrl !== "string") {
    return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
  }

  const hasKeys = Boolean(process.env.ANTHROPIC_API_KEY);

  try {
    const result = await askClaudeJson<unknown>({
      system:
        "You are a precise, practical hand block-print artisan and block carver. You always answer with strict JSON and nothing else.",
      prompt: buildBlockPrintFeasibilityPrompt(),
      images: [body.imageUrl],
      maxTokens: 600,
    });

    if (!isValidFeasibility(result)) {
      throw new Error("Malformed feasibility response");
    }

    const clamped: BlockPrintFeasibility = {
      ...result,
      feasibilityScore: Math.max(1, Math.min(10, Math.round(result.feasibilityScore))),
      blocksNeeded: Math.max(1, Math.round(result.blocksNeeded)),
      colorsNeeded: Math.max(1, Math.round(result.colorsNeeded)),
      suggestedSimplifications: result.suggestedSimplifications.slice(0, 4).map(String),
      demo: false,
    };
    return NextResponse.json(clamped);
  } catch (err) {
    console.error("POST /api/blockprint/feasibility failed:", err);
    const sample = getBlockprintFeasibilitySample();
    return NextResponse.json({
      ...sample,
      demo: true,
      note: hasKeys ? DEMO_NOTE_CALL_FAILED : DEMO_NOTE_NO_KEYS,
    });
  }
}
