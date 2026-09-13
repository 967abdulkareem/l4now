"use client";

import { useRef, type ReactNode } from "react";

import { MOTION, ScrollTrigger, SplitText, gsap, useGSAP } from "@/lib/gsap";

/**
 * Every section reveal on the page, authored as one timeline per section.
 *
 * Why a single controller rather than an observer per element: the sections
 * want *choreography* — a heading leading its body copy, a grid arriving in a
 * stagger — and that is what a timeline expresses. It also means one
 * `gsap.matchMedia()`, so the reduced-motion branch is declarative and the
 * whole lot reverts cleanly.
 *
 * Nothing is hidden in CSS. The `from` states are set inside `useGSAP`, which
 * runs in a layout effect — before paint, so there is no flash — and if the
 * script never runs the page simply renders finished.
 */
export function MotionRoot({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;

      const mm = gsap.matchMedia();

      // Reduced motion: nothing is registered, so nothing is ever hidden and
      // the page is already in its final state.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const splits: SplitText[] = [];

        /**
         * Masked line reveal for a heading. SplitText wraps each line in an
         * `overflow: clip` element, so this is a true mask driven by nothing
         * but `transform`.
         *
         * `from` rather than `to`: the finished state is the natural one, so
         * if anything goes wrong the heading is simply readable. GSAP applies
         * the start state at creation — inside a layout effect — so there is
         * no flash of un-masked text either.
         */
        const revealHeading = (
          el: HTMLElement,
          tl: gsap.core.Timeline,
          at: string | number,
        ) => {
          const split = SplitText.create(el, { type: "lines", mask: "lines" });
          splits.push(split);

          tl.from(
            split.lines,
            {
              yPercent: 115,
              duration: MOTION.heading,
              ease: MOTION.easeLong,
              stagger: MOTION.stagger,
            },
            at,
          );
        };

        /** A section's timeline, tied to its own scroll position. */
        const sectionTimeline = (section: Element, start = "top 78%") =>
          gsap.timeline({
            defaults: { ease: MOTION.ease },
            scrollTrigger: {
              trigger: section,
              start,
              once: true,
            },
          });

        // ---- hero: plays on load, not on scroll ---------------------------
        const hero = scope.querySelector<HTMLElement>("[data-hero-heading]");
        if (hero) {
          const tl = gsap.timeline({ defaults: { ease: MOTION.ease } });
          revealHeading(hero, tl, 0);
          tl.from(
            scope.querySelectorAll("[data-hero-line]"),
            {
              y: 18,
              autoAlpha: 0,
              duration: MOTION.line,
              stagger: MOTION.stagger,
            },
            0.15,
          );
        }

        // ---- the rest: one timeline per section ---------------------------
        scope.querySelectorAll<HTMLElement>("[data-section]").forEach((section) => {
          const kind = section.dataset.section;
          const tl = sectionTimeline(section);

          const heading = section.querySelector<HTMLElement>("[data-anim-heading]");
          if (heading) revealHeading(heading, tl, 0);

          const lines = section.querySelectorAll("[data-anim-line]");
          if (lines.length) {
            tl.from(
              lines,
              {
                y: 16,
                autoAlpha: 0,
                duration: MOTION.line,
                stagger: MOTION.stagger,
              },
              0.2,
            );
          }

          const items = section.querySelectorAll("[data-anim-item]");
          if (!items.length) return;

          // Treatment varies by section so the page is not one repeated
          // effect, while the easing family and stagger rhythm stay shared.
          if (kind === "steps") {
            // Numbered stages: the rule above each draws out, then the text.
            tl.from(
              section.querySelectorAll("[data-anim-rule]"),
              {
                scaleX: 0,
                transformOrigin: "left center",
                duration: 0.7,
                stagger: MOTION.stagger,
              },
              0.25,
            ).from(
              items,
              {
                y: 22,
                autoAlpha: 0,
                duration: MOTION.line,
                stagger: MOTION.stagger,
              },
              0.35,
            );
          } else if (kind === "pricing") {
            // Cards rise in sequence; the offer card comes in with weight.
            tl.from(
              items,
              {
                y: 34,
                autoAlpha: 0,
                duration: 0.75,
                stagger: MOTION.stagger,
              },
              0.25,
            );
            const featured = section.querySelector("[data-anim-item][data-featured]");
            if (featured) {
              tl.from(
                featured,
                { scale: 0.955, duration: 0.8, ease: MOTION.easeLong },
                0.25,
              );
            }
          } else {
            tl.from(
              items,
              {
                y: 20,
                autoAlpha: 0,
                duration: MOTION.line,
                stagger: MOTION.stagger,
              },
              0.25,
            );
          }
        });

        // ---- pricing card hover, via quickTo -------------------------------
        const cleanups: (() => void)[] = [];
        scope
          .querySelectorAll<HTMLElement>("[data-hover-lift]")
          .forEach((card) => {
            const to = gsap.quickTo(card, "y", {
              duration: 0.35,
              ease: "power3.out",
            });
            const enter = () => to(-6);
            const leave = () => to(0);
            card.addEventListener("pointerenter", enter);
            card.addEventListener("pointerleave", leave);
            card.addEventListener("focusin", enter);
            card.addEventListener("focusout", leave);
            cleanups.push(() => {
              card.removeEventListener("pointerenter", enter);
              card.removeEventListener("pointerleave", leave);
              card.removeEventListener("focusin", enter);
              card.removeEventListener("focusout", leave);
            });
          });

        return () => {
          cleanups.forEach((fn) => fn());
          splits.forEach((split) => split.revert());
        };
      });

      // Late layout shifts move every trigger.
      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh);

      return () => mm.revert();
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
