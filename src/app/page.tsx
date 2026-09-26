import Link from "next/link";
import { redirect } from "next/navigation";
import FeatureCard from "@/components/FeatureCard";
import { singleStudioHomePath } from "@/lib/site";

const steps = [
  {
    title: "Describe or mix designs they love",
    description:
      "A customer types what they want, or uploads a few photos and points to the bits they like — \"the jhumka shape from this one, the stones from that one.\"",
  },
  {
    title: "AI creates new designs",
    description:
      "Four fresh design variations come back in under a minute — ready to browse, refine with a follow-up note, and download.",
  },
  {
    title: "AI checks if it can actually be made",
    description:
      "Before anyone commits, a feasibility check flags weight, technique and difficulty — with concrete suggestions to make it easier or cheaper to produce.",
  },
];

export default function Home() {
  const singleStudioPath = singleStudioHomePath();
  if (singleStudioPath) {
    redirect(singleStudioPath);
  }

  return (
    <div>
      <section className="relative overflow-hidden border-b hairline">
        <div className="absolute inset-0 bg-block-print opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8 pt-16 sm:pt-24 pb-16 sm:pb-20">
          <p className="text-xs font-semibold tracking-widest uppercase text-terracotta-dark">
            For Indian fashion &amp; craft brands
          </p>
          <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight text-ink mt-4 max-w-3xl">
            From a customer&rsquo;s idea to a design your workshop can actually make.
          </h1>
          <p className="text-ink-soft text-lg sm:text-xl mt-5 max-w-2xl leading-relaxed">
            Customers describe or mix designs they love. AI creates new designs. AI checks
            if they can actually be made — before you spend a single hour on the floor.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/jewellery"
              className="inline-flex items-center justify-center rounded-full bg-indigo text-cream px-6 py-3 font-medium hover:bg-indigo-dark transition-colors"
            >
              Try the Jewellery Studio
            </Link>
            <Link
              href="/block-print"
              className="inline-flex items-center justify-center rounded-full bg-cream border-2 border-terracotta text-terracotta-dark px-6 py-3 font-medium hover:bg-terracotta hover:text-cream transition-colors"
            >
              Try the Block-Print Studio
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-20">
        <div className="grid sm:grid-cols-3 gap-8 sm:gap-6">
          {steps.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="font-display text-5xl font-semibold text-line select-none">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="font-display text-xl font-semibold text-ink mt-2">
                {step.title}
              </h3>
              <p className="text-ink-soft mt-2 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 sm:px-8 pb-20 sm:pb-28">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink mb-2">
          Two studios, one workflow
        </h2>
        <p className="text-ink-soft mb-8 max-w-2xl">
          Pick a demo below — both walk through the same idea → design → feasibility loop,
          tailored to a different craft.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <FeatureCard
            href="/jewellery"
            eyebrow="Fine jewellery"
            title="Jewellery Design Studio"
            description="Mix reference photos and a text brief into new necklace, earring, bangle or ring concepts — then check metal weight, stone-setting method and manufacturing difficulty."
            cta="Open the studio"
            accent="gold"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3l3 4H9l3-4zM4 7h16l-8 13L4 7zm4 0l4 12M16 7l-4 12"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
          <FeatureCard
            href="/block-print"
            eyebrow="Hand block-printed cotton"
            title="Block-Print Studio"
            description="Generate motif ideas in a natural-dye palette, turn one into a seamless repeat, preview it on a kurta or co-ord set, and check hand-carving feasibility."
            cta="Open the studio"
            accent="indigo"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            }
          />
        </div>
      </section>
    </div>
  );
}
