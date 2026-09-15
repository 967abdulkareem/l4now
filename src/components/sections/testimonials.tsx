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

/** Movement, in px, before a press counts as a drag rather than a tap. */
const DRAG = 8;

/** A flick past this speed (cards per second) carries on to the next card. */
const FLICK = 1.1;

/** One settle of the rail. Long and eased, so it glides rather than snaps. */
const SETTLE = 0.85;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Reviews are long — up to 800 characters — so each is read as a verdict and
 * the detail. The first sentence is nearly always the verdict ("I passed
 * first time", "one of the best instructors out there"), which is what
 * belongs in display type; the rest follows underneath.
 */
function splitQuote(quote: string) {
  const at = /[.!?]\s/.exec(quote.slice(28));
  if (!at) return { lead: quote, rest: "" };
  const cut = 28 + at.index + 1;
  return { lead: quote.slice(0, cut).trim(), rest: quote.slice(cut).trim() };
}

/** Signed distance between two positions on the rail, the short way round. */
function shortest(delta: number) {
  const wrapped = ((delta % count) + count) % count;
  return wrapped > count / 2 ? wrapped - count : wrapped;
}

/**
 * The reviews, on a rail: the current one square on, the rest hanging either
 * side like coats pushed along a rod.
 *
 * The whole arrangement is a function of one number — `rail.v`, a fractional
 * position along the reviews. Buttons and keys tween that number; a drag sets
 * it straight from the pointer and then tweens it to the nearest whole one.
 * Because every card's x, scale, turn and opacity are derived from it
 * continuously, a half-finished drag looks exactly like a half-finished
 * tween, and no case has to be special-cased.
 *
 * Nothing moves on its own, so there is no autoplay to pause — the simplest
 * way to satisfy WCAG 2.2.2.
 */
export function Testimonials() {
  const [index, setIndex] = useState(0);
  /** Which review is opened out, if any — not a flag to reset on every move. */
  const [openAt, setOpenAt] = useState<number | null>(null);
  const [reduced, setReduced] = useState(false);

  const scope = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLUListElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  /** Fractional position along the rail. The single source of the layout. */
  const rail = useRef({ v: 0 });
  const place = useRef<(p: number) => void>(() => {});
  const settle = useRef<(to: number) => void>(() => {});

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

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-review-card]");
      if (!cards.length) return;

      /**
       * Where a card sits, given how far it is from the middle. Continuous in
       * `off`, so it describes a drag in progress as happily as a finished
       * one: the first card out either side moves a whole step, the ones past
       * it are compressed into what is left.
       */
      const position = (off: number) => {
        const away = Math.abs(off);
        const dir = Math.sign(off);
        const wide = window.innerWidth >= 768;
        const near = wide ? 84 : 64;
        const far = wide ? 158 : 112;
        const spread =
          away <= 1
            ? away * near
            : near + (Math.min(away, 2) - 1) * (far - near);

        return {
          xPercent: -50 + dir * spread,
          scale:
            1 - 0.12 * Math.min(away, 1) - 0.1 * gsap.utils.clamp(0, 1, away - 1),
          rotationY: -dir * 8 * Math.min(away, 2),
          autoAlpha:
            away >= 2.6
              ? 0
              : 1 -
                0.38 * Math.min(away, 1) -
                0.3 * gsap.utils.clamp(0, 1.6, away - 1),
          zIndex: 20 - Math.round(away * 2),
        };
      };

      place.current = (p: number) => {
        rail.current.v = p;
        cards.forEach((card, i) => {
          const off = shortest(i - p);
          gsap.set(card, position(off));
          // Cards you can see are cards you can grab or jump to; the rest are
          // out of the way of the pointer as well as the eye.
          card.style.pointerEvents = Math.abs(off) < 2.6 ? "auto" : "none";
        });
      };

      settle.current = (to: number) => {
        gsap.killTweensOf(rail.current);
        if (reduced) {
          place.current(to);
          go(Math.round(to));
          return;
        }
        gsap.to(rail.current, {
          v: to,
          duration: SETTLE,
          // inOut on both halves: the rail leaves and arrives at the same
          // unhurried speed, which is what makes a slide read as a slide
          // rather than a snap with a long tail.
          ease: "power2.inOut",
          onUpdate: () => place.current(rail.current.v),
          onComplete: () => go(Math.round(to)),
        });
      };

      place.current(rail.current.v);

      if (!reduced && countRef.current) {
        gsap.from(countRef.current, {
          yPercent: -45,
          autoAlpha: 0,
          duration: 0.6,
          ease: "power2.out",
        });
      }

      const onResize = () => place.current(rail.current.v);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    },
    { dependencies: [reduced], scope, revertOnUpdate: true },
  );

  // Buttons, dots and keys move the index; the rail follows the short way
  // round rather than unwinding through every card in between.
  useGSAP(
    () => {
      const target = rail.current.v + shortest(index - rail.current.v);
      if (Math.abs(target - rail.current.v) < 0.001) return;
      settle.current(target);
    },
    { dependencies: [index], scope },
  );

  /**
   * Drag. The rail follows the pointer one for one, so a half-swipe sits
   * half-way; let go and it finishes the movement you started.
   */
  const drag = useRef<{
    id: number;
    x: number;
    from: number;
    at: number;
    moved: boolean;
  } | null>(null);

  const cardWidth = () =>
    stage.current?.querySelector("[data-review-card]")?.clientWidth || 320;

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    gsap.killTweensOf(rail.current);
    drag.current = {
      id: e.pointerId,
      x: e.clientX,
      from: rail.current.v,
      at: performance.now(),
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < DRAG) return;
    if (!d.moved) {
      d.moved = true;
      e.currentTarget.setPointerCapture(d.id);
    }
    place.current(d.from - dx / cardWidth());
  };

  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    drag.current = null;
    if (!d.moved) return;

    const dx = e.clientX - d.x;
    const travelled = dx / cardWidth();
    const speed = (travelled / Math.max(16, performance.now() - d.at)) * 1000;

    // A flick is an instruction even when it barely moved; a slow drag ends
    // up wherever it was let go.
    const target =
      Math.abs(speed) > FLICK
        ? Math.round(d.from) - Math.sign(dx)
        : Math.round(rail.current.v);

    settle.current(target);
  };

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

        {/* Add more reviews in /data/testimonials.json. */}
        <div
          data-anim-item
          role="region"
          aria-roledescription="carousel"
          aria-label="Student reviews"
          tabIndex={-1}
          onKeyDown={onKeyDown}
          className="mt-12 lg:mt-14"
        >
          {/* Fixed height: the rail must not resize the page as it moves.
              `touch-pan-y` keeps the page scrollable through the cards while
              horizontal drags belong to the rail. */}
          <ul
            ref={stage}
            data-quote
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className="relative h-[27rem] touch-pan-y select-none [perspective:1400px] sm:h-[26rem] lg:h-[28rem]"
          >
            {items.map((item, i) => {
              const { lead, rest } = splitQuote(item.quote);
              const isCurrent = i === index;
              const open = openAt === i && isCurrent;

              return (
                <li
                  key={`${item.name}-${i}`}
                  data-review-card
                  aria-hidden={!isCurrent}
                  onClick={() => {
                    if (!isCurrent) go(i);
                  }}
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

                  {/* The clamp has to own the box it is clamping: `flex-1` on
                      the paragraph itself stretches the -webkit-box past its
                      own line limit and the text is cut mid-line. Opened, the
                      same box scrolls rather than growing, so a long review
                      can be read in full without the rail changing height. */}
                  <div
                    className={`mt-4 min-h-0 flex-1 ${
                      open ? "overflow-y-auto pr-1" : "overflow-hidden"
                    }`}
                    tabIndex={open ? 0 : -1}
                  >
                    {rest && (
                      <p
                        className={`text-[0.95rem] leading-[1.6] text-ink-soft ${
                          open ? "" : "line-clamp-5 lg:line-clamp-6"
                        }`}
                      >
                        {rest}
                      </p>
                    )}
                  </div>

                  <footer className="mt-4 border-t border-hairline pt-4">
                    {isCurrent && rest.length > 150 && (
                      <button
                        type="button"
                        onClick={() => setOpenAt(open ? null : i)}
                        aria-expanded={open}
                        className="mb-3 text-[0.85rem] font-semibold text-brand underline underline-offset-4 hover:text-ink"
                      >
                        {open ? "Show less" : "Read the full review"}
                      </button>
                    )}
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

            <ul data-dots className="ml-2 hidden items-center gap-1.5 sm:flex">
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
            Drag the cards, or use the arrows
          </p>
        </div>
      </div>
    </section>
  );
}
