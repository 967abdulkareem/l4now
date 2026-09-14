/**
 * Single source of truth for business details.
 *
 * PLACEHOLDER DATA — everything here is safe to publish but none of it is real.
 * Replace the values in this file before going live; nothing else in the
 * codebase hardcodes them.
 *
 * Nothing in this file invents a price, a discount, a review, a qualification
 * or a pass rate. Where a real figure is needed, the copy says so.
 */

import { WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from "./whatsapp";

/** Shown wherever a price has not been supplied yet. */
export const PRICE_TBC = "Price to be confirmed";

export const site = {
  name: "L_4NOW Driving School",
  shortName: "L_4NOW",
  legalName: "L_4NOW Driving School",
  tagline: "Learn • Practice • Succeed",
  description:
    "Patient, practical driving lessons. Progress at your pace, from your first turn to test day.",
  // TODO: replace with the live domain once it is registered.
  url: "https://l4now.example",
  locale: "en_GB",

  contact: {
    // The WhatsApp number itself lives in src/lib/whatsapp.ts.
    phoneDisplay: WHATSAPP_DISPLAY,
    phoneHref: `tel:+${WHATSAPP_NUMBER}`,
    /**
     * TODO_EMAIL — set this to the real address and the email row appears
     * everywhere on its own. Left null so nothing publishes a mailto: link
     * to an address that does not exist.
     */
    email: null as string | null,
    address: {
      // TODO: replace with the real address, or delete the block and the
      // footer <address> that renders it.
      line1: "Address line 1",
      line2: "Address line 2",
      city: "Town",
      postcode: "POSTCODE",
    },
  },

  hours: [{ days: "Monday – Sunday", time: "06:00 – 16:00" }],

  /**
   * Facts shown under the hero buttons. Deliberately not a restatement of the
   * journey — the map pins and "How it works" cover that.
   */
  trustSignals: [
    "DVSA-approved instructor (ADI)",
    "Manual & automatic",
    "Pick-up and drop-off included",
  ],

  /**
   * One line instead of a coverage table. No test centre is named: learners
   * book the centre that suits them and we teach towards it.
   */
  coverage:
    "Lessons across Manchester and the surrounding areas, with pick-up and drop-off included. You choose your test centre and we prepare you for it.",

  /**
   * The courses the GPS route travels past. `price` is deliberately null
   * until real figures are supplied — the card then reads "Price to be
   * confirmed" rather than inventing one.
   */
  courses: [
    {
      id: "first-lesson",
      icon: "user",
      name: "First lesson",
      summary:
        "Get a feel for the road and see how it goes. A relaxed introduction with a professional instructor, at your pace.",
      price: null as string | null,
      unit: null as string | null,
      popular: false,
      points: [
        "Dual-controlled car",
        "A quiet route to start on",
        "No experience needed",
      ],
    },
    {
      id: "build-confidence",
      icon: "chart",
      name: "Build confidence",
      summary:
        "Develop your skills step by step with structured lessons. Gain independence, improve your technique and feel more at ease on the road.",
      price: null as string | null,
      unit: null as string | null,
      popular: true,
      /**
       * Left null on purpose. Set it (e.g. "Most booked") only once there is
       * evidence for the claim; the card shows a plain accent rule until then.
       */
      popularLabel: null as string | null,
      points: [
        "Manual or automatic",
        "Junctions, roundabouts and town traffic",
        "Progress reviewed each lesson",
      ],
    },
    {
      id: "test-preparation",
      icon: "target",
      name: "Test preparation",
      summary:
        "Focus on the skills, knowledge and confidence you need for your driving test. Tailored lessons to help you arrive ready.",
      price: null as string | null,
      unit: null as string | null,
      popular: false,
      points: [
        "Mock tests on local routes",
        "Manoeuvres and independent driving",
        "Test-day planning",
      ],
    },
  ],

  /** The three stages, shown as a compact strip under the hero. */
  steps: [
    {
      id: "basics",
      step: "01",
      title: "Start with the basics",
      body: "Quiet roads and as long as you need. Controls, clutch and moving away, until it feels ordinary.",
    },
    {
      id: "confidence",
      step: "02",
      title: "Build road confidence",
      body: "Junctions, roundabouts and town traffic — one new road type at a time, so nothing arrives as a surprise.",
    },
    {
      id: "test",
      step: "03",
      title: "Prepare for your test",
      body: "Mock tests, independent driving and manoeuvres worked through until you know you are ready.",
    },
  ],

  faqs: [
    {
      q: "How many lessons will I need?",
      a: "It depends on how often you drive and how much private practice you get. We will give you an honest estimate after your first couple of lessons, and keep it updated as you go.",
    },
    {
      q: "Manual or automatic — which should I choose?",
      a: "Automatic is usually quicker to learn and fine if you never intend to drive a manual. A manual licence covers both. Either way the hourly rate is the same, so choose the one you want to drive — and if you are unsure, say so when you enquire and we will talk it through.",
    },
    {
      q: "Do you pick me up from home?",
      a: "Yes, anywhere across Manchester and the surrounding areas, at no extra cost. Home, work, college or the station — whatever is easiest that day.",
    },
    {
      q: "Which test centre will I use?",
      a: "Whichever one you want. You book the test, and we spend the lessons before it on the roads, junctions and manoeuvres that centre is known for.",
    },
    {
      q: "What happens in the first lesson?",
      a: "We start somewhere quiet, go through the controls at a standstill, then move away and stop a few times. There is no expectation beyond that.",
    },
    {
      q: "How much do lessons cost?",
      a: "Lessons are booked as sessions: 1½ hours at £53 or 2 hours at £70, which is about £35 an hour. Motorway lessons start at £40 an hour. Pay by bank transfer or cash once the lesson is agreed on WhatsApp, with no deposit.",
    },
    {
      q: "Can I use your car for the driving test?",
      a: "Ask when you enquire. We will confirm availability for your test date and what it involves.",
    },
    {
      q: "I am nervous. Is that a problem?",
      a: "It is the most common thing pupils tell us, and no, it is not a problem. Say so when you enquire and we will plan the first few lessons around it.",
    },
    {
      q: "How do I book?",
      a: "Send an enquiry through this site or ring us. We will confirm a time by phone — nothing is charged when you enquire.",
    },
  ],

  nav: [
    { label: "Lessons", href: "#pricing" },
    { label: "How it works", href: "#how" },
    { label: "Reviews", href: "#reviews" },
    { label: "FAQs", href: "#faqs" },
  ],

  legal: [
    { label: "Privacy policy", href: "/privacy" },
    { label: "Terms of service", href: "/terms" },
    { label: "Cancellation policy", href: "/terms#cancellations" },
    { label: "Accessibility", href: "/accessibility" },
  ],

  /** Options offered by the enquiry form. */
  booking: {
    lessonTypes: ["Beginner", "Refresher", "Test prep", "Motorway"],
    /** Every lesson is booked as one of these. Prices match data/pricing.ts. */
    lessonLengths: ["1½ hours — £53", "2 hours — £70"],
    timeSlots: [
      "Early morning (06:00 – 09:00)",
      "Morning (09:00 – 12:00)",
      "Afternoon (12:00 – 16:00)",
      "Weekend",
    ],
  },
} as const;
