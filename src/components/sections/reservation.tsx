import { Clock, MapPin, PhoneCall } from "lucide-react";

import { BookingForm } from "@/components/booking-form";
import { Lanes } from "@/components/lanes";
import { site } from "@/lib/site";

/** The end of the journey: the route arrives, and the panel is waiting. */
export function Reservation() {
  return (
    <section id="book" className="scroll-mt-24 py-16 lg:py-24">
      <div className="shell">
        <Lanes>
          {/* The route's destination marker is centred on this element, and it
              sits in its own row so the final run clears both columns. */}
          <span
            data-route-anchor="finish"
            aria-hidden="true"
            className="mb-12 block size-6"
          />

          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-4">
              <p className="eyebrow">Next step</p>
              <h2 className="display mt-3 text-[clamp(2rem,4.4vw,2.9rem)]">
                Ready for your next turn?
              </h2>
              <p className="mt-4 max-w-[24rem] text-[1.03rem] leading-[1.62] text-ink-soft">
                Tell us when suits and we will come back with a slot. No
                deposit, no card details, no obligation.
              </p>

              <dl className="mt-9 flex flex-col gap-5 border-t border-hairline pt-7">
                <div className="flex gap-3.5">
                  <PhoneCall
                    className="mt-0.5 size-[1.1rem] shrink-0 text-brand"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-[0.84rem] text-muted-foreground">
                      Prefer to talk
                    </dt>
                    <dd>
                      <a
                        href={site.contact.phoneHref}
                        className="text-[1.02rem] font-semibold text-ink hover:underline"
                      >
                        {site.contact.phoneDisplay}
                      </a>
                    </dd>
                  </div>
                </div>

                <div className="flex gap-3.5">
                  <Clock
                    className="mt-0.5 size-[1.1rem] shrink-0 text-brand"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-[0.84rem] text-muted-foreground">
                      Lesson hours
                    </dt>
                    <dd className="mt-0.5 flex flex-col gap-0.5">
                      {site.hours.map((row) => (
                        <span
                          key={row.days}
                          className="text-[0.93rem] text-ink-soft"
                        >
                          {row.days} · {row.time}
                        </span>
                      ))}
                    </dd>
                  </div>
                </div>

                <div className="flex gap-3.5">
                  <MapPin
                    className="mt-0.5 size-[1.1rem] shrink-0 text-brand"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-[0.84rem] text-muted-foreground">
                      Pick up
                    </dt>
                    <dd className="mt-0.5 text-[0.93rem] text-ink-soft">
                      Anywhere in{" "}
                      <a href="#areas" className="text-brand underline">
                        our coverage areas
                      </a>
                      , included.
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="lg:col-span-8">
              <div className="card-surface rounded-3xl p-6 sm:p-8 lg:p-10">
                <h3 className="text-[1.28rem] font-bold tracking-[-0.02em] text-ink sm:text-[1.45rem]">
                  Lesson enquiry
                </h3>
                <p className="mt-2 max-w-[38rem] text-[0.95rem] text-muted-foreground">
                  Fill this in and WhatsApp opens with the details ready to
                  send. It takes about a minute.
                </p>
                <BookingForm />
              </div>
            </div>
          </div>
        </Lanes>
      </div>
    </section>
  );
}
