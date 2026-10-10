"use client";

import { useEffect, useRef } from "react";
import { BrandLogo } from "@/components/brand-logo";

/** Server-rendered so the phone has a branded first paint before hydration. */
export function MobileLoadingScreen() {
  const screen = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = screen.current;
    if (!el) return;
    const mobile = window.matchMedia("(max-width: 767px)");
    let cancelled = false;
    let frame = 0;
    let timeout = 0;
    let minimum = 0;
    let run = 0;
    const dismiss = () => { if (!cancelled) el.dataset.ready = "true"; };
    const journey = document.querySelector<HTMLElement>("[data-journey]");
    const assets = Promise.allSettled([
      document.fonts.ready,
      ...Array.from(el.querySelectorAll("img")).map((img) => img.decode()),
    ]);
    const start = () => {
      const current = ++run;
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.clearTimeout(minimum);
      if (!mobile.matches) { dismiss(); return; }
      const began = performance.now();
      el.dataset.ready = "false";
      // Restart the CSS escape hatch when switching into the phone preview.
      el.style.animation = "none";
      // Flush the cancelled animation before restoring it. Otherwise the
      // browser can reuse its finished, invisible state after a resize.
      void getComputedStyle(el).animationName;
      frame = requestAnimationFrame(() => {
        el.style.animation = "";
        const check = () => {
          if (cancelled || current !== run) return;
          if (journey?.dataset.routeReady === "true") {
            void assets.then(() => {
              if (cancelled || current !== run) return;
              minimum = window.setTimeout(dismiss, Math.max(0, 1000 - (performance.now() - began)));
            });
          } else frame = requestAnimationFrame(check);
        };
        check();
      });
      timeout = window.setTimeout(dismiss, 4000);
    };
    start();
    mobile.addEventListener("change", start);
    return () => {
      cancelled = true;
      ++run;
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.clearTimeout(minimum);
      mobile.removeEventListener("change", start);
    };
  }, []);

  return (
    <>
      <div ref={screen} className="mobile-loading-screen" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/map-loading.webp" width="680" height="1000" alt="" className="mobile-loading-map" fetchPriority="high" />
        <div className="mobile-loading-brand">
          <BrandLogo width={210} />
          <p>Getting ready for your first turn…</p>
          <span className="mobile-loading-track"><span /></span>
        </div>
      </div>
      <noscript><style>{`.mobile-loading-screen { display: none !important; }`}</style></noscript>
    </>
  );
}
