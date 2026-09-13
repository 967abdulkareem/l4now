# Implementation notes

Background for whoever picks this up next. Day-to-day editing is in
[README.md](./README.md).

---

## How enquiries reach the school today

The reservation form does **not** post anywhere. On submit it validates the
fields, builds a `https://wa.me/<number>?text=<message>` link and opens it. The
visitor's own WhatsApp opens with the message already written; they press send.

Consequences worth knowing:

- No backend, no API key, no database, nothing to run or pay for.
- Nothing is stored on the site, which keeps the privacy position simple.
- The enquiry only arrives **if the visitor presses send.** The success screen
  says so rather than claiming a booking was made.
- Desktop visitors need WhatsApp Desktop or WhatsApp Web signed in; otherwise
  `wa.me` shows them a QR page. The number is also printed on screen as a
  fallback.

The number lives in `src/lib/whatsapp.ts`.

---

## Upgrading to automated WhatsApp confirmations

To have the site send messages itself — an instant confirmation to the student,
or a notification to the school without waiting for the visitor to press send —
you need the WhatsApp Business Cloud API, which requires a server because the
access token must never reach the browser.

Sketch of the work:

1. **Get credentials.** Register the number as a WhatsApp Business Account on
   [Meta for Developers](https://developers.facebook.com/), and generate a
   permanent access token plus the phone-number ID.

2. **Store the token as a secret.** Copy `.env.example` to `.env` locally; in
   production set `WHATSAPP_CLOUD_API_TOKEN` as a GitHub Actions secret or a
   hosting-platform environment variable. Never commit it — `.env` is
   git-ignored for this reason.

3. **Add a server endpoint** that accepts the form payload and calls the Cloud
   API server-side, roughly:

   ```
   POST https://graph.facebook.com/v21.0/<PHONE_NUMBER_ID>/messages
   Authorization: Bearer $WHATSAPP_CLOUD_API_TOKEN
   Content-Type: application/json

   { "messaging_product": "whatsapp",
     "to": "<recipient>",
     "type": "text",
     "text": { "body": "<the composed enquiry>" } }
   ```

   Validate and rate-limit the input — the endpoint is public.

4. **Point the form at it.** In `src/components/booking-form.tsx`, replace the
   `window.open(whatsappLink(...))` call with a `fetch` POST to the endpoint,
   and show a real confirmation only when the response succeeds. Keep the
   `wa.me` link as the fallback when the request fails.

5. **Change host.** This step breaks GitHub Pages, which serves static files
   only. The `Dockerfile` already builds a deployable image — Render, Fly.io and
   Railway all take it directly. `output: "export"` in `next.config.ts` would
   need removing if you want the endpoint to live inside this Next app rather
   than as a separate service.

Business-initiated messages outside a 24-hour customer service window must use
an approved message template, and are charged per conversation. Check Meta's
current pricing before promising instant confirmations.

---

## The scroll animation

The hero map, the route and the moving GPS dot are one system:

- `scripts/generate-map-data.py` generates the fictional street network into
  `src/lib/map-data.ts`. Re-run with `npm run map` only if you want a different
  town; the output is committed, so a normal build never needs Python.
- `src/components/journey/route-journey.tsx` builds the red route **from
  measured layout** — lane elements (`src/components/lanes.tsx`) and the course
  card edges — in the page's own pixel coordinates. That is why the route never
  crosses text at any width, and why it is rebuilt on resize, on font load and
  whenever the page height changes.
- The reserved gutters are real layout, not decoration. If you remove the
  `<Lanes>` wrapper or tighten `gap-x-14` on the pricing grid, the route will
  have nowhere to go.
- The weave is built from the **first row** of pricing cards, marked
  `data-route-row`. Cards after the third sit below the weave. Change the grid
  to something other than three columns and that geometry needs revisiting.
- `npm run audit` checks this automatically at seven widths, including the
  form fields.

### The map on small screens — one thing to keep in step

Phones show the same vector map behind the hero, cropped to a portrait window
so the red route lands *below* the copy instead of running through it. That
crop is written in two places and they must match:

- `src/components/sections/hero.tsx` — the `viewBox` and `preserveAspectRatio`
  on the mobile `<MapArt>`;
- `MOBILE_MAP_CROP` in `src/components/journey/route-journey.tsx` — the same
  numbers, used to project the route onto the drawn roads.

Change one without the other and the red line drifts off the streets.

The portrait crop only behaves while the hero is tall and narrow, so it is
scoped to under 768px. Tablets keep the desktop framing as a full-bleed
backdrop and the route stays in its gutter.

`npm run contrast` screenshots the hero at 360/390/430 and measures real
pixels behind each line of text. It skips labels too small to separate glyphs
from background — for those, check the colour pair by hand.

Anyone with "reduce motion" enabled gets the finished route drawn statically and
no scroll-linked animation at all.

---

## Content that is still placeholder

Tracked with `TODO:` comments in the source, and listed in the handover summary:

- `src/lib/site.ts` — domain, email address, postal address, opening hours.
- `data/pricing.ts` — four `TODO_PRICE` entries, and the unset `transmission`
  field.
- `data/testimonials.json` — six placeholder reviews.
- `src/app/privacy/page.tsx`, `terms/page.tsx`, `accessibility/page.tsx` —
  plain-English drafts, not legal advice.

Nothing on the site invents a price, a review, a pass rate, a student count or
a number of years in business.

The instructor is described as a **DVSA-approved instructor (ADI)** throughout.
Do not change that to "examiner": examiners are DVSA staff who conduct tests,
and claiming it would be misleading advertising.
