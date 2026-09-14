import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of service",
  description: `Booking, payment and cancellation terms for driving lessons with ${site.name}.`,
};

export default function Terms() {
  return (
    <LegalPage title="Terms of service" updated="9 September 2026">
      <p>
        <strong>Placeholder document.</strong> These terms are a plain-English
        starting point for {site.legalName} and have not been reviewed by a
        solicitor. Replace them before the site goes live.
      </p>

      <h2>Booking a lesson</h2>
      <p>
        Submitting the enquiry form is a request, not a confirmed booking. A
        lesson is only booked once we have spoken to you and agreed a time. We
        do not take deposits to hold a slot.
      </p>

      <h2>Prices and payment</h2>
      <p>
        Hourly rates are published on the home page and confirmed with you
        when the lesson is agreed. Payment is by bank transfer or cash, after
        the booking is agreed — no deposit is taken to hold a slot.
      </p>
      <p>
        Theory and practical test fees are paid to the DVSA directly and are not
        included in our prices.
      </p>

      <h2 id="cancellations">Cancellations and rescheduling</h2>
      <p>
        Set out your notice period, what happens inside it, and what happens
        when a lesson has to be cancelled by the instructor. Nothing is stated
        here yet because no policy has been supplied.
      </p>

      <h2>During lessons</h2>
      <p>
        You must hold a valid provisional or full UK licence and bring it to
        every lesson. You must be fit to drive: no alcohol, no drugs (including
        prescription medicines that affect driving) and adequate eyesight with
        any corrective lenses you need.
      </p>
      <p>
        The instructor may end a lesson without refund if continuing would be
        unsafe.
      </p>

      <h2>Test day</h2>
      <p>
        Confirm here whether use of the tuition car is available for the
        practical test, and on what terms.
      </p>

      <h2>Liability</h2>
      <p>
        Nothing in these terms limits liability for death or personal injury
        caused by negligence, or for anything else which cannot lawfully be
        limited. Add your insurance position here.
      </p>

      <h2>Complaints</h2>
      <p>
        Tell us first —{" "}
        {site.contact.email ? (
          <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
        ) : (
          <strong>TODO_EMAIL</strong>
        )}{" "}
        or <a href={site.contact.phoneHref}>{site.contact.phoneDisplay}</a>. If
        we cannot resolve it, complaints about an approved driving instructor
        can be raised with the DVSA.
      </p>
    </LegalPage>
  );
}
