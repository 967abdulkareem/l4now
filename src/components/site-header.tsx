"use client";

import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { site } from "@/lib/site";
import { WHATSAPP_DISPLAY } from "@/lib/whatsapp";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        lifted || open
          ? "border-b border-hairline bg-[rgba(255,255,255,0.9)] backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="shell flex h-[var(--header-h)] items-center justify-between gap-4 lg:gap-6">
        <a href="#top" className="flex shrink-0 items-center">
          <BrandLogo
            variant="header"
            width={190}
            className="h-auto w-[134px] sm:w-[158px] lg:w-[190px]"
          />
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {site.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-[0.95rem] font-medium text-ink-soft transition-colors hover:text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={site.contact.phoneHref}
            className="hidden h-10 items-center rounded-xl px-3 text-[0.92rem] font-medium text-ink-soft transition-colors hover:text-ink xl:inline-flex"
          >
            {WHATSAPP_DISPLAY}
          </a>
          <a
            href="#book"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-brand px-5 text-[0.92rem] font-semibold text-white transition-colors hover:bg-brand-deep"
          >
            Book a lesson
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="grid size-10 place-items-center rounded-xl border border-ink/12 bg-white text-ink lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-hairline bg-background lg:hidden"
          >
            <nav aria-label="Primary" className="shell py-3">
              <ul className="flex flex-col">
                {site.nav.map((item) => (
                  <li
                    key={item.href}
                    className="border-b border-hairline last:border-0"
                  >
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block py-3.5 text-[1.02rem] font-medium text-ink"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href={site.contact.phoneHref}
                className="mt-4 mb-2 inline-flex h-11 items-center rounded-xl border border-ink/12 bg-white px-4 text-[0.95rem] font-medium text-ink"
              >
                {WHATSAPP_DISPLAY}
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
