import { Car, MapPin, ShieldCheck } from "lucide-react";

import { Lanes } from "@/components/lanes";
import { site } from "@/lib/site";

const TRUST_ICONS = [ShieldCheck, Car, MapPin];

export function Hero() {
  return (
    <section className="relative">
      {/* ── The town, behind everything ────────────────────────────────────
          Wide screens: it sits beside the copy at full strength, with the
          route and its labelled stops drawn over it.

          Phones: the artwork alone — streets, blocks, greens, water. No
          route, no pins, no labels: at portrait width they landed in the
          content column and fought the copy. The three trust signals below
          carry what the pins were saying, and the hanging red line keeps the
          brand's through-line. */}
      <div
        data-route-anchor="map"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden lg:inset-y-0 lg:right-0 lg:left-auto lg:z-auto lg:w-[62%]"
      >
        {/* Rasterized from MapArt: one image replaces thousands of SVG nodes.
            object-fit uses the same crop as the route's mapProjector. */}
        <picture>
          <source media="(max-width: 767px)" srcSet="/map-mobile.webp" />
          <img src="/map.webp" width="1100" height="1000" alt="" fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover origin-[42%_32%] scale-[1.65] opacity-90 md:origin-center md:scale-100 md:opacity-70 lg:opacity-100" />
        </picture>

        {/* Scrims. Phones and tablets get a flat wash plus a fade behind the
            copy; wide screens keep the horizontal fade. */}
        <div className="absolute inset-0 bg-white/25 lg:hidden" />
        <div className="absolute inset-x-0 top-0 h-[70%] bg-[linear-gradient(to_bottom,#ffffff_0%,#ffffff_74%,rgba(255,255,255,0.55)_92%,rgba(255,255,255,0)_100%)] lg:hidden" />
        <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,#ffffff_0%,#ffffff_14%,rgba(255,255,255,0.9)_32%,rgba(255,255,255,0.35)_54%,rgba(255,255,255,0)_74%)] lg:block" />
        <div className="absolute inset-x-0 top-0 hidden h-24 bg-[linear-gradient(to_bottom,#ffffff,rgba(255,255,255,0))] lg:block" />
        <div className="absolute inset-x-0 bottom-0 hidden h-28 bg-[linear-gradient(to_top,#ffffff,rgba(255,255,255,0))] lg:block" />
      </div>

      <div className="shell relative">
        <Lanes>
          <div className="flex max-w-[36rem] flex-col pt-[calc(var(--header-h)+2.5rem)] pb-20 lg:min-h-[82svh] lg:justify-center lg:pt-[calc(var(--header-h)+1rem)] lg:pb-16">
            <p
              data-hero-line
              className="mb-5 text-[0.8rem] font-bold tracking-[0.2em] text-brand uppercase"
            >
              {site.tagline}
            </p>

            <h1
              data-hero-heading
              className="display text-[clamp(2.6rem,6.4vw,4.4rem)]"
            >
              Learn to drive.
              <br />
              <span className="text-brand">Feel in control.</span>
            </h1>

            <p
              data-hero-line
              className="mt-6 w-[calc(100%+1rem)] max-w-[34rem] text-[0.95rem] leading-[1.6] text-ink-soft sm:w-full sm:text-[1.05rem] lg:text-[1.1rem]"
            >
              L_4NOW Driving School proudly serves Manchester, helping learners
              build confidence behind the wheel.
              <br />
              From your first lesson to test day, we provide personalised,
              experienced instruction to help you pass your test and enjoy the
              freedom of driving.
            </p>

            <div
              data-hero-line
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <a href="#book" className="btn-primary">
                Find your lesson
              </a>
              <a href="#pricing" className="btn-secondary">
                See prices
              </a>
            </div>

            {/* Facts, not a restatement of the journey — that is what "How it
                works" is for. On phones these carry what the map pins said. */}
            <ul className="mt-11 flex flex-wrap gap-x-7 gap-y-3 border-t border-hairline pt-6">
              {site.trustSignals.map((signal, i) => {
                const Icon = TRUST_ICONS[i];
                return (
                  <li
                    key={signal}
                    data-hero-line
                    className="flex items-center gap-2 text-[0.92rem] font-semibold text-ink"
                  >
                    <Icon
                      className="size-[1.05rem] shrink-0 text-brand"
                      aria-hidden="true"
                    />
                    {signal}
                  </li>
                );
              })}
            </ul>
          </div>
        </Lanes>
      </div>
    </section>
  );
}
