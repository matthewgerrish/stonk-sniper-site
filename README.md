# Stonk Sniper — site

Landing page for **$SNIPER**. Static: four files and two images, no build step,
no framework, no dependencies.

```
index.html      structure and copy
styles.css      design tokens and layout
app.js          share calculator, contract copy button
vercel.json     cache and security headers
assets/
  logo.webp     the full circular badge — footer and social previews
  mark.webp     the glyph alone — nav and favicon, legible at 16-36px
  mascot.webp   ringless mascot — faded hero backdrop, upper right
```

The hero backdrop is a `::after` on **`.hero-grid`**, not on `.hero`, and not an
`<img>` — so it stays decorative and out of the accessibility tree. Anchoring it
to the grid matters: the content column is capped at 1180px and centred, so a
viewport-anchored mascot drifts away from the headline as the screen widens. It
missed the text entirely at 1920px and sat 416px clear of it at 2560px. Against
the grid, the overlap is a constant 356px from 1440px upward.

Two masks are intersected — one feathering leftward across the headline, one
fading downward so the mascot dissolves before the stats strip it would
otherwise wash out. `.hero` uses `overflow: clip` so the bleed can never widen
the document; without it `scrollWidth` exceeded `innerWidth` at every desktop
size. The hero card is deliberately translucent with a backdrop blur so the
mascot reads through it instead of being clipped into a hard rectangle.

## Run it locally

```bash
python3 -m http.server 8789
```

Then open http://127.0.0.1:8789.

## Deploy to Vercel

The project has no build step, so Vercel serves the directory as-is.

1. Push this repo to GitHub.
2. In Vercel, **Add New → Project**, import the repo.
3. Framework Preset: **Other**. Build Command: **leave empty**. Output
   Directory: **leave empty** (repo root). Install Command: **leave empty**.
4. Deploy.
5. **Settings → Domains**, add `stonksniper.com` and follow the DNS records it
   gives you. TLS is issued automatically.

`vercel.json` already sets a year-long immutable cache on `/assets/*`, a strict
Content-Security-Policy, HSTS, and the usual hardening headers. The CSP allows
Google Fonts and nothing else — no inline scripts or styles, which is why the
revenue bars use width classes instead of `style` attributes.

## Before launch

Three placeholders need real values:

- `index.html` — `#contract-addr` currently reads "Not yet launched", and the
  copy button's `data-copy` attribute is empty and the button disabled. Put the
  mint address in both and remove `disabled`.
- `index.html` — the nav's "Contract" button and the footer links point at `#contract`.
- Social meta already points at `https://stonksniper.com/`. If you deploy on a
  different domain, update `og:url`, `og:image` and `twitter:image`, because
  social scrapers do not resolve relative image paths.

## Where the numbers come from

Every figure on the page is an em dash until the engine settles a real round.
Nothing is simulated or seeded with sample data — a token site showing invented
burn totals or fake receipts is exactly what this project's spec argues against.

The values that *are* shown are commitments rather than results: the filter
gates, the 80/15/5 revenue split, and the three burn sources. They mirror the
engine's launch config.

When the engine goes live it should publish each round's receipt as a **static
JSON file** that this page fetches, rather than this page querying the engine's
database. That keeps the site fully static and CDN-cacheable, keeps receipts
immutable and independently archivable, and means the page cannot go dark
because the database is busy or the worker is mid-round. The CSP's `connect-src`
is already set to `'self'` on that assumption; widen it if the receipts end up
on another origin.

## Engine

The round engine that feeds this page lives in the main monorepo under
`stonk-sniper/packages/`, with its spec and implementation plan in
`docs/superpowers/`. This repo is deliberately only the public face, so hosting
it does not require giving a hosting provider access to anything else.
