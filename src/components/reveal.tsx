"use client";

import { useEffect } from "react";

/**
 * Scroll-into-view reveals, with one IntersectionObserver for the whole page.
 *
 * Nothing is hidden in the markup, so the page is fully readable if the script
 * never runs: hiding only happens once this effect adds `data-anim="pending"`,
 * and anything already on screen at that moment is revealed straight away
 * rather than being hidden and animated back in.
 *
 * A timer sweep backs the observer up. Observer callbacks are tied to the
 * rendering lifecycle, so a backgrounded or throttled tab can leave elements
 * pending — and pending means invisible, which is the one failure this must
 * not have.
 *
 * Two flavours, both transform + opacity only:
 *   [data-reveal] — fade and rise, everywhere.
 *   [data-tile]   — 3D flip, on the testimonial tiles alone, where it reads
 *                   as deliberate rather than chaotic.
 */
export function Reveal() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal], [data-tile]"),
    );
    if (!targets.length) return;

    const onScreen = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.92 && r.bottom > 0;
    };

    const pending: HTMLElement[] = [];
    targets.forEach((el) => {
      if (onScreen(el)) {
        // Already visible: show it as-is rather than hiding it to animate.
        el.dataset.anim = "in";
        return;
      }
      el.dataset.anim = "pending";
      pending.push(el);
    });
    if (!pending.length) return;

    const reveal = (el: Element) => {
      (el as HTMLElement).dataset.anim = "in";
      observer.unobserve(el);
    };

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => entry.isIntersecting && reveal(entry.target)),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    pending.forEach((el) => observer.observe(el));

    // Backstop: if anything is on screen but still pending, show it.
    const sweep = window.setInterval(() => {
      let remaining = 0;
      pending.forEach((el) => {
        if (el.dataset.anim !== "pending") return;
        if (onScreen(el)) reveal(el);
        else remaining += 1;
      });
      if (!remaining) window.clearInterval(sweep);
    }, 600);

    return () => {
      window.clearInterval(sweep);
      observer.disconnect();
    };
  }, []);

  return null;
}
