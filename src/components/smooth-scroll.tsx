"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

import { ScrollTrigger, gsap } from "@/lib/gsap";

/** Height of the fixed header, so anchor jumps do not land underneath it. */
const HEADER_OFFSET = 116;

/**
 * Lenis, driven by GSAP's ticker and feeding ScrollTrigger on every frame —
 * the one arrangement in which the two stay in step. Skipped entirely when the
 * visitor asks for reduced motion, which leaves native scrolling in place.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let lenis: Lenis | null = null;

    const raf = (time: number) => lenis?.raf(time * 1000);

    const start = () => {
      if (lenis) return;
      lenis = new Lenis({
        duration: 1.05,
        // Calm, no rubber-band overshoot.
        easing: (t) => 1 - Math.pow(1 - t, 3),
        wheelMultiplier: 0.9,
        touchMultiplier: 1.4,
        smoothWheel: true,
      });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      ScrollTrigger.refresh();
    };

    const stop = () => {
      if (!lenis) return;
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenis = null;
      ScrollTrigger.refresh();
    };

    // Development-only escape hatch, so the screenshot script can drive the
    // page with plain `window.scrollTo`. Compiled out of production builds.
    const off =
      process.env.NODE_ENV !== "production" &&
      new URLSearchParams(window.location.search).has("nolenis");

    if (!reduced.matches && !off) start();

    const onPreferenceChange = () => (reduced.matches ? stop() : start());
    reduced.addEventListener("change", onPreferenceChange);

    // In-page anchors, routed through whichever scroller is active.
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey
      ) {
        return;
      }
      const anchor = (event.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;

      const id = anchor.getAttribute("href")!.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -HEADER_OFFSET });
      } else {
        const top =
          target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        window.scrollTo({ top, behavior: reduced.matches ? "auto" : "smooth" });
      }
      // Keep the URL and focus honest for keyboard and screen-reader users.
      history.replaceState(null, "", `#${id}`);
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    };

    document.addEventListener("click", onClick);

    // Late-loading webfonts change text metrics, which moves every trigger.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      document.removeEventListener("click", onClick);
      reduced.removeEventListener("change", onPreferenceChange);
      stop();
    };
  }, []);

  return null;
}
