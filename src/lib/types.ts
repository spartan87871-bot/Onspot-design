export type JewelleryType = "necklace" | "earrings" | "bangle" | "ring";
export type JewelleryMetal = "gold" | "silver" | "oxidised";
export type JewelleryStyle = "temple" | "kundan" | "minimal" | "polki";

export interface JewelleryOptions {
  type: JewelleryType;
  metal: JewelleryMetal;
  style: JewelleryStyle;
}

export interface GenerateImagesResponse {
  images: string[];
  demo: boolean;
  note?: string;
}

export type ManufacturingDifficulty =
  | "Easy"
  | "Moderate"
  | "Difficult"
  | "Very difficult";

export interface JewelleryFeasibility {
  feasibilityScore: number;
  metalWeightRange: string;
  stoneSettingMethod: string;
  manufacturingDifficulty: ManufacturingDifficulty;
  suggestedChanges: string[];
  demo: boolean;
  note?: string;
}

export const NATURAL_DYE_COLORS = [
  "indigo",
  "madder-red",
  "iron-black",
  "turmeric-yellow",
  "natural-off-white",
] as const;

export type NaturalDyeColor = (typeof NATURAL_DYE_COLORS)[number];

export const NATURAL_DYE_LABELS: Record<NaturalDyeColor, string> = {
  indigo: "Indigo",
  "madder-red": "Madder Red",
  "iron-black": "Iron Black",
  "turmeric-yellow": "Turmeric Yellow",
  "natural-off-white": "Natural Off-White",
};

export const NATURAL_DYE_SWATCH: Record<NaturalDyeColor, string> = {
  indigo: "#2f3b77",
  "madder-red": "#9c3b34",
  "iron-black": "#2a2118",
  "turmeric-yellow": "#d9a441",
  "natural-off-white": "#f2e9d8",
};

export type DetailLevel = "Low" | "Medium" | "High" | "Very high";

export interface BlockPrintFeasibility {
  feasibilityScore: number;
  lineThicknessOk: boolean;
  blocksNeeded: number;
  colorsNeeded: number;
  detailLevel: DetailLevel;
  suggestedSimplifications: string[];
  demo: boolean;
  note?: string;
}

export interface RemnantIdea {
  title: string;
  description: string;
}

export interface RemnantIdeasResponse {
  ideas: RemnantIdea[];
  demo: boolean;
  note?: string;
}
