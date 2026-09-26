"use client";

const KURTA_PATH =
  "M150,25 C165,25 178,32 185,45 L230,55 L250,115 L205,130 L205,150 L215,370 L195,385 L105,385 L85,370 L95,150 L95,130 L50,115 L70,55 L115,45 C122,32 135,25 150,25 Z";

const TOP_PATH =
  "M150,25 C165,25 178,32 185,45 L230,55 L250,115 L205,130 L205,150 L212,270 L195,285 L105,285 L88,270 L95,150 L95,130 L50,115 L70,55 L115,45 C122,32 135,25 150,25 Z";

const COORD_TOP_PATH =
  "M150,25 C165,25 178,32 185,45 L225,55 L245,110 L200,125 L200,140 L210,185 L190,195 L110,195 L90,185 L100,140 L100,125 L55,110 L75,55 L115,45 C122,32 135,25 150,25 Z";

const COORD_PANTS_PATH =
  "M100,208 L200,208 L206,228 L100,228 Z M100,228 L149,228 L144,386 L112,386 L100,244 Z M151,228 L200,228 L208,244 L196,386 L156,386 Z";

interface GarmentPreviewProps {
  tileUrl: string;
  garment: "kurta" | "coord" | "top";
  className?: string;
}

const GARMENT_LABELS: Record<GarmentPreviewProps["garment"], string> = {
  kurta: "Kurta garment preview",
  coord: "Co-ord set garment preview",
  top: "Top/tunic garment preview",
};

export default function GarmentPreview({ tileUrl, garment, className }: GarmentPreviewProps) {
  const patternId = `garment-tile-${garment}`;

  return (
    <svg
      viewBox="0 0 300 410"
      className={className}
      role="img"
      aria-label={GARMENT_LABELS[garment]}
    >
      <defs>
        <pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          width="70"
          height="70"
          patternTransform="rotate(0)"
        >
          <image href={tileUrl} x="0" y="0" width="70" height="70" preserveAspectRatio="xMidYMid slice" />
        </pattern>
      </defs>

      {garment === "kurta" && (
        <path d={KURTA_PATH} fill={`url(#${patternId})`} stroke="#2a2118" strokeWidth="2.5" strokeLinejoin="round" />
      )}
      {garment === "top" && (
        <path d={TOP_PATH} fill={`url(#${patternId})`} stroke="#2a2118" strokeWidth="2.5" strokeLinejoin="round" />
      )}
      {garment === "coord" && (
        <>
          <path
            d={COORD_TOP_PATH}
            fill={`url(#${patternId})`}
            stroke="#2a2118"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d={COORD_PANTS_PATH}
            fill={`url(#${patternId})`}
            stroke="#2a2118"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}
