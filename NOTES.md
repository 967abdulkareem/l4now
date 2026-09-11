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
  `<Lanes>` wrapper or tighten `gap-x-14` on the course grid, the route will
  have nowhere to go.
- `npm run audit` checks this automatically at seven widths.

Anyone with "reduce motion" enabled gets the finished route drawn statically and
no scroll-linked animation at all.

---

## Content that is still placeholder

Tracked with `TODO:` comments in the source, and listed in the handover summary:

- `src/lib/site.ts` — domain, email address, postal address, coverage areas and
  postcodes, course prices (deliberately blank, shown as "Price to be
  confirmed"), opening hours.
- `data/testimonials.json` — six placeholder reviews.
- `assets/logo-source.jpg` — the supplied artwork has not been added yet, so the
  built-in SVG mark is used.
- `src/app/privacy/page.tsx`, `terms/page.tsx`, `accessibility/page.tsx` —
  plain-English drafts, not legal advice.

Nothing on the site invents a price, a review, a pass rate or a qualification.
