"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
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

/** Swipe distance, in px, before it counts as a deliberate gesture. */
const SWIPE = 45;

/** One turn of the deck. Long and eased, so it settles rather than snaps. */
const TURN = 1.15;

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
 * Nothing moves on its own: the deck turns when the reader turns it, with
 * the arrows, the dots, a swipe or the arrow keys. That also means there is
 * no autoplay to pause, which is the simplest way to satisfy WCAG 2.2.2.
 */
export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);

  const scope = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLUListElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
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
            duration: TURN,
            // power2 rather than power3: the same distance covered with less
            // of it crammed into the first few frames, which is what makes a
            // turn feel slow and deliberate rather than merely long.
            ease: "power2.out",
            // The outer cards settle a beat after the middle one, so the deck
            // arrives as a group instead of snapping into place at once.
            delay: away * 0.05,
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
          yPercent: -45,
          autoAlpha: 0,
          duration: 0.6,
          ease: "power2.out",
        });
      }

      return () => mm.revert();
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
    "grid size-10 place-items-center rounded-full border border-ink/15 bg-white text-ink transition-colors hover:border-ink/40 hover:text-brand";

  return (
    <section
      id="reviews"
      data-section="reviews"
      className="section-y overflow-hidden border-t border-hairline"
    >
      <div className="shell" ref={scope}>
        <div className="max-w-[40rem]">
          <div>
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

        </div>

        {/* Add more reviews in /data/testimonials.json. */}
        <div
          data-anim-item
          role="region"
          aria-roledescription="carousel"
          aria-label="Student reviews"
          tabIndex={-1}
          onKeyDown={onKeyDown}
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
            className="relative h-[27rem] [perspective:1400px] sm:h-[26rem] lg:h-[28rem]"
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
                      <p className="line-clamp-5 text-[0.95rem] leading-[1.6] text-ink-soft lg:line-clamp-6">
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
