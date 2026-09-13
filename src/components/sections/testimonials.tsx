"use client";

import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import testimonials from "@data/testimonials.json";
import { site } from "@/lib/site";

/**
 * Square photo tiles.
 *
 * Pointer devices reveal the quote as an overlay on hover/focus — revealing it
 * *below* would reflow the grid every time the cursor crossed a tile, so the
 * layout would jump under the mouse. Touch devices instead open a panel that
 * spans the full row beneath the tapped tile's row, so a two-column grid does
 * not tear apart.
 *
 * The quote is in the DOM and exposed to assistive technology in both states.
 */
type Testimonial = {
  name: string;
  photo?: string;
  quote: string;
  rating?: number;
};

/** Keeps a long quote from overflowing its tile. */
const MAX_QUOTE = 170;

/** Columns in the touch layout, which is the only one that opens a panel. */
const TOUCH_COLUMNS = 2;

const trim = (text: string) =>
  text.length > MAX_QUOTE ? `${text.slice(0, MAX_QUOTE).trimEnd()}…` : text;

const items = testimonials as Testimonial[];

/**
 * True on devices that can hover with a fine pointer. Decided in JS rather
 * than CSS so the two behaviours are mutually exclusive and testable — and so
 * a touchscreen laptop gets the tap panel regardless of how wide it is.
 */
function useCanHover() {
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return canHover;
}

export function Testimonials() {
  const [open, setOpen] = useState<number | null>(null);
  const panelRef = useRef<HTMLLIElement>(null);
  const canHover = useCanHover();

  const toggle = (index: number) => {
    const next = open === index ? null : index;
    setOpen(next);
    if (next === null) return;
    // `block: "nearest"` scrolls only if the panel would sit off-screen, so an
    // already-visible quote does not yank the page around.
    requestAnimationFrame(() =>
      panelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      }),
    );
  };

  // The panel goes after the last tile of the open tile's row, so it spans the
  // full width without splitting the grid.
  const panelAfter =
    open === null || canHover
      ? -1
      : Math.min(
          Math.floor(open / TOUCH_COLUMNS) * TOUCH_COLUMNS +
            (TOUCH_COLUMNS - 1),
          items.length - 1,
        );

  return (
    <section
      id="reviews"
      className="scroll-mt-24 border-t border-hairline py-16 lg:py-24"
    >
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="eyebrow" data-reveal>
              Reviews
            </p>
            <h2
              className="display mt-3 text-[clamp(1.9rem,4vw,2.7rem)]"
              data-reveal
            >
              What our students say.
            </h2>
          </div>
          <p
            className="max-w-[34rem] text-[1.02rem] leading-[1.6] text-ink-soft lg:col-span-6 lg:col-start-7 lg:self-end"
            data-reveal
          >
            Passed with {site.shortName}? Send us a line on WhatsApp and we will
            add it here.
          </p>
        </div>

        {/* TODO: replace with real photos + quotes in /data/testimonials.json */}
        <ul className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
          {items.map((item, i) => (
            <Tile
              key={`${item.name}-${i}`}
              item={item}
              index={i}
              isOpen={open === i}
              canHover={canHover}
              onToggle={() => toggle(i)}
              trailing={
                i === panelAfter && open !== null ? (
                  <li
                    ref={panelRef}
                    id={`review-panel-${open}`}
                    data-quote-panel
                    className="col-span-2 rounded-2xl border border-hairline bg-white p-5"
                  >
                    <p className="text-[1rem] leading-[1.62] text-ink-soft">
                      &ldquo;{trim(items[open].quote)}&rdquo;
                    </p>
                    <p className="mt-3 text-[0.88rem] font-semibold text-ink">
                      {items[open].name}
                    </p>
                  </li>
                ) : null
              }
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function Tile({
  item,
  index,
  isOpen,
  canHover,
  onToggle,
  trailing,
}: {
  item: Testimonial;
  index: number;
  isOpen: boolean;
  canHover: boolean;
  onToggle: () => void;
  trailing: React.ReactNode;
}) {
  const photo = item.photo ?? "/assets/testimonials/placeholder-1.svg";
  // Held in state rather than left to a CSS hover variant, so the reveal is
  // explicit and behaves identically for mouse and keyboard.
  const [active, setActive] = useState(false);

  return (
    <>
      <li
        data-tile
        style={{ ["--tile-delay" as string]: `${(index % 3) * 60}ms` }}
        className="group"
      >
        <button
          type="button"
          onClick={onToggle}
          onMouseEnter={() => setActive(true)}
          onMouseLeave={() => setActive(false)}
          onFocus={() => setActive(true)}
          onBlur={() => setActive(false)}
          aria-expanded={isOpen}
          aria-controls={`review-panel-${index}`}
          className="relative block aspect-square w-full overflow-hidden rounded-2xl border border-hairline bg-muted text-left"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static
              export has no optimiser; photos are swapped by hand in the JSON. */}
          <img
            src={photo}
            alt=""
            width={480}
            height={480}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />

          {/* Name, always visible, over a scrim. */}
          <span className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(17,17,17,0.8),rgba(17,17,17,0))] p-3 pt-10">
            <span className="block text-[0.95rem] font-bold text-white">
              {item.name}
            </span>
            {typeof item.rating === "number" && (
              <span
                className="mt-0.5 flex items-center gap-0.5 text-white"
                role="img"
                aria-label={`${item.rating} out of 5`}
              >
                {Array.from({ length: 5 }, (_, s) => (
                  <Star
                    key={s}
                    aria-hidden="true"
                    className={`size-3 ${
                      s < item.rating! ? "fill-current" : "opacity-40"
                    }`}
                  />
                ))}
              </span>
            )}
          </span>

          {/* Pointer devices: the quote covers the photo on hover/focus. No
              reflow, so the grid never moves under the cursor. */}
          {canHover && (
            <span
              data-quote-overlay
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 flex flex-col justify-center bg-[rgba(17,17,17,0.88)] p-5 transition-opacity duration-300 ${
                active ? "opacity-100" : "opacity-0"
              }`}
            >
              <span className="text-[0.95rem] leading-[1.55] text-white">
                &ldquo;{trim(item.quote)}&rdquo;
              </span>
              <span className="mt-3 text-[0.85rem] font-semibold text-white/75">
                {item.name}
              </span>
            </span>
          )}

          {/* Readable by a screen reader whatever is shown visually. */}
          <span className="sr-only">{item.quote}</span>
        </button>
      </li>
      {trailing}
    </>
  );
}
