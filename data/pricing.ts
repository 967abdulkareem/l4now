/**
 * Every price on the site. Change the figures here — the layout reads from
 * this file and needs no edits.
 *
 * ── Removing the intro offer ────────────────────────────────────────────────
 * Delete the `originalPrice` and `badge` fields from the "first-lesson" entry.
 * The card then shows £30 as a plain price, with no strike-through and no
 * "Intro offer" flag. Nothing else needs touching.
 *
 * ── Prices still to confirm ────────────────────────────────────────────────
 * Any entry whose `price` is exactly TODO_PRICE renders an "Ask us" button
 * that opens WhatsApp with the package name pre-filled, instead of a blank or
 * broken figure. Replace the value with a string like "£450" when known.
 *
 * ── Adding automatic transmission ──────────────────────────────────────────
 * Whether automatic is offered, and at what rate, is not confirmed. The
 * `transmission` field exists for it and is deliberately unset everywhere —
 * with it unset a card says nothing about gearbox, which is the honest
 * default.
 *
 * To offer both, either:
 *   a) set `transmission: "manual"` on the existing lesson entries and add
 *      matching entries with `transmission: "automatic"` and their own price;
 *      or
 *   b) if the rate is identical, set `transmission: "both"` on the entry and
 *      the card will say it covers manual and automatic.
 */

/** Sentinel for a price that has not been supplied yet. */
export const TODO_PRICE = "TODO_PRICE";

export type Transmission = "manual" | "automatic" | "both";

export type PriceItem = {
  id: string;
  name: string;
  subtitle: string;
  /** A display string like "£37", or TODO_PRICE while unconfirmed. */
  price: string;
  /** What the price is per — "per hour", "one-off", etc. */
  unit: string;
  transmission?: Transmission;
  badge?: string;
  /** Struck through next to `price`. Only set when there is a real discount. */
  originalPrice?: string;
  note: string;
  ctaLabel: string;
};

export const pricing: PriceItem[] = [
  {
    id: "first-lesson",
    name: "First lesson",
    subtitle: "Your introduction to the road",
    price: "£30",
    unit: "per hour",
    badge: "Intro offer",
    originalPrice: "£37",
    note: "One hour with a DVSA-approved instructor (ADI), in a dual-controlled car. Somewhere quiet to start, and no pressure to book anything further.",
    ctaLabel: "Book your first lesson",
  },
  {
    id: "standard-lesson",
    name: "Standard lesson",
    subtitle: "Pay as you go",
    price: "£37",
    unit: "per hour",
    note: "Book one at a time or several in a week. Pick-up and drop-off are included, and you keep the same instructor throughout.",
    ctaLabel: "Book a lesson",
  },
  {
    id: "standard-course",
    name: "Standard course",
    subtitle: "2–4 hours a week",
    price: TODO_PRICE,
    unit: "per course",
    note: "A steady weekly rhythm, which is how most learners build habits that stick. Length is set with you once we know where you are starting from.",
    ctaLabel: "Ask us about the course",
  },
  {
    id: "intensive-course",
    name: "Intensive course",
    subtitle: "6–8 hours a week",
    price: TODO_PRICE,
    unit: "per course",
    note: "For a test date that is close, or time off work to use. Demanding, and not right for everyone — we will say so if it is not right for you.",
    ctaLabel: "Ask us about intensives",
  },
  {
    id: "theory",
    name: "Theory & hazard perception",
    subtitle: "Preparation away from the wheel",
    price: TODO_PRICE,
    unit: "per session",
    note: "Working through the theory question bank and hazard-perception clips together, so the test is not the first time you meet them.",
    ctaLabel: "Ask us about theory",
  },
  {
    id: "test-day-car",
    name: "Test day car hire",
    subtitle: "Use our car for your test",
    price: "£100",
    unit: "one-off",
    note: "The car you learned in, on the day it matters, with a warm-up drive beforehand. Subject to availability on your test date.",
    ctaLabel: "Ask about test day",
  },
];

/** Small print shown under the grid. */
export const pricingNote =
  "Prices may vary by area and availability. Confirmed when you book.";
