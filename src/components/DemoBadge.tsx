interface DemoBadgeProps {
  note?: string;
}

export default function DemoBadge({ note }: DemoBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border hairline bg-paper px-3 py-1.5 text-xs text-ink-soft">
      <span className="h-1.5 w-1.5 rounded-full bg-terracotta shrink-0" />
      <span>{note ?? "Showing a pre-made sample result"}</span>
    </div>
  );
}
