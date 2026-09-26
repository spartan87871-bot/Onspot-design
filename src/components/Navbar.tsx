"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SITE_NAME, SITE_MODE, SHOW_JEWELLERY, SHOW_BLOCKPRINT, singleStudioHomePath } from "@/lib/site";

const links = [
  ...(SITE_MODE === "full" ? [{ href: "/", label: "Home" }] : []),
  ...(SHOW_JEWELLERY ? [{ href: "/jewellery", label: "Jewellery Studio" }] : []),
  ...(SHOW_BLOCKPRINT ? [{ href: "/block-print", label: "Block-Print Studio" }] : []),
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const brandHref = singleStudioHomePath() ?? "/";

  return (
    <header className="sticky top-0 z-40 border-b hairline bg-cream/90 backdrop-blur supports-[backdrop-filter]:bg-cream/70">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href={brandHref}
            className="font-display text-lg sm:text-xl font-semibold tracking-tight text-ink"
            onClick={() => setOpen(false)}
          >
            {SITE_NAME}
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors ${
                    active
                      ? "bg-indigo text-cream"
                      : "text-ink-soft hover:bg-paper hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <button
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border hairline text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              {open ? (
                <path
                  d="M2 2l14 14M16 2L2 16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M1 4h16M1 9h16M1 14h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t hairline bg-cream">
          <div className="mx-auto max-w-6xl px-5 py-3 flex flex-col gap-1">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`px-3.5 py-2.5 rounded-xl text-base font-medium transition-colors ${
                    active
                      ? "bg-indigo text-cream"
                      : "text-ink-soft hover:bg-paper hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
