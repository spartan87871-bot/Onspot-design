"use client";

interface ResultGridProps {
  images: string[];
  selected: number | null;
  onSelect: (index: number) => void;
  labelPrefix?: string;
}

function downloadImage(src: string, filename: string) {
  const a = document.createElement("a");
  a.href = src;
  a.download = filename;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function ResultGrid({ images, selected, onSelect, labelPrefix = "Design" }: ResultGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {images.map((src, i) => {
        const active = selected === i;
        return (
          <div
            key={i}
            className={`group relative rounded-2xl overflow-hidden border-2 transition-all bg-paper ${
              active ? "border-indigo shadow-md" : "border-transparent hover:border-line"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(i)}
              className="block w-full aspect-square"
              aria-pressed={active}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${labelPrefix} ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>

            {active && (
              <span className="absolute top-2 left-2 rounded-full bg-indigo text-cream text-[11px] font-semibold px-2.5 py-1">
                Selected
              </span>
            )}

            <button
              type="button"
              onClick={() => downloadImage(src, `${labelPrefix.toLowerCase().replace(/\s+/g, "-")}-${i + 1}.png`)}
              className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-cream/90 text-ink flex items-center justify-center shadow opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              aria-label="Download"
              title="Download"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1v9m0 0L4.5 6.5M8 10l3.5-3.5M2 13.5h12"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
