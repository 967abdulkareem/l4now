import { Mail, Phone } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { site } from "@/lib/site";

export function Faq() {
  return (
    <section
      id="faqs"
      data-section="faq"
      className="section-y border-t border-hairline"
    >
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <p data-anim-line className="eyebrow">
            Questions
          </p>
          <h2 data-anim-heading className="display mt-3 text-[clamp(1.9rem,4vw,2.7rem)]">
            Before you book.
          </h2>
          <p data-anim-line className="mt-5 max-w-[24rem] text-[1.02rem] leading-[1.62] text-ink-soft">
            If something is not covered here, message us — a person answers,
            and there is no sales script.
          </p>

          <div className="mt-7 flex flex-col gap-2">
            <a
              href={site.contact.phoneHref}
              className="inline-flex items-center gap-2.5 text-[0.98rem] font-medium text-brand hover:underline"
            >
              <Phone className="size-4" aria-hidden="true" />
              {site.contact.phoneDisplay}
            </a>
            {site.contact.email && (
              <a
                href={`mailto:${site.contact.email}`}
                className="inline-flex items-center gap-2.5 text-[0.98rem] font-medium text-brand hover:underline"
              >
                <Mail className="size-4" aria-hidden="true" />
                {site.contact.email}
              </a>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <Accordion className="border-t border-hairline">
            {site.faqs.map((faq) => (
              <AccordionItem
                key={faq.q}
                className="border-b border-hairline last:border-b"
              >
                <AccordionTrigger className="py-5 text-left text-[1.04rem] font-semibold text-ink hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pr-8 pb-6 text-[0.99rem] leading-[1.65] text-ink-soft">
                  <p>{faq.a}</p>

                  {"bullets" in faq && (
                    <ul className="mt-3 flex flex-col gap-1.5">
                      {faq.bullets.map((point) => (
                        <li key={point} className="pl-1">
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}

                  {"outro" in faq && <p className="mt-3">{faq.outro}</p>}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
