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
| WhatsApp number | `src/lib/whatsapp.ts` |
| Testimonials | `data/testimonials.json` |
| Prices, areas, FAQs, hours, address | `src/lib/site.ts` |
| Logo | drop the file at `assets/logo-source.jpg`, then `npm run logo` |

Everything else is layout.

---

## Run it locally

### With Docker (closest to production)

```bash
docker compose up --build
```

Then open <http://localhost:8080>. Stop with `Ctrl+C`, or `docker compose down`.

### With Node (live reload while editing)

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

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
  path `/assets/testimonials/<filename>`. Square images look best. Leave the
  existing `placeholder-N.png` value if you have no photo yet.
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

## Replacing the logo

1. Save the supplied artwork as `assets/logo-source.jpg` (`.jpeg` and `.png`
   also work).
2. Run:

   ```bash
   npm run logo
   ```

The script removes the white background, trims the margins and writes
`public/assets/logo/`: `favicon-32.png`, `favicon-180.png`, `favicon-512.png`,
`logo-header.png`, `logo-footer.png` and a full-size transparent
`logo-master.png`. It needs Google Chrome installed; set `CHROME_PATH` if
Chrome lives somewhere unusual.

The header and footer currently draw the mark as inline SVG
(`src/components/brand-logo.tsx`) so it is razor sharp at any size. To use the
exported PNG instead, replace `<BrandLogo … />` in
`src/components/site-header.tsx` with:

```tsx
<img src="/assets/logo/logo-header.png" alt="L_4NOW Driving School" width={168} />
```

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
assets/                 logo source artwork (not committed)
data/testimonials.json  the reviews shown on the site
public/assets/          generated logo + avatar images
src/app/                pages, metadata, legal pages
src/components/         sections, header, footer, form
src/lib/site.ts         all business copy and details
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

## Accessibility and motion

Keyboard navigable with visible focus, labelled form controls, AA contrast. The
scroll animation is disabled automatically for anyone with "reduce motion" set
in their operating system — the route is simply shown complete.
