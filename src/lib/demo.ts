import manifest from "../../public/samples/manifest.json";
import type {
  BlockPrintFeasibility,
  JewelleryFeasibility,
  RemnantIdea,
} from "./types";

export const DEMO_NOTE_NO_KEYS =
  "Showing a pre-made sample — live AI generation isn't configured for this demo.";
export const DEMO_NOTE_CALL_FAILED =
  "Live generation hit a snag, so we're showing a pre-made sample instead.";

interface JewelleryManifest {
  variations: string[];
  refined: string;
  feasibility: Omit<JewelleryFeasibility, "demo" | "note">;
}

interface BlockprintManifest {
  motifs: string[];
  tile: string;
  feasibility: Omit<BlockPrintFeasibility, "demo" | "note">;
  remnants: RemnantIdea[];
}

interface Manifest {
  jewellery: JewelleryManifest;
  blockprint: BlockprintManifest;
}

const data = manifest as unknown as Manifest;

export function getJewelleryVariations(): string[] {
  return data.jewellery.variations;
}

export function getJewelleryRefined(): string {
  return data.jewellery.refined;
}

export function getJewelleryFeasibilitySample(): Omit<
  JewelleryFeasibility,
  "demo" | "note"
> {
  return data.jewellery.feasibility;
}

export function getBlockprintMotifs(): string[] {
  return data.blockprint.motifs;
}

export function getBlockprintTile(): string {
  return data.blockprint.tile;
}

export function getBlockprintFeasibilitySample(): Omit<
  BlockPrintFeasibility,
  "demo" | "note"
> {
  return data.blockprint.feasibility;
}

export function getRemnantIdeasSample(): RemnantIdea[] {
  return data.blockprint.remnants;
}
