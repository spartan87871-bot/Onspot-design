"use client";

interface OptionPillsProps<T extends string> {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}

export default function OptionPills<T extends string>({
  label,
  options,
  value,
  onChange,
}: OptionPillsProps<T>) {
  return (
    <div>
      <p className="text-sm font-medium text-ink mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                active
                  ? "bg-indigo text-cream border-indigo"
                  : "bg-cream text-ink-soft border-line hover:border-indigo hover:text-indigo"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
