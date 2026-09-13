import { Lanes } from "@/components/lanes";
import { site } from "@/lib/site";

export function HowItWorks() {
  return (
    <section id="how" data-section="steps" className="section-y">
      <div className="shell">
        <Lanes>
          <h2 data-anim-heading className="display text-[clamp(1.9rem,4vw,2.7rem)]">
            How it works.
          </h2>
          <p data-anim-line className="mt-4 max-w-[34rem] text-[1.02rem] leading-[1.6] text-ink-soft">
            Three stages, in the order everyone takes them. You move on when you
            are ready, not when a timetable says so.
          </p>

          <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {site.steps.map((step) => (
              <li key={step.id} className="relative pt-5">
                <span
                  data-anim-rule
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px bg-hairline"
                />
                <div data-anim-item>
                <span className="font-mono text-[0.8rem] tracking-[0.16em] text-brand">
                  {step.step}
                </span>
                <h3 className="mt-3 text-[1.12rem] font-semibold text-ink">
                  {step.title}
                </h3>
                  <p className="mt-2.5 text-[0.96rem] leading-[1.6] text-ink-soft">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Lanes>
      </div>
    </section>
  );
}
