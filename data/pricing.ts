/**
 * Every price on the site. Change the figures here — the layout reads from
 * this file and needs no edits.
 *
 * ── Lesson length ──────────────────────────────────────────────────────────
 * Lessons are sold as 1½ hour (£53) or 2 hour (£70) sessions, which is about
 * £35 an hour either way. The cards quote the hourly rate and name both
 * lengths; the booking form asks which one you want.
 *
 * ── Prices still to confirm ────────────────────────────────────────────────
 * Any entry whose `price` is exactly TODO_PRICE renders an "Ask us" button
 * that opens WhatsApp with the package name pre-filled, instead of a blank or
 * broken figure. Replace the value with a string like "£450" when known.
 *
 * ── Transmission ───────────────────────────────────────────────────────────
 * Manual and automatic are taught at the same rate, so the hourly entries
 * carry `transmission: "both"` and say so on the card. If the rates ever
 * diverge, split them into separate entries with "manual" and "automatic".
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
    id: "driving-lessons",
    name: "Driving lessons",
    subtitle: "Every lesson, every level",
    price: "From £35",
    unit: "per hour",
    transmission: "both",
    note: "Lessons run 1½ hours (£53) or 2 hours (£70) — long enough to drive somewhere worth driving. With a DVSA-approved instructor (ADI), in a dual-controlled car, pick-up and drop-off included.",
    ctaLabel: "Book a lesson",
  },
  {
    id: "motorway",
    name: "Motorway lesson",
    subtitle: "Confidence at speed",
    price: "From £40",
    unit: "per hour",
    note: "Joining, lane discipline, overtaking and leaving at speed, in a dual-controlled car. Booked as a 1½ or 2 hour session like any other lesson.",
    ctaLabel: "Ask about motorway lessons",
  },
  {
    id: "standard-lesson",
    name: "Standard lesson",
    subtitle: "Pay as you go",
    price: "£37",
    unit: "per hour",
    transmission: "both",
    note: "Booked as a 1½ hour (£53) or 2 hour (£70) session, one at a time or several in a week. Pick-up and drop-off are included, and you keep the same instructor throughout.",
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
  "Lessons are booked as 1½ hour or 2 hour sessions. Prices may vary by area and availability, and are confirmed when you book — pay by bank transfer or cash once the lesson is agreed, with no deposit.";
