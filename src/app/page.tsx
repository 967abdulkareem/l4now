import { RouteJourney } from "@/components/journey/route-journey";
import { MotionRoot } from "@/components/motion-root";
import { Pricing } from "@/components/sections/pricing";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Reservation } from "@/components/sections/reservation";
import { SiteFooter } from "@/components/sections/site-footer";
import { Testimonials } from "@/components/sections/testimonials";
import { site } from "@/lib/site";

/** Structured data, generated from the one config file. */
function schema() {
  const { contact, hours } = site;
  return {
    "@context": "https://schema.org",
    "@type": "DrivingSchool",
    name: site.name,
    description: site.description,
    url: site.url,
    telephone: contact.phoneDisplay,
    email: contact.email,
    // No street address is published, so the only place claim we can make
    // truthfully is the area covered.
    areaServed: "Manchester, United Kingdom",
    openingHours: hours.map((row) => `${row.days} ${row.time}`),
  };
}

export default function Home() {
  return (
    <>
      <span id="top" />
      <main id="main">
        <MotionRoot>
          {/* Hero, stages, pricing and booking share one route and one dot. */}
          <RouteJourney>
            <Hero />
            <HowItWorks />
            <Pricing />
            <Reservation />
          </RouteJourney>

          <Testimonials />
          <Faq />
        </MotionRoot>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        // Generated from the site config above; no user input reaches this.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema()) }}
      />
    </>
  );
}
