# L_4NOW Driving School

**Learn • Practice • Succeed**

Marketing site for L_4NOW Driving School. Built with Next.js and exported as a
plain static site, so it can be served by any web host or a small nginx
container — there is no server, database or API key in production.

Enquiries are handed to **WhatsApp**: the form fills in a message addressed to
the school and the visitor presses send.

---

## The four things you will actually want to change

| What | Where |
| --- | --- |
| Prices | `data/pricing.ts` |
| WhatsApp number | `src/lib/whatsapp.ts` |
| Testimonials | `data/testimonials.json` |
| FAQs, hours, copy | `src/lib/site.ts` |
| Logo | replace `brand/logo-source.png`, then `npm run logo` |

Everything else is layout.

---

## Run it locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

To see exactly what gets published:

```bash
npm run build
npx serve out
```

The build writes a folder of plain files — no server runs in production, so
there is nothing to containerise.

---

## Editing testimonials

Open `data/testimonials.json`. It is a list; each entry looks like this:

```json
{
  "name": "Amira K.",
  "photo": "/assets/testimonials/amira.jpg",
  "rating": 5,
  "quote": "Passed first time. Calm, patient and always on time."
}
```

- `name` — shown in bold under the photo.
- `photo` — put the image file in `public/assets/testimonials/` and use the
  path `/assets/testimonials/<filename>`. Any size works: tiles are square and
  crop the photo to fit. Leave the `placeholder-N.svg` value if you have no
  photo yet.
- `rating` — a whole number 1–5. Delete the line to hide the stars.
- `quote` — keep it short. Anything past ~180 characters is trimmed with an
  ellipsis so the cards stay the same shape.

Add or remove entries freely — the grid reflows. Save the file, and the site
picks it up on the next build (or immediately, if `npm run dev` is running).

---

## Changing the WhatsApp number

Open `src/lib/whatsapp.ts` and edit the two lines at the top:

```ts
export const WHATSAPP_NUMBER = "447400617589";   // digits only, country code first
export const WHATSAPP_DISPLAY = "+44 7400 617589"; // how it is shown on screen
```

No `+`, no spaces and no brackets in `WHATSAPP_NUMBER`. UK numbers start `44`
with the leading `0` dropped: `07400 617589` → `447400617589`.

That one file feeds the form, the header link and the footer.

---

## Changing prices

`data/pricing.ts` holds every figure. Each entry looks like this:

```ts
{
  id: "standard-lesson",
  name: "Standard lesson",
  subtitle: "Pay as you go",
  price: "£37",
  unit: "per hour",
  note: "…",
  ctaLabel: "Book a lesson",
}
```

- **Removing the intro offer** — delete the `originalPrice` and `badge` lines
  from the `first-lesson` entry. The strike-through and the flag disappear.
- **A price you do not have yet** — leave it as `TODO_PRICE`. The card shows
  "Price on request" with an **Ask us** button that opens WhatsApp with the
  package name filled in, rather than a blank figure.
- **Automatic transmission** — the `transmission` field exists and is unset
  everywhere, because whether automatic is offered is not confirmed. Set it to
  `"both"` if the rate is the same, or add separate `"manual"` and
  `"automatic"` entries if it is not. The file explains both.

The small print under the grid is the `pricingNote` export in the same file.

## Replacing the logo

1. Overwrite `public/logo.png` with the new artwork. It should already have a
   transparent background — nothing removes one for you.
2. Run:

   ```bash
   npm run logo
   ```

That regenerates `public/favicon-32.png`, `favicon-180.png`, `favicon-512.png`
(composited on a white square, because the source is wide and small) and
`public/og.png` (1200×630, logo centred) — plus the six placeholder avatars.
It needs Google Chrome installed; set `CHROME_PATH` if Chrome is somewhere
unusual.

The header and footer render `public/logo.png` directly, capped at its native
width so it is never upscaled. The logo already contains the wordmark and
strapline, so no text is set beside it.

---

## Deploying

### GitHub Pages (default — free, updates on every push)

`.github/workflows/deploy.yml` builds the site and publishes it whenever you
push to `main`. One-time setup in the GitHub repo:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. Push to `main`. The workflow builds and deploys; the URL appears in the
   Actions run summary.

The workflow assumes a *project* site at `https://<user>.github.io/<repo>/` and
sets `NEXT_PUBLIC_BASE_PATH` accordingly. Using a custom domain or a
`<user>.github.io` repo? Delete the `NEXT_PUBLIC_BASE_PATH` lines from the
workflow so the site builds for the root path.

### Anywhere else

`npm run build` produces a `out/` folder of static files. Upload it to Netlify,
Cloudflare Pages, S3, or any web host.

### If you add the WhatsApp Cloud API later

That upgrade needs a server, which GitHub Pages cannot run. Move to a host that
runs containers — Render, Fly.io or Railway all take the `Dockerfile` as-is.
See `NOTES.md`.

---

## Project layout

```
data/pricing.ts         every price on the site
data/testimonials.json  the reviews shown on the site
public/logo.png         the logo, used as-is
public/favicon-*.png    generated from it by `npm run logo`
public/og.png           social card, generated the same way
src/app/                pages, metadata, legal pages
src/components/         sections, header, footer, form
src/lib/site.ts         business copy and details
src/lib/whatsapp.ts     the WhatsApp number
scripts/                asset generation + screenshot/audit tooling
```

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server with live reload |
| `npm run build` | Static export into `out/` |
| `npm run logo` | Regenerate logo + avatar images |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run screenshots` | Save reference screenshots to `docs/screenshots/` |
| `npm run audit` | Check the scroll route never overlaps content, at 7 widths |
| `npm run contrast` | Sample real pixels to check hero text over the map |

## Accessibility and motion

Keyboard navigable with visible focus, labelled form controls, AA contrast.

Testimonial tiles reveal their quote on hover on pointer devices, and on tap in
a panel below the row on touch devices — the quote is in the page for screen
readers either way.

Everything is disabled for anyone with "reduce motion" set in their operating
system: no scroll-linked route, no reveals, no tile flip, and no smooth
scrolling. Nothing is hidden until JavaScript runs, so the page is readable
even if the script never loads.
