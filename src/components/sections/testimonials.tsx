"use client";

import { ChevronLeft, ChevronRight, Pause, Play, Star } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import testimonials from "@data/testimonials.json";
import { MOTION, gsap, useGSAP } from "@/lib/gsap";
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
const INTERVAL = 6500;

/** Swipe distance, in px, before it counts as a deliberate gesture. */
const SWIPE = 45;

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [held, setHeld] = useState(false);
  const [reduced, setReduced] = useState(false);

  const scope = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
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

  // The timer. Paused while the visitor is hovering, focused inside, or has
  // pressed pause — WCAG 2.2.2 wants all three to be possible.
  useEffect(() => {
    if (!playing || held) return;
    const id = window.setInterval(() => go(index + 1), INTERVAL);
    return () => window.clearInterval(id);
  }, [playing, held, index, go]);

  // Keep the next image warm so advancing never shows a blank frame.
  useEffect(() => {
    const next = items[(index + 1) % count]?.photo;
    if (!next) return;
    const img = new Image();
    img.src = next;
  }, [index, count]);

  // The slide change itself: photo and card arrive together but offset, so it
  // reads as choreography rather than a cut.
  useGSAP(
    () => {
      if (first.current) {
        first.current = false;
        return;
      }
      const targets = [photoRef.current, cardRef.current].filter(Boolean);
      if (!targets.length) return;

      if (reduced) {
        gsap.fromTo(targets, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 });
        return;
      }

      gsap
        .timeline({ defaults: { ease: MOTION.ease } })
        .fromTo(
          photoRef.current,
          { autoAlpha: 0, xPercent: 3 },
          { autoAlpha: 1, xPercent: 0, duration: 0.55 },
          0,
        )
        .fromTo(
          cardRef.current,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.55 },
          0.1,
        );
    },
    { dependencies: [index], scope },
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

        {/* TODO: replace with real photos + quotes in /data/testimonials.json */}
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
          className="mt-12"
        >
          {/* Fixed height, so a long quote never resizes the carousel. */}
          <div className="grid gap-5 sm:gap-6 lg:grid-cols-12 lg:items-stretch">
            <div
              ref={photoRef}
              className="relative overflow-hidden rounded-2xl border border-hairline bg-muted lg:col-span-5 lg:h-[23rem]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static
                  export; photos are swapped by hand in the JSON. */}
              <img
                key={current.photo}
                src={current.photo ?? "/assets/testimonials/placeholder-1.svg"}
                alt=""
                width={480}
                height={600}
                decoding="async"
                className="aspect-4/5 size-full object-cover sm:aspect-video lg:aspect-auto lg:h-full"
              />
            </div>

            <div
              ref={cardRef}
              className="card-surface flex min-h-[17rem] flex-col justify-between p-6 sm:min-h-[15rem] lg:col-span-7 lg:h-[23rem] lg:p-9"
            >
              <div>
                {typeof current.rating === "number" && (
                  <p
                    className="flex items-center gap-1 text-brand"
                    role="img"
                    aria-label={`${current.rating} out of 5`}
                  >
                    {Array.from({ length: 5 }, (_, s) => (
                      <Star
                        key={s}
                        aria-hidden="true"
                        className={`size-4 ${
                          s < current.rating! ? "fill-current" : "opacity-25"
                        }`}
                      />
                    ))}
                  </p>
                )}

                <blockquote className="mt-5 line-clamp-5 text-[1.08rem] leading-[1.6] text-ink sm:text-[1.2rem] lg:line-clamp-4 lg:text-[1.35rem] lg:leading-[1.5]">
                  &ldquo;{current.quote}&rdquo;
                </blockquote>
              </div>

              <footer className="mt-6 border-t border-hairline pt-5">
                <p className="text-[1rem] font-bold text-ink">{current.name}</p>
                {current.passedDate && (
                  <p className="mt-0.5 text-[0.9rem] text-muted-foreground">
                    {current.passedDate}
                  </p>
                )}
              </footer>
            </div>
          </div>

          {/* Politely announced, so a screen reader hears the change without
              the whole card being re-read mid-sentence. */}
          <p aria-live="polite" className="sr-only">
            Review {index + 1} of {count}: {current.name}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setPlaying((v) => !v)}
              aria-label={
                playing ? "Pause review slideshow" : "Play review slideshow"
              }
              className="grid size-10 place-items-center rounded-full border border-ink/12 bg-white text-ink transition-colors hover:border-ink/30"
            >
              {playing ? (
                <Pause className="size-4" aria-hidden="true" />
              ) : (
                <Play className="size-4" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous review"
              className="grid size-10 place-items-center rounded-full border border-ink/12 bg-white text-ink transition-colors hover:border-ink/30"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next review"
              className="grid size-10 place-items-center rounded-full border border-ink/12 bg-white text-ink transition-colors hover:border-ink/30"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>

            <ul className="ml-1 flex items-center gap-2">
              {items.map((item, i) => (
                <li key={`${item.name}-${i}`}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Show review ${i + 1} of ${count}`}
                    aria-current={i === index ? "true" : undefined}
                    className={`block h-2 rounded-full transition-[width,background-color] duration-300 ${
                      i === index
                        ? "w-6 bg-brand"
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
