import { BrandLogo } from "@/components/brand-logo";
import { site } from "@/lib/site";

const year = new Date().getFullYear();

export function SiteFooter() {
  const { address } = site.contact;

  return (
    <footer className="border-t border-hairline bg-white">
      <div className="shell grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:py-20">
        <div className="sm:col-span-2 lg:col-span-1">
          <BrandLogo width={180} className="h-auto w-[180px]" />
          <p className="mt-3 text-[0.82rem] font-semibold tracking-[0.16em] text-brand uppercase">
            {site.tagline}
          </p>
          <p className="mt-4 max-w-[22rem] text-[0.93rem] leading-[1.6] text-muted-foreground">
            {site.description}
          </p>
        </div>

        <div>
          <h2 className="text-[0.78rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Contact
          </h2>
          <ul className="mt-4 flex flex-col gap-2.5 text-[0.94rem]">
            <li>
              <a
                href={site.contact.phoneHref}
                className="text-ink hover:text-brand hover:underline"
              >
                {site.contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.contact.email}`}
                className="text-ink hover:text-brand hover:underline"
              >
                {site.contact.email}
              </a>
            </li>
          </ul>

          <address className="mt-5 text-[0.93rem] leading-[1.6] text-muted-foreground not-italic">
            {address.line1}
            <br />
            {address.line2}
            <br />
            {address.city} {address.postcode}
          </address>
        </div>

        <div>
          <h2 className="text-[0.78rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Explore
          </h2>
          <ul className="mt-4 flex flex-col gap-2.5 text-[0.94rem]">
            {[...site.nav, { label: "Book a lesson", href: "#book" }].map(
              (item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-ink hover:text-brand hover:underline"
                  >
                    {item.label}
                  </a>
                </li>
              ),
            )}
          </ul>
        </div>

        <div>
          <h2 className="text-[0.78rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Lesson hours
          </h2>
          <dl className="mt-4 flex flex-col gap-2.5 text-[0.94rem]">
            {site.hours.map((row) => (
              <div key={row.days}>
                <dt className="text-ink">{row.days}</dt>
                <dd className="text-muted-foreground">{row.time}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="shell flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.86rem] text-muted-foreground">
            © {year} {site.legalName}. Placeholder business details.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {site.legal.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-[0.86rem] text-muted-foreground hover:text-ink hover:underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
