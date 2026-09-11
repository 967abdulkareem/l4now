import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accessibility",
  description: `How ${site.name} approaches accessibility, on this website and in the car.`,
};

export default function Accessibility() {
  return (
    <LegalPage title="Accessibility" updated="9 September 2026">
      <p>
        <strong>Placeholder document.</strong> The commitments below describe how
        this website was built. Confirm the in-car section with the instructor
        before publishing.
      </p>

      <h2>This website</h2>
      <ul>
        <li>
          Every interactive control is reachable and operable with a keyboard,
          and shows a visible focus ring.
        </li>
        <li>
          Body text meets WCAG 2.2 AA contrast against its background, and
          nothing important is carried by colour alone.
        </li>
        <li>
          The map and the GPS route are decorative and hidden from assistive
          technology. Everything they illustrate is also written out in the
          text beside them.
        </li>
        <li>
          If your system is set to reduce motion, no scroll-linked animation
          runs: the route is shown complete, smooth scrolling is switched off,
          and the page scrolls normally.
        </li>
        <li>
          The page works with JavaScript disabled, including reading the whole
          journey and finding our phone number.
        </li>
        <li>Text can be zoomed to 200% without loss of content.</li>
      </ul>

      <h2>In the car</h2>
      <p>
        Tell us what you need when you enquire. We can allow longer lessons for
        processing time, provide written instructions in advance, adjust
        seating, and teach in an automatic where that removes a barrier. We are
        happy for a parent, carer or support worker to sit in.
      </p>

      <h2>Telling us about a problem</h2>
      <p>
        If something on this site is hard to use, email{" "}
        <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a> or ring{" "}
        <a href={site.contact.phoneHref}>{site.contact.phoneDisplay}</a> and we
        will fix it or give you the information another way.
      </p>
    </LegalPage>
  );
}
