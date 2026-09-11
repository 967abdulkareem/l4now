import { site } from "@/lib/site";

export function Areas() {
  return (
    <section
      id="areas"
      className="scroll-mt-24 border-t border-hairline py-16 lg:py-24"
    >
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="eyebrow">Areas covered</p>
            <h2 className="display mt-3 text-[clamp(1.9rem,4vw,2.7rem)]">
              Where we teach.
            </h2>
          </div>
          <p className="max-w-[34rem] text-[1.02rem] leading-[1.6] text-ink-soft lg:col-span-6 lg:col-start-7 lg:self-end">
            {site.areas.note}
          </p>
        </div>

        <div className="mt-12 overflow-x-auto rounded-2xl border border-hairline bg-white">
          <table className="w-full min-w-[38rem] border-collapse text-left">
            <caption className="sr-only">
              Coverage areas by postcode district
            </caption>
            <thead>
              <tr className="border-b border-hairline bg-[#faf9f6]">
                {["Area", "Postcodes", "Towns and villages"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-6 py-4 text-[0.76rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {site.areas.groups.map((group) => (
                <tr
                  key={group.name}
                  className="border-b border-hairline align-top last:border-0"
                >
                  <th
                    scope="row"
                    className="px-6 py-5 text-[1rem] font-semibold text-ink"
                  >
                    {group.name}
                  </th>
                  <td className="px-6 py-5 font-mono text-[0.88rem] whitespace-nowrap text-brand">
                    {group.postcodes}
                  </td>
                  <td className="px-6 py-5">
                    <ul className="flex flex-wrap gap-2">
                      {group.places.map((place) => (
                        <li
                          key={place}
                          className="rounded-lg border border-hairline bg-[#faf9f6] px-2.5 py-1 text-[0.85rem] text-ink-soft"
                        >
                          {place}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 max-w-[46rem] text-[0.88rem] text-muted-foreground">
          Place names and postcode districts above are placeholders for this
          build. Replace them in the site configuration.
        </p>
      </div>
    </section>
  );
}
