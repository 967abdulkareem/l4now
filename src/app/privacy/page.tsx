import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${site.name} handles the personal details you share when enquiring about driving lessons.`,
};

export default function Privacy() {
  return (
    <LegalPage title="Privacy policy" updated="9 September 2026">
      <p>
        <strong>Placeholder document.</strong> The wording below is a plain-English
        starting point for {site.legalName} and has not been reviewed by a
        solicitor. Replace it before the site goes live.
      </p>

      <h2>Who we are</h2>
      <p>
        {site.legalName}. You can reach us on{" "}
        <a href={site.contact.phoneHref}>{site.contact.phoneDisplay}</a> or at{" "}
        {site.contact.email ? (
          <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
        ) : (
          <strong>TODO_EMAIL</strong>
        )}
        .
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Your name, phone number and email address.</li>
        <li>The postcode or area you want to be picked up from.</li>
        <li>The lesson type, transmission, date and time you asked for.</li>
        <li>Anything you choose to write in the notes field.</li>
      </ul>
      <p>
        We do not ask for payment details through this website, and we do not
        collect them. Lessons are paid for directly.
      </p>

      <h2>Why we collect it</h2>
      <p>
        Solely to reply to your enquiry, arrange lessons and keep a record of
        tuition given. We do not sell your details, and we do not share them
        with anyone except where the DVSA requires it for a test booking.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Set your retention periods here — how long unconverted enquiries are
        kept, and how long pupil records are held after the last lesson.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask us for a copy of what we hold, ask us to correct it, or ask
        us to delete it. Email us and we will reply within thirty days. If you
        are unhappy with our response you can complain to the Information
        Commissioner&rsquo;s Office.
      </p>

      <h2>Cookies and analytics</h2>
      <p>
        This website sets no cookies and runs no third-party analytics or
        advertising scripts. Nothing you type into the enquiry form leaves your
        browser until you submit it.
      </p>
    </LegalPage>
  );
}
