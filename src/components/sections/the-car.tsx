import { Armchair, ShieldCheck, Users } from "lucide-react";

import { Lanes } from "@/components/lanes";

/**
 * The car, between the prices and the enquiry form.
 *
 * No paragraph: a photograph of the actual car answers "what will I be
 * driving" better than a sentence about it, and the three facts underneath
 * are the ones a nervous learner asks. The tinted band separates it from the
 * white sections either side without a rule.
 */
const FACTS = [
  { icon: ShieldCheck, label: "Dual-control" },
  { icon: Armchair, label: "Comfortable & easy to learn" },
  { icon: Users, label: "Friendly environment" },
] as const;

export function TheCar() {
  return (
    <section id="car" data-section="car" className="section-y bg-muted/50">
      <div className="shell">
        <Lanes>
          {/* Phones read it the way the eye does: the label, the car, then
              the facts under it. Wide screens put the facts beside the car,
              which is the same information in the space that exists. */}
          <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-10">
            <p
              data-anim-line
              className="eyebrow lg:col-span-4 lg:row-start-1 lg:self-end"
            >
              The car
            </p>

            <div
              data-anim-item
              className="order-2 lg:order-none lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1"
            >
              {/* Static export, and the file is sized for this slot. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/car.webp"
                alt="The L_4NOW car: a dual-controlled manual hatchback with L plates and a roof sign."
                width={1200}
                height={690}
                loading="lazy"
                decoding="async"
                className="mx-auto h-auto w-full max-w-[32rem] lg:max-w-none"
              />
            </div>

            <ul className="order-3 grid grid-cols-3 gap-x-3 gap-y-2 lg:order-none lg:col-span-4 lg:row-start-2 lg:grid-cols-1 lg:gap-6 lg:self-start">
              {FACTS.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  data-anim-item
                  className="flex flex-col items-center gap-2 border-t border-hairline pt-4 text-center lg:flex-row lg:items-center lg:gap-3 lg:border-0 lg:pt-0 lg:text-left"
                >
                  <Icon
                    className="size-6 shrink-0 text-brand"
                    aria-hidden="true"
                  />
                  <span className="text-[0.84rem] leading-[1.3] text-balance text-ink-soft sm:text-[0.9rem] lg:text-[0.98rem]">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Lanes>
      </div>
    </section>
  );
}
