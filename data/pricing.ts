/**
 * Every price on the site. Change the figures here — the layout reads from
 * this file and needs no edits.
 *
 * ── Lesson length ──────────────────────────────────────────────────────────
 * Lessons are sold as 1½ hour or 2 hour sessions. The cards quote the hourly
 * rate and name both lengths without pricing each one; the booking form asks
 * which length you want.
 *
 * ── Prices still to confirm ────────────────────────────────────────────────
 * Any entry whose `price` is exactly TODO_PRICE renders an "Ask us" button
 * that opens WhatsApp with the package name pre-filled, instead of a blank or
 * broken figure. Replace the value with a string like "£450" when known.
 *
 * ── Transmission ───────────────────────────────────────────────────────────
 * Manual only. The lesson entries say so on the card, so nobody books an
 * automatic lesson that cannot be given. Add "automatic" entries here if that
 * ever changes.
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
    price: "From £32",
    unit: "per hour",
    transmission: "manual",
    note: "Somewhere quiet to start, the controls at a standstill, then moving away and stopping a few times. No experience needed and no pressure to book anything further.",
    ctaLabel: "Book your first lesson",
  },
  {
    id: "driving-lessons",
    name: "Driving lessons",
    subtitle: "Every lesson after the first",
    price: "From £35",
    unit: "per hour",
    transmission: "manual",
    note: "Flexible times and lessons with a DVSA-approved instructor (ADI), in a dual-controlled car. Booked as a 1½ or 2 hour session, with pick-up and drop-off inside Manchester.",
    ctaLabel: "Book a lesson",
  },
  {
    id: "school-students",
    name: "School & college students",
    subtitle: "Learning around your timetable",
    price: "From £32",
    unit: "per hour",
    transmission: "manual",
    note: "For students still at school, sixth form or college: lessons fitted around the timetable, and the same rate whether you book one or several.",
    ctaLabel: "Ask about student lessons",
  },
  {
    id: "motorway",
    name: "Motorway lesson",
    subtitle: "Confidence at speed",
    price: "From £45",
    unit: "per hour",
    note: "Joining, lane discipline, overtaking and leaving at speed, in a dual-controlled car. Booked as a 1½ or 2 hour session like any other lesson.",
    ctaLabel: "Ask about motorway lessons",
  },
  {
    id: "refresher",
    name: "Refresher lesson",
    subtitle: "You already hold a licence",
    price: TODO_PRICE,
    unit: "per lesson",
    note: "For drivers who passed and then stopped, or who want one thing worked through — parking, roundabouts, a bigger car — without starting again from the beginning.",
    ctaLabel: "Ask about a refresher",
  },
  {
    id: "intensive-course",
    name: "Intensive course",
    subtitle: "A test date that is close",
    price: TODO_PRICE,
    unit: "per course",
    note: "Several lessons a week for a short stretch. Demanding, and not right for everyone — we will say so if it is not right for you.",
    ctaLabel: "Ask us about intensives",
  },
];

/** Small print shown under the grid. */
export const pricingNote =
  "Manual lessons, booked as 1½ hour or 2 hour sessions. Prices may vary by area and availability, and are confirmed when you book — pay by bank transfer or cash once the lesson is agreed, with no deposit.";
