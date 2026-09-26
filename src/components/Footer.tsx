import Link from "next/link";
import { SITE_NAME, SHOW_JEWELLERY, SHOW_BLOCKPRINT } from "@/lib/site";

export default function Footer() {
  const scopeText =
    SHOW_JEWELLERY && SHOW_BLOCKPRINT
      ? "AI design tools for Indian fashion & craft brands."
      : SHOW_JEWELLERY
      ? "AI jewellery design tool for Indian fashion & craft brands."
      : "AI block-print design tool for Indian fashion & craft brands.";

  return (
    <footer className="border-t hairline mt-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-display text-base font-semibold text-ink">{SITE_NAME}</p>
          <p className="text-sm text-ink-soft mt-1">{scopeText}</p>
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
