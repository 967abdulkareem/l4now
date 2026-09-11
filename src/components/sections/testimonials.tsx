import { Star } from "lucide-react";

import testimonials from "@data/testimonials.json";
import { site } from "@/lib/site";

/**
 * Reads straight from /data/testimonials.json so the copy can be changed
 * without touching any layout code.
 */
type Testimonial = {
  name: string;
  photo?: string;
  quote: string;
  rating?: number;
};

/** Keeps a long quote from breaking the card grid. */
const MAX_QUOTE = 180;

const trim = (text: string) =>
  text.length > MAX_QUOTE ? `${text.slice(0, MAX_QUOTE).trimEnd()}…` : text;

export function Testimonials() {
  const items = testimonials as Testimonial[];

  return (
    <section
      id="reviews"
      className="scroll-mt-24 border-t border-hairline py-16 lg:py-24"
    >
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="eyebrow">Reviews</p>
            <h2 className="display mt-3 text-[clamp(1.9rem,4vw,2.7rem)]">
              What our students say.
            </h2>
          </div>
          <p className="max-w-[34rem] text-[1.02rem] leading-[1.6] text-ink-soft lg:col-span-6 lg:col-start-7 lg:self-end">
            Passed with {site.shortName}? Send us a line on WhatsApp and we will
            add it here.
          </p>
        </div>

        {/* TODO: replace testimonials in /data/testimonials.json with real ones */}
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <li
              key={`${item.name}-${i}`}
              className="card-surface flex flex-col p-6"
            >
              <div className="flex items-center gap-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element --
                    plain <img>: the photos are swapped by hand in the JSON and
                    the site is exported statically, so there is no optimiser. */}
                <img
                  src={item.photo ?? "/assets/testimonials/placeholder-1.png"}
                  alt=""
                  width={56}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  className="size-14 shrink-0 rounded-full border border-hairline object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-[1rem] font-bold text-ink">
                    {item.name}
                  </p>
                  {typeof item.rating === "number" && (
                    <p
                      className="mt-0.5 flex items-center gap-0.5 text-brand"
                      role="img"
                      aria-label={`${item.rating} out of 5`}
                    >
                      {Array.from({ length: 5 }, (_, s) => (
                        <Star
                          key={s}
                          aria-hidden="true"
                          className={`size-3.5 ${
                            s < item.rating! ? "fill-current" : "opacity-25"
                          }`}
                        />
                      ))}
                    </p>
                  )}
                </div>
              </div>

              <blockquote className="mt-5 text-[1rem] leading-[1.62] text-ink-soft">
                &ldquo;{trim(item.quote)}&rdquo;
              </blockquote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
