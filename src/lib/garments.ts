export type PreviewShape = "kurta" | "top" | "coord" | "dress" | "stole";

export interface GarmentConfig {
  label: string;
  description: string;
  subject: "woman" | "man";
  framing: string;
  preview: PreviewShape;
}

const WAIST_UP = "shot from the waist up to mid-thigh";
const FULL_LENGTH = "full-length shot from head to toe, entire garment visible";

export const GARMENTS = {
  kurta: {
    label: "Kurta",
    description:
      "a relaxed A-line cotton kurta, mid-thigh length, front button placket, side pockets, worn over solid-coloured straight-leg pants",
    subject: "woman",
    framing: WAIST_UP,
    preview: "kurta",
  },
  kurtaset: {
    label: "Kurta set",
    description:
      "a three-piece cotton kurta set: a straight-cut knee-length kurta with a small notched neckline, matching straight pants, and a lightweight cotton dupatta draped over one shoulder, all cut from the same block-printed fabric",
    subject: "woman",
    framing: FULL_LENGTH,
    preview: "kurta",
  },
  top: {
    label: "Top / Tunic",
    description:
      "a relaxed hip-length cotton top/tunic with three-quarter sleeves and a round or notched neckline, worn loose over plain solid-coloured jeans or trousers",
    subject: "woman",
    framing: WAIST_UP,
    preview: "top",
  },
  coord: {
    label: "Co-ord set",
    description:
      "a co-ord set: a relaxed cropped top paired with matching wide-leg pants, both cut from the same fabric",
    subject: "woman",
    framing: FULL_LENGTH,
    preview: "coord",
  },
  kaftan: {
    label: "Kaftan",
    description:
      "a loose, flowing cotton kaftan with wide sleeves and a relaxed V-neckline, falling to mid-calf",
    subject: "woman",
    framing: FULL_LENGTH,
    preview: "dress",
  },
  dress: {
    label: "Dress",
    description:
      "a soft cotton midi dress with a gently gathered waist, short sleeves and a flared knee-to-calf-length skirt",
    subject: "woman",
    framing: FULL_LENGTH,
    preview: "dress",
  },
  saree: {
    label: "Saree",
    description:
      "a hand block-printed cotton saree draped in the classic nivi style with neatly pleated front and the pallu over the left shoulder, worn with a plain solid-coloured blouse",
    subject: "woman",
    framing: FULL_LENGTH,
    preview: "dress",
  },
  dupatta: {
    label: "Dupatta / Stole",
    description:
      "a long, lightweight cotton dupatta/stole draped loosely around the shoulders, falling in soft folds, worn over a plain solid-coloured kurta",
    subject: "woman",
    framing: WAIST_UP,
    preview: "stole",
  },
  menkurta: {
    label: "Men's kurta",
    description:
      "a straight-cut cotton men's kurta with a mandarin collar and short button placket, knee length, worn over plain off-white pyjama pants",
    subject: "man",
    framing: FULL_LENGTH,
    preview: "kurta",
  },
  menshirt: {
    label: "Men's shirt",
    description:
      "a relaxed-fit cotton men's casual shirt with a spread collar and full button placket, worn untucked over plain solid-coloured trousers",
    subject: "man",
    framing: WAIST_UP,
    preview: "top",
  },
} as const satisfies Record<string, GarmentConfig>;

export type BlockPrintGarment = keyof typeof GARMENTS;

export const GARMENT_OPTIONS = (Object.keys(GARMENTS) as BlockPrintGarment[]).map((value) => ({
  value,
  label: GARMENTS[value].label,
}));

export function parseGarment(value: unknown): BlockPrintGarment {
  return typeof value === "string" && value in GARMENTS ? (value as BlockPrintGarment) : "kurta";
}
