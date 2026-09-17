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

export const site = {
  name: "L_4NOW Driving School",
  /** Who the WhatsApp messages are addressed to. */
  instructor: "Kais",
  shortName: "L_4NOW",
  legalName: "L_4NOW Driving School",
  tagline: "Learn • Practice • Succeed",
  description:
    "Patient, practical driving lessons. Progress at your pace, from your first turn to test day.",
  url: "https://l4now.com",
  locale: "en_GB",

  contact: {
    // The WhatsApp number itself lives in src/lib/whatsapp.ts.
    phoneDisplay: WHATSAPP_DISPLAY,
    phoneHref: `tel:+${WHATSAPP_NUMBER}`,
    /**
     * Set this and the email row appears everywhere on its own; left null,
     * nothing publishes a mailto: link to an address that does not exist.
     */
    email: "qdugesh@gmail.com" as string | null,
    instagram: { handle: "@L_4now", url: "https://www.instagram.com/l_4now" },
    address: {
      line1: "30 Carlton Road",
      city: "Manchester",
      postcode: "M16 8LN",
    },
  },

  hours: [{ days: "Monday – Sunday", time: "06:00 – 16:00" }],

  /**
   * Facts shown under the hero buttons. Deliberately not a restatement of the
   * journey — the map pins and "How it works" cover that.
   */
  trustSignals: [
    "DVSA-approved instructor (ADI)",
    "Manual lessons",
    "Pick-up and drop-off included",
  ],

  /** One line instead of a coverage table. */
  coverage:
    "Manchester based, with pick-up and drop-off inside Manchester included.",

  /** The centres we teach towards, and know the routes around. */
  testCentres: ["West Didsbury", "Cheetham Hill", "Sale", "Bredbury"],

  /** The three stages the route travels through. */
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
      a: "🚗 New to driving? The average learner needs around 40–50 hours of professional tuition. Every learner is different, though — you could need fewer or more, depending on your progress, your confidence and how much you practise between lessons.",
      outro:
        "We will assess your progress throughout and tailor your lessons to what you need.",
    },
    {
      q: "Do you teach automatic?",
      a: "Not at the moment. We specialise in manual driving lessons, and learning manual gives you:",
      bullets: [
        "💷 Cheaper lesson fees than many automatic lessons",
        "🚗 Freedom to drive both manual and automatic cars once you pass",
        "💰 More affordable options when buying or hiring a car",
        "🌍 More flexibility when driving abroad",
        "🔑 Generally lower costs and more choice with a manual licence",
      ],
      outro: "Learn manual. Keep your options open.",
    },
    {
      q: "Which test centre will I use?",
      a: "We cover West Didsbury, Cheetham Hill, Sale and Bredbury.",
    },
    {
      q: "What happens in the first lesson?",
      a: "We start somewhere quiet, go through the controls at a standstill, then move away and stop a few times. There is no expectation beyond that.",
    },
    {
      q: "How much do lessons cost?",
      a: "A first lesson is £32 an hour, down from £35. After that lessons are £35 an hour, university students £33, refreshers from £35 and motorway lessons from £45. Everything is booked as a 1½ hour or 2 hour session, and we confirm the price when you enquire. Pay by bank transfer or cash once the lesson is agreed on WhatsApp, with no deposit.",
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
    lessonTypes: [
      "First lesson",
      "Beginner",
      "University student",
      "Refresher",
      "Test prep",
      "Motorway",
      "Intensive course",
      "Gift voucher",
    ],
    /** Every lesson is booked as one of these. Prices match data/pricing.ts. */
    lessonLengths: ["1½ hours", "2 hours"],
    timeSlots: [
      "Early morning (06:00 – 09:00)",
      "Morning (09:00 – 12:00)",
      "Afternoon (12:00 – 16:00)",
      "Weekend",
    ],
  },
} as const;
