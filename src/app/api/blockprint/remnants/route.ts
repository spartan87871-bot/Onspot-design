import { NextRequest, NextResponse } from "next/server";
import { askClaudeJson } from "@/lib/anthropic";
import { getRemnantIdeasSample, DEMO_NOTE_CALL_FAILED, DEMO_NOTE_NO_KEYS } from "@/lib/demo";
import { buildRemnantIdeasPrompt } from "@/lib/prompts";
import type { RemnantIdea } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

interface Body {
  motifDescription?: string;
}

function isValidIdeas(v: unknown): v is RemnantIdea[] {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as RemnantIdea).title === "string" &&
        typeof (item as RemnantIdea).description === "string"
    )
  );
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const hasKeys = Boolean(process.env.ANTHROPIC_API_KEY);

  try {
    const result = await askClaudeJson<unknown>({
      system:
        "You are a resourceful textile-waste product designer. You always answer with strict JSON and nothing else.",
      prompt: buildRemnantIdeasPrompt(body.motifDescription?.slice(0, 300) || "a hand block-printed motif"),
      maxTokens: 400,
    });

    if (!isValidIdeas(result)) {
      throw new Error("Malformed remnant ideas response");
    }

    return NextResponse.json({ ideas: result.slice(0, 3), demo: false });
  } catch (err) {
    console.error("POST /api/blockprint/remnants failed:", err);
    return NextResponse.json({
      ideas: getRemnantIdeasSample(),
      demo: true,
      note: hasKeys ? DEMO_NOTE_CALL_FAILED : DEMO_NOTE_NO_KEYS,
    });
  }
}
