"use client";

import { useEffect, useRef } from "react";

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
    let run = 0;
    const dismiss = () => { if (!cancelled) el.dataset.ready = "true"; };
    const journey = document.querySelector<HTMLElement>("[data-journey]");
    let fontsReady = false;
    void document.fonts.ready.then(() => { fontsReady = true; });
    const start = () => {
      const current = ++run;
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
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
        let signature = "";
        let stableSince = performance.now();
        const check = () => {
          if (cancelled || current !== run) return;
          const path = journey?.querySelector('[data-route="base"]');
          const svg = journey?.querySelector('[data-route-svg]');
          const next = `${path?.getAttribute("d") ?? ""}|${svg?.getAttribute("viewBox") ?? ""}`;
          if (!fontsReady || journey?.dataset.routeReady !== "true" || next !== signature) {
            signature = next;
            stableSince = performance.now();
          }
          // Wait for the font-driven refresh and a quiet route, not just the
          // first path drawn using fallback fonts. No extra asset downloads.
          if (fontsReady && path?.getAttribute("d") && journey?.dataset.routeReady === "true"
            && performance.now() - stableSince >= 600 && performance.now() - began >= 1000) {
            dismiss();
          } else frame = requestAnimationFrame(check);
        };
        check();
      });
      timeout = window.setTimeout(dismiss, 12000);
    };
    start();
    mobile.addEventListener("change", start);
    return () => {
      cancelled = true;
      ++run;
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      mobile.removeEventListener("change", start);
    };
  }, []);

  return (
    <>
      <div ref={screen} className="mobile-loading-screen" aria-hidden="true">
        {/* Optional background: never blocks the immediately rendered wordmark. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/map-loading.webp" width="680" height="1000" alt="" className="mobile-loading-map" fetchPriority="low" decoding="async" />
        <div className="mobile-loading-brand">
          <div className="mobile-loading-wordmark"><span>L_4</span>NOW</div>
          <div className="mobile-loading-subtitle">Driving School</div>
          <p>Getting ready for your first turn…</p>
          <span className="mobile-loading-track"><span /></span>
        </div>
      </div>
      <noscript><style>{`.mobile-loading-screen { display: none !important; }`}</style></noscript>
    </>
  );
}
