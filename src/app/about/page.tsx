export const metadata = {
  title: "About & Contact — Loom & Lustre AI",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-16 sm:py-24">
      <p className="text-xs font-semibold tracking-widest uppercase text-terracotta-dark">
        About &amp; Contact
      </p>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink mt-3">
        About this service
      </h1>
      <p className="text-ink-soft text-lg leading-relaxed mt-5">
        Loom &amp; Lustre AI is a concept demo of two design tools built for Indian fashion
        and craft brands: a jewellery design studio and a hand block-print studio. Each one
        takes a customer&rsquo;s words or reference photos, generates original design
        variations in seconds, and runs an AI feasibility check so a workshop knows —
        before a single hour of hand work goes in — roughly what a piece will weigh, which
        technique it needs, and how to simplify it if it&rsquo;s too costly or difficult to
        produce. The goal is to shorten the distance between &ldquo;I like this&rdquo; and
        &ldquo;we can make this,&rdquo; without losing the craftsmanship in between.
      </p>

      <div className="mt-12 rounded-3xl border hairline bg-paper p-7 sm:p-8">
        <h2 className="font-display text-xl font-semibold text-ink mb-4">Get in touch</h2>
        <dl className="space-y-3 text-ink-soft">
          <div className="flex gap-3">
            <dt className="w-20 shrink-0 font-medium text-ink">Name</dt>
            <dd>[Your name]</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-20 shrink-0 font-medium text-ink">Phone</dt>
            <dd>[Your phone number]</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-20 shrink-0 font-medium text-ink">Email</dt>
            <dd>[Your email address]</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
