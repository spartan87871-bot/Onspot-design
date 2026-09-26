# Thread & Print Studio (concept demo)

A mobile-friendly demo of AI design tools for Indian fashion brands, built around a hand
block-printed cotton clothing line:

- **Block-Print Studio** — describe a print (or upload reference photos), pick a natural-dye
  palette, and get 4 design ideas back as real studio photos of a model wearing the kurta or
  co-ord set — plus a "can it be made?" feasibility check (line thickness, blocks/colours needed,
  suggested simplifications) and a few product ideas for leftover fabric remnants.
- **Jewellery Design Studio** — a second studio (necklace/earring/bangle/ring concepts + a
  manufacturing feasibility check) also lives in this codebase but isn't the current focus; it's
  parked as-is for now.

Built with Next.js (App Router) + Tailwind. Image generation via **Replicate (FLUX)**, text/vision
analysis via **Anthropic (Claude)**. All brand names, logos and reference imagery in this repo are
original placeholders — nothing here belongs to a real brand.

## Demo mode (no API keys required)

If `REPLICATE_API_TOKEN` / `ANTHROPIC_API_KEY` are missing, or a live call fails for any reason, every
API route falls back to pre-made sample results from [`public/samples`](public/samples) (see
[`manifest.json`](public/samples/manifest.json)) and the UI shows a small "Showing a pre-made sample"
badge. **The demo can never hard-fail during a live pitch** — worst case, it silently shows a sample.

The committed Block-Print samples are real FLUX-generated worn-design photos (original prompts, not
derived from any customer's uploaded reference photos). The Jewellery samples are original hand-drawn
SVG sketches. To regenerate the samples with your own API keys, add them to `.env.local` and run:

```bash
npm run generate-samples
```

This calls the real APIs once, downloads the results into `public/samples/`, rewrites `manifest.json` to
point at them, and prints when it's done. Review the output, then commit the changed files.

## Branding a deployment differently

Two env vars let the same codebase power multiple deployments under different names/scopes — useful for
sharing a public portfolio link separately from a private client-pitch link:

- `NEXT_PUBLIC_SITE_MODE` — `full` (both studios, default), `jewellery`, or `blockprint`. In a
  single-studio mode, `/` redirects straight to that studio and the other one is hidden from nav.
- `NEXT_PUBLIC_SITE_NAME` — overrides the brand name shown in the navbar/footer/page title. Defaults to
  "Thread & Print Studio".

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without any env vars set, everything runs fully in
demo mode — good enough to click through the whole flow immediately.

To try live generation locally, copy `.env.local.example` to `.env.local` and fill in your keys.

## Deploying to Vercel

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo. Vercel auto-detects Next.js —
   no build settings to change.
3. Before the first deploy (or in **Project Settings → Environment Variables** any time after), add:
   - `REPLICATE_API_TOKEN` — from [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
   - `ANTHROPIC_API_KEY` — from [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
   - *(optional)* `NEXT_PUBLIC_SITE_MODE` / `NEXT_PUBLIC_SITE_NAME` — see above
   - *(optional)* `FLUX_MODEL` — defaults to `black-forest-labs/flux-schnell`
   - *(optional)* `ANTHROPIC_MODEL` — defaults to `claude-sonnet-5`

   Leave the two required keys blank and the deployed site still works — it just runs in demo mode.
4. Click **Deploy**. Vercel gives you a `*.vercel.app` URL — that's what you record and share.

Repeat the import with different `NEXT_PUBLIC_SITE_MODE`/`NEXT_PUBLIC_SITE_NAME` values to spin up
additional branded deployments from the same repo.

## 60-second demo script (Block-Print Studio, for screen recording)

1. **(0:00–0:05) Landing.** Land on the Block-Print Studio. Read the one-line pitch out loud:
   *"Describe a print, pick a natural-dye palette, and see it worn — with a feasibility check before
   a single hour of hand work goes in."*
2. **(0:05–0:25) Generate.** Type a short brief (e.g. *"a small booti sprig, spaced in a diagonal
   grid"*), pick 1–2 natural-dye colours, click **Generate design ideas**. While the friendly loading
   message plays, narrate what's happening. When the 4 worn-design photos appear, click one to select it.
3. **(0:25–0:40) Feasibility check.** Click **Can it be block printed?**. Point at the score dial,
   line-thickness/blocks/colours breakdown, and suggested simplifications.
4. **(0:40–0:50) Flat fabric view.** Click **See print as flat fabric** to show the seamless repeat and
   the instant garment mockup toggle (kurta / co-ord).
5. **(0:50–0:58) Remnants.** Click **Remnant fabric ideas** to show the bonus panel.
6. **(0:58–1:00) Close.** Scroll to the footer, point at the **Concept demo** label, done.

Tip: record once in demo mode first (fast, never fails) as your safety take, then optionally record a
second pass with real API keys configured if you want to show live generation.
