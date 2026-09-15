"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import testimonials from "@data/testimonials.json";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/lib/site";

type Testimonial = {
  name: string;
  photo?: string;
  quote: string;
  rating?: number;
  passedDate?: string;
};

const items = testimonials as Testimonial[];
const count = items.length;

/** Long enough to read the opening of a review without hurrying. */
const INTERVAL = 7;

/** Swipe distance, in px, before it counts as a deliberate gesture. */
const SWIPE = 45;

/** Circumference of the r=19 timer ring, for the dash maths. */
const RING = 2 * Math.PI * 19;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Reviews are long — up to 800 characters — so each one is read as a headline
 * and the rest. The first sentence is nearly always the verdict ("I passed
 * first time", "one of the best instructors out there"), which is exactly
 * what belongs in display type; the detail underneath is for whoever is
 * still reading.
 */
function splitQuote(quote: string) {
  const at = /[.!?]\s/.exec(quote.slice(28));
  if (!at) return { lead: quote, rest: "" };
  const cut = 28 + at.index + 1;
  return { lead: quote.slice(0, cut).trim(), rest: quote.slice(cut).trim() };
}

/** Signed distance from the current slide, wrapped the short way round. */
function offsetFrom(i: number, index: number) {
  const raw = i - index;
  if (raw > count / 2) return raw - count;
  if (raw < -count / 2) return raw + count;
  return raw;
}

/**
 * The reviews, as a deck: the current one square on, its neighbours turned
 * away to either side.
 *
 * Why a deck rather than one card at a time: twenty-one people have written
 * in, and a single card hides that. Seeing the stack continue past both edges
 * says there is more here than the one you are reading, which is the whole
 * point of the section.
 *
 * The autoplay timer is drawn as a ring around the pause button, and that
 * tween *is* the clock — when it fills, the deck turns. WCAG 2.2.2 asks for a
 * way to pause anything that moves on its own; drawing the timer makes the
 * thing being paused legible rather than invisible.
 */
export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [held, setHeld] = useState(false);
  const [reduced, setReduced] = useState(false);

  const scope = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLUListElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [],
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

  /**
   * The deck itself. Every card is placed by the same function, so the
   * arrangement is one rule rather than a set of special cases, and a card
   * that has just moved from the far edge to the near one animates the same
   * way as any other.
   */
  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-review-card]");
      if (!cards.length) return;

      const mm = gsap.matchMedia();

      const place = (near: number, far: number, visible: number) => () => {
        cards.forEach((card, i) => {
          const off = offsetFrom(i, index);
          const away = Math.abs(off);
          const shown = away <= visible;
          // Absolute offsets, not a multiple: the second card sits just
          // beyond the first, and multiplying would throw it off screen.
          const step = away === 0 ? 0 : away === 1 ? near : far;

          const to = {
            xPercent: -50 + Math.sign(off) * step,
            y: away * 16,
            scale: away === 0 ? 1 : away === 1 ? 0.88 : 0.78,
            rotationY: off === 0 ? 0 : Math.sign(off) * -16,
            autoAlpha: shown ? (away === 0 ? 1 : away === 1 ? 0.62 : 0.28) : 0,
            zIndex: 10 - away,
            duration: 0.75,
            ease: "power3.out",
            overwrite: "auto" as const,
          };

          card.style.pointerEvents = away === 0 || !shown ? "none" : "auto";
          if (reduced) {
            gsap.set(card, { ...to, duration: 0 });
          } else {
            gsap.to(card, to);
          }
        });
      };

      // Phones show one card with the next two just breaking the edge;
      // wide screens have room for the full spread.
      mm.add("(max-width: 767px)", place(64, 112, 2));
      mm.add("(min-width: 768px)", place(84, 158, 2));

      if (!reduced && countRef.current) {
        gsap.from(countRef.current, {
          yPercent: -55,
          autoAlpha: 0,
          duration: 0.45,
          ease: "power3.out",
        });
      }

      return () => mm.revert();
    },
    { dependencies: [index, reduced], scope, revertOnUpdate: true },
  );

  /**
   * The timer ring *is* the autoplay clock: when it completes, the deck
   * turns. One tween, so the thing on screen and the thing driving the
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
    // so every pause would leave the previous timer running and the deck
    // would turn on a tween nobody can see.
    {
      dependencies: [index, playing, held, reduced, go],
      scope,
      revertOnUpdate: true,
    },
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
    "grid size-10 place-items-center rounded-full border border-ink/15 bg-white text-ink transition-colors hover:border-ink/40 hover:text-brand";

  return (
    <section
      id="reviews"
      data-section="reviews"
      className="section-y overflow-hidden border-t border-hairline"
    >
      <div className="shell" ref={scope}>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-7">
            <p data-anim-line className="eyebrow">
              Student reviews
            </p>
            <h2
              data-anim-heading
              className="display mt-3 text-[clamp(2rem,4.6vw,3.1rem)]"
            >
              What our students say<span className="text-brand">.</span>
            </h2>
            <p
              data-anim-line
              className="mt-4 max-w-[32rem] text-[1.02rem] leading-[1.6] text-ink-soft"
            >
              Real words from people who learned here. Passed with{" "}
              {site.shortName}? Send us a line on WhatsApp and we will add
              yours.
            </p>
          </div>

          {/* A count, not a score: nobody has been asked to leave a rating,
              so there is no average to publish. */}
          <p
            data-anim-line
            className="flex items-baseline gap-2 lg:col-span-4 lg:col-start-9 lg:justify-end"
          >
            <span className="display text-[2.6rem] leading-none text-brand">
              {count}
            </span>
            <span className="text-[0.95rem] text-muted-foreground">
              reviews, in their own words
            </span>
          </p>
        </div>

        {/* Add more reviews in /data/testimonials.json. */}
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
          className="mt-12 lg:mt-14"
        >
          {/* Fixed height: the deck must not resize the page as it turns. */}
          <ul
            ref={stage}
            data-quote
            className="relative h-[27rem] [perspective:1400px] sm:h-[25rem]"
          >
            {items.map((item, i) => {
              const { lead, rest } = splitQuote(item.quote);
              const isCurrent = i === index;

              return (
                <li
                  key={`${item.name}-${i}`}
                  data-review-card
                  aria-hidden={!isCurrent}
                  onClick={isCurrent ? undefined : () => go(i)}
                  className={`card-surface absolute top-0 left-1/2 flex h-full w-[min(21rem,78vw)] flex-col overflow-hidden p-6 will-change-transform sm:w-[22rem] lg:p-8 ${
                    isCurrent
                      ? "shadow-[0_28px_60px_-40px_rgb(17_17_17/0.55)]"
                      : "cursor-pointer"
                  }`}
                >
                  <blockquote className="display line-clamp-4 text-[1.22rem] leading-[1.32] text-ink lg:text-[1.34rem]">
                    <span className="text-brand">&ldquo;</span>
                    {lead}
                    <span className="text-brand">&rdquo;</span>
                  </blockquote>

                  {/* The clamp has to own the box it is clamping: `flex-1`
                      on the paragraph itself stretches the -webkit-box past
                      its own line limit and the text is cut mid-line. */}
                  <div className="mt-4 min-h-0 flex-1 overflow-hidden">
                    {rest && (
                      <p className="line-clamp-6 text-[0.95rem] leading-[1.6] text-ink-soft">
                        {rest}
                      </p>
                    )}
                  </div>

                  <footer className="mt-6 border-t border-hairline pt-4">
                    <p className="text-[1rem] font-bold text-ink">
                      &mdash; {item.name}
                    </p>
                    {item.passedDate && (
                      <p className="mt-2 inline-block rounded-full border border-brand/30 px-3 py-1 text-[0.78rem] font-medium text-brand">
                        {item.passedDate}
                      </p>
                    )}
                  </footer>
                </li>
              );
            })}
          </ul>

          {/* Politely announced, so a screen reader hears the change without
              the whole review being re-read mid-sentence. */}
          <p aria-live="polite" className="sr-only">
            Review {index + 1} of {count}: {current.name}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
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

            <p className="font-mono text-[0.9rem] tracking-[0.08em] text-muted-foreground tabular-nums">
              <span ref={countRef} className="inline-block font-bold text-ink">
                {pad(index + 1)}
              </span>{" "}
              / {pad(count)}
            </p>

            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next review"
              className={control}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>

            <ul className="ml-2 hidden items-center gap-1.5 sm:flex">
              {items.map((item, i) => (
                <li key={`dot-${item.name}-${i}`}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Show review ${i + 1} of ${count}`}
                    aria-current={i === index ? "true" : undefined}
                    className={`block h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                      i === index
                        ? "w-6 bg-brand"
                        : "w-1.5 bg-ink/20 hover:bg-ink/45"
                    }`}
                  />
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-5 text-center text-[0.78rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Swipe, or pick a card either side
          </p>
        </div>
      </div>
    </section>
  );
}
