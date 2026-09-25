"use client";

import { NATURAL_DYE_COLORS, NATURAL_DYE_LABELS, NATURAL_DYE_SWATCH, type NaturalDyeColor } from "@/lib/types";

interface ColorSwatchPickerProps {
  value: NaturalDyeColor[];
  onChange: (v: NaturalDyeColor[]) => void;
  max?: number;
}

export default function ColorSwatchPicker({ value, onChange, max = 3 }: ColorSwatchPickerProps) {
  function toggle(color: NaturalDyeColor) {
    if (value.includes(color)) {
      onChange(value.filter((c) => c !== color));
    } else if (value.length < max) {
      onChange([...value, color]);
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-ink mb-2">
        Natural-dye palette{" "}
        <span className="text-ink-soft font-normal">(pick 1–{max})</span>
      </p>
      <div className="flex flex-wrap gap-2.5">
        {NATURAL_DYE_COLORS.map((color) => {
          const active = value.includes(color);
          return (
            <button
              key={color}
              type="button"
              onClick={() => toggle(color)}
              className={`flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full border transition-all ${
                active
                  ? "border-indigo bg-paper ring-2 ring-indigo/30"
                  : "border-line bg-cream hover:border-indigo/50"
              }`}
            >
              <span
                className="h-5 w-5 rounded-full border hairline shrink-0"
                style={{ backgroundColor: NATURAL_DYE_SWATCH[color] }}
              />
              <span className="text-sm font-medium text-ink">{NATURAL_DYE_LABELS[color]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
