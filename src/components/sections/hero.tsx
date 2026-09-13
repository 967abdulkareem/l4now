import { Car, MapPin, ShieldCheck } from "lucide-react";

import { MapArt } from "@/components/journey/map-art";
import { Lanes } from "@/components/lanes";
import { site } from "@/lib/site";

const TRUST_ICONS = [ShieldCheck, Car, MapPin];

export function Hero() {
  return (
    <section className="relative">
      {/* ── The town, behind everything ────────────────────────────────────
          Wide screens: it sits beside the copy, at full strength.
          Narrow screens: the same vector map sits *behind* the copy, cropped
          to a portrait window and heavily scrimmed so body text stays
          legible. The red route and its pins keep full strength either way —
          they are the focal element, and the crop places them below the
          copy so they never sit under text. */}
      <div
        data-route-anchor="map"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 lg:inset-y-0 lg:left-auto lg:right-0 lg:z-auto lg:w-[62%]"
      >
        {/* Phones: a portrait crop, positioned so the route sits below the
            copy rather than through it. */}
        <MapArt
          className="absolute inset-0 h-full w-full opacity-60 md:hidden"
          viewBox="0 -1430 1100 2400"
          preserveAspectRatio="xMidYMax slice"
        />
        {/* Tablets up: the desktop framing — full-bleed behind the copy until
            there is room to put it beside the copy. */}
        <MapArt className="absolute inset-0 hidden h-full w-full opacity-70 md:block lg:opacity-100" />

        {/* Scrims. Phones and tablets get a flat wash plus a fade behind the
            copy; wide screens keep the horizontal fade. */}
        <div className="absolute inset-0 bg-white/40 lg:hidden" />
        <div className="absolute inset-x-0 top-0 h-[70%] bg-[linear-gradient(to_bottom,#ffffff_0%,#ffffff_74%,rgba(255,255,255,0.55)_92%,rgba(255,255,255,0)_100%)] lg:hidden" />
        <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,#ffffff_0%,#ffffff_14%,rgba(255,255,255,0.9)_32%,rgba(255,255,255,0.35)_54%,rgba(255,255,255,0)_74%)] lg:block" />
        <div className="absolute inset-x-0 top-0 hidden h-24 bg-[linear-gradient(to_bottom,#ffffff,rgba(255,255,255,0))] lg:block" />
        <div className="absolute inset-x-0 bottom-0 hidden h-28 bg-[linear-gradient(to_top,#ffffff,rgba(255,255,255,0))] lg:block" />
      </div>

      <div className="shell relative">
        <Lanes>
          <div className="flex max-w-[36rem] flex-col pt-32 pb-[46vh] sm:pt-36 sm:pb-[42vh] lg:min-h-[92svh] lg:justify-center lg:pt-28 lg:pb-20">
            <p className="mb-5 text-[0.8rem] font-bold tracking-[0.2em] text-brand uppercase">
              {site.tagline}
            </p>
            <h1 className="display text-[clamp(2.6rem,6.4vw,4.4rem)]">
              Learn to drive.
              <br />
              <span className="text-brand">Feel in control.</span>
            </h1>

            <p className="mt-7 max-w-[30rem] text-[1.08rem] leading-[1.6] text-ink-soft sm:text-[1.18rem]">
              Patient, practical driving lessons. Progress at your pace, from
              your first turn to test day.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href="#book" className="btn-primary">
                Find your lesson
              </a>
              <a href="#pricing" className="btn-secondary">
                See prices
              </a>
            </div>

            {/* Facts, not a restatement of the journey — that is what the map
                pins and "How it works" are for. */}
            <ul className="mt-11 flex flex-wrap gap-x-7 gap-y-3 border-t border-hairline pt-6">
              {site.trustSignals.map((signal, i) => {
                const Icon = TRUST_ICONS[i];
                return (
                  <li
                    key={signal}
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
