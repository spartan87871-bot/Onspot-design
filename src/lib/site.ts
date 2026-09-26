export type SiteMode = "full" | "jewellery" | "blockprint";

function readSiteMode(): SiteMode {
  const raw = process.env.NEXT_PUBLIC_SITE_MODE;
  if (raw === "jewellery" || raw === "blockprint") return raw;
  return "full";
}

export const SITE_MODE: SiteMode = readSiteMode();
export const SITE_NAME: string = process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Thread & Print Studio";

export const SHOW_JEWELLERY = SITE_MODE === "full" || SITE_MODE === "jewellery";
export const SHOW_BLOCKPRINT = SITE_MODE === "full" || SITE_MODE === "blockprint";

/** Where "/" should send visitors when this deployment is scoped to a single studio. */
export function singleStudioHomePath(): string | null {
  if (SITE_MODE === "jewellery") return "/jewellery";
  if (SITE_MODE === "blockprint") return "/block-print";
  return null;
}
