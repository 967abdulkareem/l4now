import { MessageCircle } from "lucide-react";

import { Lanes } from "@/components/lanes";
import { TODO_PRICE, pricing, pricingNote } from "@data/pricing";
import { site } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";

const TRANSMISSION_LABEL = {
  manual: "Manual",
  automatic: "Automatic",
  both: "Manual or automatic",
} as const;

export function Pricing() {
  return (
    <section id="pricing" data-section="pricing" className="section-y">
      <div className="shell">
        <Lanes>
          <div className="max-w-[38rem]">
            <p data-anim-line className="eyebrow">
              Lessons &amp; prices
            </p>
            <h2 data-anim-heading className="display mt-3 text-[clamp(2rem,4.4vw,3rem)]">
              What it costs.
            </h2>
            <p data-anim-line className="mt-4 text-[1.05rem] leading-[1.6] text-ink-soft">
              Every lesson is with a DVSA-approved instructor (ADI), in a
              dual-controlled car, with pick-up and drop-off included.
            </p>
          </div>

          {/* Two columns rather than three: the cards carry several
              sentences each now, and at a third of the width that is a column
              of thin text. gap-x-14 is the route's gutter, not decoration —
              keep it. */}
          <ul
            data-course-grid
            className="mt-20 grid gap-y-16 lg:grid-cols-2 lg:items-stretch lg:gap-x-14"
          >
            {pricing.map((item, i) => {
              const ask = item.price === TODO_PRICE;
              const featured = Boolean(item.badge);
              const href = whatsappLink(
                `Hello ${site.instructor} at ${site.shortName} — I would like to ask about ${item.name}.`,
              );

              return (
                <li
                  key={item.id}
                  data-course-card
                  data-passed="false"
                  data-anim-item
                  data-hover-lift
                  {...(featured ? { "data-featured": "" } : {})}
                  // The first row defines the route's weave through the grid;
                  // the rest sit below it.
                  {...(i < 2 ? { "data-route-row": "" } : {})}
                  // The full-width card spans both columns, so the route's
                  // gutter run has to stop above it rather than through it.
                  {...(item.wide ? { "data-wide": "" } : {})}
                  className={`card-surface group relative flex h-full flex-col p-7 transition-[box-shadow,border-color] duration-300 data-[passed=true]:shadow-[0_14px_34px_-22px_rgb(17_17_17/0.3)] lg:p-8 ${
                    featured ? "border-brand ring-1 ring-brand/25" : ""
                  } ${item.wide ? "lg:col-span-2" : ""}`}
                >
                  {item.badge && (
                    <span className="absolute -top-3 left-7 rounded-full bg-brand px-3 py-1 text-[0.72rem] font-bold tracking-[0.1em] text-white uppercase lg:left-8">
                      {item.badge}
                    </span>
                  )}

                  <h3 className="text-[1.3rem] font-bold tracking-[-0.02em] text-ink">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-[0.92rem] text-muted-foreground">
                    {item.subtitle}
                  </p>

                  <p className="mt-6 flex min-h-[3.2rem] flex-wrap items-baseline gap-x-2.5">
                    {ask ? (
                      <span className="text-[1.35rem] font-bold text-ink">
                        Price on request
                      </span>
                    ) : (
                      <>
                        {item.originalPrice && (
                          <span className="text-[1.05rem] text-muted-foreground line-through">
                            {item.originalPrice}
                          </span>
                        )}
                        <span className="display text-[2.4rem]">
                          {item.price}
                        </span>
                        <span className="text-[0.92rem] text-muted-foreground">
                          {item.unit}
                        </span>
                      </>
                    )}
                  </p>

                  {item.transmission && (
                    <p className="mt-2 text-[0.86rem] font-medium text-brand">
                      {TRANSMISSION_LABEL[item.transmission]}
                    </p>
                  )}

                  <p
                    className={`mt-4 text-[0.97rem] leading-[1.62] text-ink-soft ${
                      item.bullets ? "" : "flex-1"
                    } ${item.wide ? "max-w-[46rem]" : ""}`}
                  >
                    {item.note}
                  </p>

                  {/* Each package is the enquiry, so pressing one opens
                      WhatsApp with that package named — a reader who has
                      already chosen should not have to type it out. */}
                  {item.bullets && (
                    <div className="mt-5 flex-1">
                      <p className="text-[0.86rem] font-semibold text-ink">
                        Choose from
                      </p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {item.bullets.map((option) => (
                          <li key={option}>
                            <a
                              href={whatsappLink(
                                `Hello ${site.instructor} at ${site.shortName} — I would like to ask about a ${item.name.toLowerCase()}: ${option}.`,
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Ask about a gift voucher for ${option}`}
                              className="block rounded-full border border-ink/12 px-3.5 py-1.5 text-[0.9rem] text-ink-soft transition-colors hover:border-brand hover:bg-brand-tint hover:text-brand focus-visible:border-brand"
                            >
                              {option}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    // The card is a flex column, so a narrower button needs
                    // self-start as well as a width — stretch would override
                    // the width alone.
                    className={`mt-7 ${
                      item.wide ? "w-full sm:w-auto sm:self-start sm:px-10" : "w-full"
                    } ${
                      featured ? "btn-primary" : "btn-quiet"
                    }`}
                  >
                    <MessageCircle className="size-4" aria-hidden="true" />
                    {ask ? "Ask us" : item.ctaLabel}
                  </a>
                </li>
              );
            })}
          </ul>

          <p
            data-anim-line
            className="mt-20 max-w-[42rem] text-[0.9rem] text-muted-foreground"
          >
            {pricingNote}
          </p>
        </Lanes>
      </div>
    </section>
  );
}
