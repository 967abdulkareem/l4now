/**
 * Every price on the site. Change the figures here — the layout reads from
 * this file and needs no edits.
 *
 * ── Lesson length ──────────────────────────────────────────────────────────
 * Lessons are booked as 1½ hour or 2 hour sessions. The cards quote the
 * hourly rate and the booking form asks which length you want.
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
 *
 * ── The grid ───────────────────────────────────────────────────────────────
 * Six entries fill three rows of two on wide screens, and the seventh — the
 * gift voucher, `wide: true` — runs the full width underneath. The route's
 * weave threads the gutter of the first row. On phones every card is full
 * width and the order here is the order they are read in.
 */

/** Sentinel for a price that has not been supplied yet. */
export const TODO_PRICE = "TODO_PRICE";

export type Transmission = "manual" | "automatic" | "both";

export type PriceItem = {
  id: string;
  name: string;
  subtitle: string;
  /** A display string like "From £33", or TODO_PRICE while unconfirmed. */
  price: string;
  /** What the price is per — "per hour", "per course", "one-off". */
  unit: string;
  transmission?: Transmission;
  badge?: string;
  /** Struck through next to `price`. Only set when there is a real discount. */
  originalPrice?: string;
  note: string;
  /** Options a reader chooses between, when the card offers a choice. */
  bullets?: string[];
  /** Runs the full width of the grid, under the rows of two. */
  wide?: boolean;
  ctaLabel: string;
};

export const pricing: PriceItem[] = [
  {
    id: "first-lesson",
    name: "First lesson",
    subtitle: "Your introduction to the road",
    price: "£32",
    originalPrice: "£35",
    unit: "per hour",
    transmission: "manual",
    badge: "Intro offer",
    note: "Somewhere quiet to start, the controls at a standstill, then moving away and stopping a few times. No experience needed and no pressure to book anything further.",
    ctaLabel: "Book your first lesson",
  },
  {
    id: "driving-lessons",
    name: "Driving lessons for every level",
    subtitle: "From your first drive to test day",
    price: "£35",
    unit: "per hour",
    transmission: "manual",
    note: "Learn at your own pace with a fully qualified DVSA-approved ADI, in a dual-controlled car. Flexible lessons, a calm and friendly approach, and no pressure to book further lessons. From your first drive to test day, we will help you become a safe, confident driver.",
    ctaLabel: "Book a lesson",
  },
  {
    id: "student-discount",
    name: "University student discount",
    subtitle: "Lessons around your timetable",
    price: "From £33",
    unit: "per hour",
    transmission: "manual",
    note: "Affordable manual driving lessons designed around your university schedule, with flexible lesson times to suit you. DVSA-approved ADI, in a dual-controlled car.",
    ctaLabel: "Ask about student rates",
  },
  {
    id: "refresher",
    name: "Refresher lessons",
    subtitle: "Build confidence. Refresh your skills.",
    price: "From £35",
    unit: "per hour",
    transmission: "manual",
    note: "For drivers returning to driving or looking to improve specific skills, including city driving, parking manoeuvres, night driving, roundabouts and busy roads. Lessons are tailored to what you want to work on, with no pressure. DVSA-approved ADI, in a dual-controlled car.",
    ctaLabel: "Ask about a refresher",
  },
  {
    id: "motorway",
    name: "Motorway lessons",
    subtitle: "Build confidence at speed",
    price: "From £45",
    unit: "per hour",
    transmission: "manual",
    note: "Learn motorway driving in a dual-controlled car, including joining, lane discipline, overtaking and safe exits. Two-hour sessions available, tailored to your experience and confidence.",
    ctaLabel: "Ask about motorway lessons",
  },
  {
    id: "intensive-course",
    name: "Intensive course",
    subtitle: "6–8 hours per week",
    price: TODO_PRICE,
    unit: "per course",
    transmission: "manual",
    note: "Ideal for learners with a test date approaching or time available to focus on driving. Choose three or four 2-hour lessons per week. Focused and fast-paced, so it is not suitable for everyone — we will be honest if it is not right for you.",
    ctaLabel: "Ask us about intensives",
  },
  {
    id: "gift-voucher",
    name: "Driving lesson gift voucher",
    subtitle: "The perfect gift for a new driver",
    price: TODO_PRICE,
    unit: "per voucher",
    transmission: "manual",
    wide: true,
    note: "Give someone the gift of driving with a lesson package tailored to their experience and confidence. A great gift for birthdays, Christmas, or simply helping someone get started on the road. Qualified DVSA-approved ADI, in a dual-controlled car.",
    bullets: ["1 × 2-hour lesson", "2 × 2-hour lessons", "3 × 2-hour lessons"],
    ctaLabel: "Ask about gift vouchers",
  },
];

/**
 * Small print shown under the grid. The booking section spells out the terms
 * in full, so this says only what a reader needs while they are still
 * comparing cards.
 */
export const pricingNote =
  "Every lesson is manual, in a dual-controlled car, booked as a 1½ hour or 2 hour session.";
