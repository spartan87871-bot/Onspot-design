# Loom & Lustre AI (concept demo)

A mobile-friendly demo of two AI design tools for Indian fashion brands:

- **Jewellery Design Studio** — mix reference photos + a text brief into new necklace/earring/bangle/ring
  concepts, then run a "can it be made?" feasibility check (metal weight, stone-setting method,
  manufacturing difficulty, suggested simplifications).
- **Block-Print Studio** — generate hand block-print motif ideas in a natural-dye palette, turn one into
  a seamless repeat, preview it on a kurta / co-ord set, check hand-carving feasibility, and get ideas
  for leftover fabric remnants.

Built with Next.js (App Router) + Tailwind. Image generation via **Replicate (FLUX)**, text/vision
analysis via **Anthropic (Claude)**. All brand names, logos and reference imagery in this repo are
original placeholders — nothing here belongs to a real brand.

## Demo mode (no API keys required)

If `REPLICATE_API_TOKEN` / `ANTHROPIC_API_KEY` are missing, or a live call fails for any reason, every
API route falls back to pre-made sample results from [`public/samples`](public/samples) (see
[`manifest.json`](public/samples/manifest.json)) and the UI shows a small "Showing a pre-made sample"
badge. **The demo can never hard-fail during a live pitch** — worst case, it silently shows a sample.

The committed samples are original hand-authored SVG "concept sketches" (jewellery line art, block-print
motifs, a seamless fabric tile) so the repo works out of the box with zero setup. To replace them with
real FLUX/Claude-generated samples, add your API keys to `.env.local` and run:

```bash
npm run generate-samples
```

This calls the real APIs once, downloads the results into `public/samples/`, rewrites `manifest.json` to
point at them, and prints when it's done. Review the output, then commit the changed files.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without any env vars set, both studios run fully in
demo mode — good enough to click through the whole flow immediately.

To try live generation locally, copy `.env.local.example` to `.env.local` and fill in your keys.

## Deploying to Vercel

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo. Vercel auto-detects Next.js —
   no build settings to change.
3. Before the first deploy (or in **Project Settings → Environment Variables** any time after), add:
   - `REPLICATE_API_TOKEN` — from [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
   - `ANTHROPIC_API_KEY` — from [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
   - *(optional)* `FLUX_MODEL` — defaults to `black-forest-labs/flux-schnell`
   - *(optional)* `ANTHROPIC_MODEL` — defaults to `claude-sonnet-5`

   Leave the two required keys blank and the deployed site still works — it just runs in demo mode.
4. Click **Deploy**. Vercel gives you a `*.vercel.app` URL — that's what you record and share.

Alternatively, from the CLI:

```bash
npm i -g vercel
vercel          # first deploy / preview
vercel --prod   # promote to production URL
```

Add env vars via `vercel env add REPLICATE_API_TOKEN` / `vercel env add ANTHROPIC_API_KEY`, or in the
dashboard.

## 60-second demo script (for screen recording)

1. **(0:00–0:08) Home page.** Land on `/`. Read the one-line pitch out loud: *"Customers describe or mix
   designs they love. AI creates new designs. AI checks if they can actually be made."* Point at the two
   cards.
2. **(0:08–0:25) Jewellery Studio.** Click into it. Type a short brief (e.g. *"a temple-style jhumka with
   a floral border"*), leave Type/Metal/Style on their defaults, click **Generate designs**. While the
   friendly loading message plays, narrate: *"Four original concepts, mixing whatever references the
   customer uploads."* When the grid appears, click one design to select it.
3. **(0:25–0:35) Feasibility check.** Click **Can it be made?**. While it loads, narrate: *"Before
   anyone commits to production, it checks weight, setting method, and difficulty — and suggests changes
   to make it cheaper or easier to produce."* Point at the score dial and the suggested changes list.
4. **(0:35–0:48) Block-Print Studio.** Navigate there. Type a motif brief (e.g. *"a small paisley booti
   in a diagonal grid"*), pick 1–2 natural-dye colours, click **Generate motif ideas**, select one.
   Click **Turn into seamless repeat** and point at the kurta/co-ord garment preview toggle.
5. **(0:48–0:58) Wrap-up.** Click **Can it be block printed?** to show the carving feasibility score, then
   **Remnant fabric ideas** to show the bonus panel. Narrate: *"Same idea → design → feasibility loop for
   textiles, plus a few ideas for what to do with the offcuts."*
6. **(0:58–1:00) Close.** Scroll to the footer, point at the **Concept demo** label, done.

Tip: record once in demo mode first (fast, never fails) as your safety take, then optionally record a
second pass with real API keys configured if you want to show live generation.
