import { MessageCircle, UserRound } from "lucide-react";

import { Lanes } from "@/components/lanes";
import { site } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Who will teach you.
 *
 * Everything here is placeholder and marked TODO_ in `src/lib/site.ts` — the
 * layout is finished so the owner only fills in the blanks. Nothing claims
 * years of experience, a pass rate or a student count.
 */
export function Instructor() {
  const { instructor } = site;

  return (
    <section id="instructor" data-section="instructor" className="section-y">
      <div className="shell">
        <Lanes>
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <figure data-anim-item className="lg:col-span-5">
              <div className="card-surface relative aspect-4/5 overflow-hidden rounded-2xl bg-muted">
                {instructor.photo ? (
                  // Static export, and the file is sized for this slot by hand.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={instructor.photo}
                    alt={`${instructor.name}, ${instructor.credential}`}
                    width={720}
                    height={900}
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center gap-3 p-6 text-center">
                    <UserRound
                      className="size-10 text-ink/25"
                      aria-hidden="true"
                    />
                    <p className="font-mono text-[0.78rem] tracking-[0.12em] text-muted-foreground uppercase">
                      {instructor.photoTodo}
                    </p>
                    <p className="max-w-[18rem] text-[0.88rem] text-muted-foreground">
                      A photo of the instructor goes here. Portrait, roughly
                      4&nbsp;:&nbsp;5.
                    </p>
                  </div>
                )}
              </div>
            </figure>

            <div className="lg:col-span-6 lg:col-start-7">
              <p data-anim-line className="eyebrow">
                Your instructor
              </p>

              <h2
                data-anim-heading
                className="display mt-3 text-[clamp(1.9rem,4vw,2.7rem)]"
              >
                {instructor.name}
              </h2>

              <p
                data-anim-line
                className="mt-3 text-[0.95rem] font-semibold text-brand"
              >
                {instructor.credential}
              </p>

              {instructor.bio.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 32)}
                  data-anim-item
                  className="mt-5 max-w-[34rem] text-[1.02rem] leading-[1.65] text-ink-soft"
                >
                  {paragraph}
                </p>
              ))}

              <div data-anim-item className="mt-8">
                <a
                  href={whatsappLink(
                    `Hello ${site.name} — I would like to ask about lessons.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-quiet"
                >
                  <MessageCircle className="size-4" aria-hidden="true" />
                  Ask a question
                </a>
              </div>
            </div>
          </div>
        </Lanes>
      </div>
    </section>
  );
}
