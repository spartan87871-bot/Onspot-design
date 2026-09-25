import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t hairline mt-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-display text-base font-semibold text-ink">
            Loom &amp; Lustre AI
          </p>
          <p className="text-sm text-ink-soft mt-1">
            AI design tools for Indian fashion &amp; craft brands.
          </p>
        </div>
        <div className="flex items-center gap-5 text-sm text-ink-soft">
          <Link href="/about" className="hover:text-indigo transition-colors">
            About &amp; Contact
          </Link>
          <span className="inline-flex items-center rounded-full border hairline px-3 py-1 text-xs font-medium tracking-wide uppercase text-terracotta-dark bg-paper">
            Concept demo
          </span>
        </div>
      </div>
    </footer>
  );
}
