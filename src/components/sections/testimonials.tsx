"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import testimonials from "@data/testimonials.json";
import { MOTION, SplitText, gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/lib/site";

type Testimonial = {
  name: string;
  photo?: string;
  quote: string;
  rating?: number;
  passedDate?: string;
};

const items = testimonials as Testimonial[];

/** Long enough to read two sentences without hurrying. */
const INTERVAL = 7;

/** Swipe distance, in px, before it counts as a deliberate gesture. */
const SWIPE = 45;

/** Circumference of the r=19 timer ring, for the dash maths. */
const RING = 2 * Math.PI * 19;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The reviews, set as a large pull quote rather than a card.
 *
 * Two decisions worth keeping:
 *
 * 1. The quote is the section. A driving school lives on what its students
 *    say, so the words are set in the display face at reading size and given
 *    the width of the page, instead of being boxed into a tile.
 * 2. The autoplay timer is drawn. The ring around the pause button fills over
 *    the seven seconds before the next review, so the control shows the clock
 *    it governs — and pressing it visibly stops that clock. WCAG 2.2.2 asks
 *    for a way to pause; this makes the thing being paused legible.
 */
export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [held, setHeld] = useState(false);
  const [reduced, setReduced] = useState(false);

  const scope = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const touchX = useRef<number | null>(null);
  const first = useRef(true);

  const count = items.length;
  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  // Autoplay is off by default when the visitor asks for reduced motion.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduced(mq.matches);
      if (mq.matches) setPlaying(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Keep the next image warm so a review with a photo never shows a blank.
  useEffect(() => {
    const next = items[(index + 1) % count]?.photo;
    if (!next) return;
    const img = new Image();
    img.src = next;
  }, [index, count]);

  /**
   * The timer ring *is* the autoplay clock: when it completes, the slideshow
   * advances. One tween, so the thing on screen and the thing driving the
   * carousel cannot drift apart, and pausing is `tween.pause()` rather than a
   * separate interval to keep in sync.
   */
  useGSAP(
    () => {
      const ring = ringRef.current;
      if (!ring || reduced) return;

      const tween = gsap.fromTo(
        ring,
        { strokeDashoffset: RING },
        {
          strokeDashoffset: 0,
          duration: INTERVAL,
          ease: "none",
          onComplete: () => go(index + 1),
        },
      );
      if (!playing || held) tween.pause();
      return () => {
        tween.kill();
      };
    },
    // revertOnUpdate: without it the context is only cleaned up on unmount,
    // so every pause or slide change would leave the previous timer running
    // and the carousel would advance on a tween nobody can see.
    { dependencies: [index, playing, held, reduced, go], scope, revertOnUpdate: true },
  );

  /**
   * The slide change. Lines are masked by SplitText and rise into place, the
   * name follows, and the counter rolls — one timeline, so the order is read
   * as choreography rather than three things happening at once.
   */
  useGSAP(
    () => {
      const quote = quoteRef.current;
      if (!quote) return;

      // First paint is the page's own reveal; only changes are choreographed.
      if (first.current) {
        first.current = false;
        return;
      }

      if (reduced) {
        gsap.fromTo(
          [quote, metaRef.current],
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.25 },
        );
        return;
      }

      const split = SplitText.create(quote, { type: "lines", mask: "lines" });
      const tl = gsap
        .timeline({ defaults: { ease: MOTION.easeLong } })
        .from(
          split.lines,
          { yPercent: 110, duration: 0.85, stagger: 0.06 },
          0,
        )
        .from(
          metaRef.current,
          { y: 14, autoAlpha: 0, duration: 0.5, ease: MOTION.ease },
          0.18,
        )
        .from(
          countRef.current,
          { yPercent: -60, autoAlpha: 0, duration: 0.45, ease: MOTION.ease },
          0.1,
        );

      return () => {
        tl.kill();
        split.revert();
      };
    },
    { dependencies: [index, reduced], scope, revertOnUpdate: true },
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(index + 1);
    }
  };

  const current = items[index];
  const control =
    "grid size-10 place-items-center rounded-full border border-ink/12 bg-white text-ink transition-colors hover:border-ink/35 hover:text-brand";

  return (
    <section
      id="reviews"
      data-section="reviews"
      className="section-y border-t border-hairline"
    >
      <div className="shell" ref={scope}>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-6">
            <p data-anim-line className="eyebrow">
              Reviews
            </p>
            <h2
              data-anim-heading
              className="display mt-3 text-[clamp(1.9rem,4vw,2.7rem)]"
            >
              What our students say.
            </h2>
          </div>
          <p
            data-anim-line
            className="max-w-[30rem] text-[1.02rem] leading-[1.6] text-ink-soft lg:col-span-5 lg:col-start-8"
          >
            Passed with {site.shortName}? Send us a line on WhatsApp and we
            will add it here.
          </p>
        </div>

        {/* Add more reviews — with or without a photo — in
            /data/testimonials.json. */}
        <div
          data-anim-item
          role="region"
          aria-roledescription="carousel"
          aria-label="Student reviews"
          tabIndex={-1}
          onKeyDown={onKeyDown}
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
          onFocusCapture={() => setHeld(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setHeld(false);
            }
          }}
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > SWIPE) go(index + (dx < 0 ? 1 : -1));
            touchX.current = null;
          }}
          className="mt-14 border-t border-ink/12 pt-10 lg:mt-16"
        >
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Which review you are on, and who said it. */}
            <div className="lg:col-span-3">
              <p className="flex items-baseline gap-1 font-mono text-[0.95rem] tracking-[0.08em] text-muted-foreground">
                <span
                  ref={countRef}
                  className="inline-block text-[2.4rem] leading-none font-bold text-brand"
                >
                  {pad(index + 1)}
                </span>
                <span aria-hidden="true">/ {pad(count)}</span>
              </p>

              <div ref={metaRef} className="mt-6 flex items-center gap-3">
                {current.photo && (
                  /* Static export; photos are swapped by hand in the JSON. */
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={current.photo}
                    src={current.photo}
                    alt=""
                    width={96}
                    height={96}
                    decoding="async"
                    className="size-12 shrink-0 rounded-full border border-hairline object-cover"
                  />
                )}
                <span className="block">
                  <span className="block text-[1.05rem] font-bold text-ink">
                    {current.name}
                  </span>
                  {current.passedDate && (
                    <span className="mt-0.5 block text-[0.9rem] text-muted-foreground">
                      {current.passedDate}
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* The quote. Fixed height, so a long one never resizes the page. */}
            <div
              data-quote
              className="min-h-[16.5rem] sm:min-h-[15rem] lg:col-span-9 lg:min-h-[13rem]"
            >
              <blockquote
                ref={quoteRef}
                className="display line-clamp-10 text-[1.15rem] leading-[1.45] text-ink sm:line-clamp-8 sm:text-[1.3rem] lg:line-clamp-6 lg:text-[1.55rem] lg:leading-[1.38]"
              >
                <span className="text-brand">&ldquo;</span>
                {current.quote}
                <span className="text-brand">&rdquo;</span>
              </blockquote>
            </div>
          </div>

          {/* Politely announced, so a screen reader hears the change without
              the whole quote being re-read mid-sentence. */}
          <p aria-live="polite" className="sr-only">
            Review {index + 1} of {count}: {current.name}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            {/* Pause/play, wrapped in the timer it controls. */}
            <span className="relative grid size-12 place-items-center">
              <svg
                viewBox="0 0 44 44"
                aria-hidden="true"
                className="absolute inset-0 size-12 -rotate-90"
              >
                <circle
                  cx="22"
                  cy="22"
                  r="19"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-ink/10"
                />
                <circle
                  ref={ringRef}
                  cx="22"
                  cy="22"
                  r="19"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={RING}
                  strokeDashoffset={RING}
                  className="text-brand"
                />
              </svg>
              <button
                type="button"
                onClick={() => setPlaying((v) => !v)}
                aria-label={
                  playing ? "Pause review slideshow" : "Play review slideshow"
                }
                className="relative grid size-9 place-items-center rounded-full bg-white text-ink transition-colors hover:text-brand"
              >
                {playing ? (
                  <Pause className="size-4" aria-hidden="true" />
                ) : (
                  <Play className="size-4" aria-hidden="true" />
                )}
              </button>
            </span>

            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous review"
              className={control}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next review"
              className={control}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>

            <ul className="ml-1 hidden items-center gap-2 sm:flex">
              {items.map((item, i) => (
                <li key={`${item.name}-${i}`}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Show review ${i + 1} of ${count}`}
                    aria-current={i === index ? "true" : undefined}
                    className={`block h-2 rounded-full transition-[width,background-color] duration-300 ${
                      i === index
                        ? "w-7 bg-brand"
                        : "w-2 bg-ink/20 hover:bg-ink/40"
                    }`}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
