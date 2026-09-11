import { BarChart3, MapPin, Navigation } from "lucide-react";

import { MapArt } from "@/components/journey/map-art";
import { Lanes } from "@/components/lanes";
import { site } from "@/lib/site";

const POINT_ICONS = [Navigation, BarChart3, MapPin];

export function Hero() {
  return (
    <section className="relative">
      {/* The town. Decorative — everything it illustrates is written out
          beside it — and only worth its weight on wide screens. */}
      <div
        data-route-anchor="map"
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[62%] lg:block"
      >
        <MapArt className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#ffffff_0%,#ffffff_14%,rgba(255,255,255,0.9)_32%,rgba(255,255,255,0.35)_54%,rgba(255,255,255,0)_74%)]" />
        <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(to_bottom,#ffffff,rgba(255,255,255,0))]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(to_top,#ffffff,rgba(255,255,255,0))]" />
      </div>

      <div className="shell relative">
        <Lanes>
          <div className="flex max-w-[36rem] flex-col justify-center pt-32 pb-16 lg:min-h-[92svh] lg:pt-24 lg:pb-20">
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
              <a href="#courses" className="btn-secondary">
                Explore courses
              </a>
            </div>

            <ul className="mt-12 grid gap-6 border-t border-hairline pt-7 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-hairline">
              {site.heroPoints.map((point, i) => {
                const Icon = POINT_ICONS[i];
                return (
                  <li key={point.title} className="sm:px-5 sm:first:pl-0 sm:last:pr-0">
                    <Icon
                      className="size-[1.2rem] text-brand"
                      aria-hidden="true"
                    />
                    <p className="mt-2.5 text-[0.95rem] leading-snug font-semibold text-ink">
                      {point.title}
                    </p>
                    <p className="mt-0.5 text-[0.86rem] text-muted-foreground">
                      {point.detail}
                    </p>
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
