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

          {/* gap-x-14 is the route's gutter, not decoration — keep it. */}
          <ul
            data-course-grid
            className="mt-20 grid gap-y-16 lg:grid-cols-3 lg:items-stretch lg:gap-x-14"
          >
            {pricing.map((item, i) => {
              const ask = item.price === TODO_PRICE;
              const featured = Boolean(item.badge);
              const href = whatsappLink(
                `Hello ${site.name} — I would like to ask about ${item.name}.`,
              );

              return (
                <li
                  key={item.id}
                  data-course-card
                  data-passed="false"
                  data-anim-item
                  data-hover-lift
                  {...(featured ? { "data-featured": "" } : {})}
                  // The first three cards define the route's weave through the
                  // grid; the rest sit below it.
                  {...(i < 3 ? { "data-route-row": "" } : {})}
                  className={`card-surface group relative flex h-full flex-col p-7 transition-[box-shadow,border-color] duration-300 data-[passed=true]:shadow-[0_14px_34px_-22px_rgb(17_17_17/0.3)] lg:p-8 ${
                    featured ? "border-brand ring-1 ring-brand/25" : ""
                  }`}
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

                  <p className="mt-4 flex-1 text-[0.97rem] leading-[1.62] text-ink-soft">
                    {item.note}
                  </p>

                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-7 w-full ${featured ? "btn-primary" : "btn-quiet"}`}
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
