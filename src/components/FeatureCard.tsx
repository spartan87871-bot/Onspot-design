import Link from "next/link";
import type { ReactNode } from "react";

interface FeatureCardProps {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  accent: "gold" | "indigo";
  icon: ReactNode;
}

export default function FeatureCard({
  href,
  eyebrow,
  title,
  description,
  cta,
  accent,
  icon,
}: FeatureCardProps) {
  const accentText = accent === "gold" ? "text-gold" : "text-indigo";
  const accentBg = accent === "gold" ? "bg-gold" : "bg-indigo";

  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-between rounded-3xl border hairline bg-paper p-7 sm:p-8 overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-xl"
    >
      <div
        className={`absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-10 ${accentBg} animate-float-slow`}
      />
      <div className="relative">
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center bg-cream border hairline ${accentText}`}>
          {icon}
        </div>
        <p className={`mt-5 text-xs font-semibold tracking-widest uppercase ${accentText}`}>
          {eyebrow}
        </p>
        <h3 className="font-display text-2xl font-semibold text-ink mt-2">{title}</h3>
        <p className="text-ink-soft mt-3 leading-relaxed">{description}</p>
      </div>
      <div className={`relative mt-8 inline-flex items-center gap-2 font-medium ${accentText}`}>
        {cta}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="transition-transform group-hover:translate-x-1"
        >
          <path
            d="M2 8h11M9 3l5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Link>
  );
}
