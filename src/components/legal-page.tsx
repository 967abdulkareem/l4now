import Link from "next/link";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/sections/site-footer";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <main id="main" className="pt-36 pb-24">
        <div className="shell max-w-[48rem]">
          <Link
            href="/"
            className="text-[0.9rem] font-medium text-brand hover:underline"
          >
            ← Back to the homepage
          </Link>
          <h1 className="display mt-6 text-[clamp(2.2rem,5vw,3.2rem)]">
            {title}
          </h1>
          <p className="mt-4 text-[0.92rem] text-muted-foreground">
            Last updated {updated}
          </p>

          <div
            className="mt-12 flex flex-col gap-6 text-[1.02rem] leading-[1.7] text-ink-soft
              [&_a]:text-brand [&_a]:underline
              [&_h2]:mt-6 [&_h2]:scroll-mt-28 [&_h2]:text-[1.35rem] [&_h2]:font-semibold [&_h2]:text-ink
              [&_li]:mb-2 [&_ul]:ml-6 [&_ul]:list-disc"
          >
            {children}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
