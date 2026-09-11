import { Crosshair, LineChart, UserRound } from "lucide-react";

import { Lanes } from "@/components/lanes";
import { PRICE_TBC, site } from "@/lib/site";

const ICONS = {
  user: UserRound,
  chart: LineChart,
  target: Crosshair,
} as const;

/** Staggered on wide screens, so the route has gutters to travel through. */
const OFFSETS = ["lg:mt-0", "lg:mt-16", "lg:mt-32"];

export function Courses() {
  return (
    <section id="courses" className="scroll-mt-24 py-16 lg:py-24">
      <div className="shell">
        <Lanes>
          <div className="max-w-[38rem]">
            <h2 className="display text-[clamp(2rem,4.4vw,3rem)]">
              Find your pace.
            </h2>
            <p className="mt-4 text-[1.05rem] leading-[1.6] text-ink-soft">
              Choose the lessons that fit your next step.
            </p>
          </div>

          {/* gap-x-14 is the route's gutter, not decoration — keep it. */}
          <ul
            data-course-grid
            className="mt-28 grid gap-y-12 lg:grid-cols-3 lg:items-start lg:gap-x-14"
          >
            {site.courses.map((course, i) => {
              const Icon = ICONS[course.icon as keyof typeof ICONS];
              return (
                <li
                  key={course.id}
                  data-course-card
                  data-passed="false"
                  className={`card-surface group relative flex flex-col p-7 transition-[box-shadow,border-color,transform] duration-500 data-[passed=true]:-translate-y-1 data-[passed=true]:border-brand/35 lg:p-8 ${OFFSETS[i]}`}
                >
                  {course.popular && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-7 top-0 h-[3px] rounded-b bg-brand transition-opacity duration-500 lg:inset-x-8"
                    />
                  )}

                  <span
                    aria-hidden="true"
                    className="grid size-11 place-items-center rounded-full bg-muted text-ink transition-colors duration-500 group-data-[passed=true]:bg-brand-tint group-data-[passed=true]:text-brand"
                  >
                    <Icon className="size-5" />
                  </span>

                  <h3 className="mt-6 text-[1.35rem] font-bold tracking-[-0.02em] text-ink">
                    {course.name}
                  </h3>

                  <p className="mt-3 flex-1 text-[1rem] leading-[1.62] text-ink-soft">
                    {course.summary}
                  </p>

                  <ul className="mt-6 flex flex-col gap-2">
                    {course.points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-2.5 text-[0.92rem] text-muted-foreground"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-brand/55"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-7 border-t border-hairline pt-5 text-[0.98rem] text-muted-foreground">
                    {course.price ? (
                      <>
                        <span className="text-[1.6rem] font-bold tracking-[-0.02em] text-ink">
                          {course.price}
                        </span>{" "}
                        {course.unit}
                      </>
                    ) : (
                      PRICE_TBC
                    )}
                  </p>

                  <a
                    href="#book"
                    className="btn-primary mt-5 w-full"
                    aria-label={`Book a lesson — ${course.name}`}
                  >
                    Book a lesson
                  </a>
                </li>
              );
            })}
          </ul>

          <p className="mt-12 max-w-[42rem] text-[0.9rem] text-muted-foreground">
            Prices are being confirmed. Send an enquiry or ring us and we will
            give you the current rate — there is nothing to pay to ask.
          </p>
        </Lanes>
      </div>
    </section>
  );
}
