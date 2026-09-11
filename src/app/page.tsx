import { RouteJourney } from "@/components/journey/route-journey";
import { Areas } from "@/components/sections/areas";
import { Courses } from "@/components/sections/courses";
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
    address: {
      "@type": "PostalAddress",
      streetAddress: `${contact.address.line1}, ${contact.address.line2}`,
      addressLocality: contact.address.city,
      postalCode: contact.address.postcode,
      addressCountry: "GB",
    },
    openingHours: hours.map((row) => `${row.days} ${row.time}`),
    areaServed: site.areas.groups.map((group) => group.name),
  };
}

export default function Home() {
  return (
    <>
      <span id="top" />
      <main id="main">
        {/* Hero, stages, courses and booking share one route and one dot. */}
        <RouteJourney>
          <Hero />
          <HowItWorks />
          <Courses />
          <Reservation />
        </RouteJourney>

        <Testimonials />
        <Areas />
        <Faq />
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
