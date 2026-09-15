"use client";

import { useRef, type ReactNode } from "react";

import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";
import { HERO_PINS, MAP_VIEWBOX, ROUTE_PTS } from "@/lib/map-data";

type Pt = [number, number];

/** Corner softening on the layout-driven part of the route. */
const CORNER = 22;

/* ------------------------------------------------------------------ maths */

/** Axis-aligned polyline -> path string, with small radii on the corners. */
function roundedPath(pts: Pt[], radius: number) {
  if (pts.length < 2) return "";
  const d = [`M ${round(pts[0][0])} ${round(pts[0][1])}`];

  for (let i = 1; i < pts.length - 1; i += 1) {
    const [p0, p1, p2] = [pts[i - 1], pts[i], pts[i + 1]];
    const v0: Pt = [p1[0] - p0[0], p1[1] - p0[1]];
    const v1: Pt = [p2[0] - p1[0], p2[1] - p1[1]];
    const l0 = Math.hypot(...v0) || 1;
    const l1 = Math.hypot(...v1) || 1;
    const r = Math.min(radius, l0 / 2, l1 / 2);
    const a: Pt = [p1[0] - (v0[0] / l0) * r, p1[1] - (v0[1] / l0) * r];
    const b: Pt = [p1[0] + (v1[0] / l1) * r, p1[1] + (v1[1] / l1) * r];
    d.push(`L ${round(a[0])} ${round(a[1])}`);
    d.push(`Q ${round(p1[0])} ${round(p1[1])} ${round(b[0])} ${round(b[1])}`);
  }

  const last = pts[pts.length - 1];
  d.push(`L ${round(last[0])} ${round(last[1])}`);
  return d.join(" ");
}

const round = (n: number) => Math.round(n * 10) / 10;

/** Drops points that would double back or sit on top of their neighbour. */
function tidy(pts: Pt[]) {
  const out: Pt[] = [];
  for (const p of pts) {
    const prev = out[out.length - 1];
    if (prev && Math.hypot(p[0] - prev[0], p[1] - prev[1]) < 2) continue;
    out.push(p);
  }
  return out;
}

const DESKTOP_MAP_CROP = {
  x: 0,
  y: 0,
  w: MAP_VIEWBOX.w,
  h: MAP_VIEWBOX.h,
  alignX: 0.5,
  alignY: 0.5,
} as const;

type Crop = typeof DESKTOP_MAP_CROP;

/**
 * The map SVG uses `preserveAspectRatio="… slice"`, so design-space points
 * have to go through the same transform to land on the drawn roads.
 */
function mapProjector(box: Box, crop: Crop) {
  const scale = Math.max(box.w / crop.w, box.h / crop.h);
  const dx = box.left + (box.w - crop.w * scale) * crop.alignX - crop.x * scale;
  const dy = box.top + (box.h - crop.h * scale) * crop.alignY - crop.y * scale;
  return (p: readonly [number, number]): Pt => [
    dx + p[0] * scale,
    dy + p[1] * scale,
  ];
}

type Box = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
};

/* -------------------------------------------------------------- component */

/**
 * One continuous GPS route across the hero, the three stages, the course
 * cards and the booking panel.
 *
 * The route is built in the wrapper's own pixel space from measured layout —
 * lane elements and card edges — so it always runs through real empty space
 * rather than across content, at any width. It is rebuilt on resize.
 */
export function RouteJourney({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = wrap.current;
      if (!root) return;

      const svg = root.querySelector<SVGSVGElement>("[data-route-svg]");
      const base = root.querySelector<SVGPathElement>('[data-route="base"]');
      const done = root.querySelector<SVGPathElement>('[data-route="done"]');
      const dot = root.querySelector<SVGGElement>("[data-gps-dot]");
      const finishMark = root.querySelector<SVGGElement>("[data-destination]");
      if (!svg || !base || !done || !dot || !finishMark) return;

      const pins = Array.from(
        root.querySelectorAll<SVGGElement>("[data-route-pin]"),
      );
      const cards = Array.from(
        root.querySelectorAll<HTMLElement>("[data-course-card]"),
      );

      const box = (el: Element | null, wrapRect: DOMRect): Box | null => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          left: r.left - wrapRect.left,
          top: r.top - wrapRect.top,
          right: r.right - wrapRect.left,
          bottom: r.bottom - wrapRect.top,
          w: r.width,
          h: r.height,
          cx: r.left - wrapRect.left + r.width / 2,
          cy: r.top - wrapRect.top + r.height / 2,
        };
      };

      /** Builds the waypoints for the current layout. */
      function buildRoute() {
        const wrapRect = root!.getBoundingClientRect();
        const W = root!.offsetWidth;
        const H = root!.offsetHeight;
        const wide = window.matchMedia("(min-width: 1024px)").matches;

        const get = (sel: string) =>
          box(root!.querySelector(sel), wrapRect);

        const finish = get("[data-route-anchor='finish']");
        if (!finish) return null;

        const pts: Pt[] = [];
        const pinPoints: Pt[] = [];

        if (wide) {
          const map = get("[data-route-anchor='map']");
          const laneRight = get("[data-lane='right']");
          const laneLeft = get("[data-lane='left']");
          const grid = get("[data-course-grid]");
          if (!map || !laneRight || !laneLeft || !grid) return null;

          const project = mapProjector(map, DESKTOP_MAP_CROP);

          // 1. The hero, following the drawn primary road.
          const hero = ROUTE_PTS.slice(0, -1).map(project);
          pts.push(...hero);
          HERO_PINS.forEach((p) => pinPoints.push(project([p.x, p.y])));

          const exit = hero[hero.length - 1];
          const xRight = laneRight.cx;
          const xLeft = laneLeft.cx;

          // 2. Step across to the right-hand lane while still over the map —
          //    doing it below the hero would put a horizontal run within a
          //    few pixels of the next section's heading — then straight down
          //    the lane past the stages.
          pts.push([exit[0], map.bottom - 34]);
          pts.push([xRight, map.bottom - 34]);
          pts.push([xRight, grid.top - 40]);

          // 4. Thread the gutters. The cards in a row are the same height —
          //    misaligned cards read as a mistake — so the weave comes from
          //    the grid's own empty columns instead of a vertical stagger:
          //    in above the row, down the first gutter, across the row gap,
          //    down the second gutter, out below the grid.
          const rowCards = Array.from(
            root!.querySelectorAll<HTMLElement>("[data-route-row]"),
          );
          const rects = (rowCards.length ? rowCards : cards)
            .map((c) => box(c, wrapRect))
            .filter((b): b is Box => Boolean(b));

          const yAbove = grid.top - 40;
          pts.push([xLeft, yAbove]);

          if (rects.length === 3) {
            const [c1, c2, c3] = rects;
            const g1 = (c1.right + c2.left) / 2;
            const g2 = (c2.right + c3.left) / 2;
            // Midway down the gap between the two rows, so the crossing run
            // clears both of them.
            const yGap = (c1.bottom + Math.min(grid.bottom, c1.bottom + 64)) / 2;

            // The grid box can sit a little above its own last row, so take
            // the lowest card rather than trusting the container.
            const cardBottoms = cards
              .map((c) => box(c, wrapRect)?.bottom ?? 0)
              .concat(grid.bottom);
            const yBelow = Math.max(...cardBottoms) + 36;

            pts.push([g1, yAbove]);
            pts.push([g1, yGap]);
            pts.push([g2, yGap]);
            pts.push([g2, yBelow]);
            pts.push([xRight, yBelow]);
          } else {
            pts.push([xRight, yAbove]);
            pts.push([xRight, grid.bottom + 40]);
          }

          // 5. Down and across to the destination marker.
          pts.push([xRight, finish.cy]);
          pts.push([finish.cx, finish.cy]);
        } else {
          // Small screens: the same map route through the hero — cropped to
          // a portrait window — then one reserved gutter down the left-hand
          // side, with a small bend beside each card. Never over the content.
          const lane = get("[data-lane='left']");
          const laneR = get("[data-lane='right']");
          // Not the middle of the gutter: a run down the outer third of it
          // stands clear of the card by about half a card corner, which is
          // what stops the wave reading as a box drawn around the card.
          const laneX = lane ? lane.left + lane.w * 0.28 : 24;
          const grid = get("[data-course-grid]");

          // Below `lg` the map carries no route and no pins — at portrait
          // width they landed in the content column. What remains is a single
          // red line hanging from under the header and threading the
          // sections. It starts below the header rather than behind it, so it
          // never crosses the logo.
          const headerH =
            Number.parseFloat(
              getComputedStyle(document.documentElement).getPropertyValue(
                "--header-h",
              ),
            ) * 16 || 92;
          pts.push([laneX, headerH + 10]);

          const rects = cards
            .map((c) => box(c, wrapRect))
            .filter((b): b is Box => Boolean(b));

          // The cards are stacked one per row, so the line squares off around
          // them: down one side of a card, across the gap below it, down the
          // other side of the next. The left run sits in the reserved gutter;
          // the right one sits in the shell's own padding, clear of the card
          // edge by more than the stroke. One crossing per gap, so the shape
          // reads as a square wave rather than a ladder.
          const xLeft = laneX;
          const xRight = laneR ? laneR.cx : W - 14;
          let x = xLeft;

          rects.forEach((c, i) => {
            const next = rects[i + 1];
            // Cross in the middle of the gap, not against the card, so the
            // turn reads as part of the wave rather than a box drawn round
            // the card.
            const turn = next ? (c.bottom + next.top) / 2 : c.bottom + 26;
            pts.push([x, turn]);
            if (next) {
              x = x === xLeft ? xRight : xLeft;
              pts.push([x, turn]);
            }
          });

          // Back into the gutter for the run down to the booking form.
          if (rects.length && x !== xLeft) {
            const out = rects[rects.length - 1].bottom + 26;
            pts.push([xRight, out]);
            pts.push([xLeft, out]);
          }

          if (grid) pts.push([laneX, grid.bottom + 40]);
          pts.push([laneX, finish.cy]);
          pts.push([finish.cx, finish.cy]);
        }

        const clean = tidy(pts);
        const d = roundedPath(clean, wide ? CORNER : 20);

        svg!.setAttribute("viewBox", `0 0 ${W} ${H}`);
        base!.setAttribute("d", d);
        done!.setAttribute("d", d);

        // The SVG is in page pixels, so these are real widths, not units that
        // scale with the viewport: on a phone the same 2.6px dashed line
        // disappears next to 16px type, and the dot is easy to lose.
        const phone = window.matchMedia("(max-width: 767px)").matches;
        base!.setAttribute("stroke-width", phone ? "3.2" : "2.6");
        base!.setAttribute("stroke-opacity", phone ? "0.45" : "0.28");
        base!.setAttribute("stroke-dasharray", phone ? "9 8" : "7 7");
        done!.setAttribute("stroke-width", phone ? "4.4" : "3.4");
        gsap.set(dot!, { scale: phone ? 1.25 : 1, transformOrigin: "50% 50%" });

        finishMark!.setAttribute(
          "transform",
          `translate(${round(finish.cx)} ${round(finish.cy)})`,
        );

        pins.forEach((pin, i) => {
          const p = pinPoints[i];
          pin.dataset.placed = p ? "1" : "0";
          if (!p) {
            pin.setAttribute("opacity", "0");
            return;
          }
          pin.setAttribute(
            "transform",
            `translate(${round(p[0])} ${round(p[1])})`,
          );

          // Narrow screens run out of room to the right of a pin, so the
          // label flips to the other side rather than being clipped.
          const label = pin.querySelector<SVGGElement>("[data-pin-label]");
          const chip = label?.querySelector("rect");
          if (!label || !chip) return;
          const labelW = Number(chip.getAttribute("width") ?? 0);
          const flip = p[0] + 14 + labelW > W - 10;
          label.setAttribute(
            "transform",
            flip
              ? `translate(${round(-14 - labelW)} -13)`
              : "translate(14 -13)",
          );
        });

        return true;
      }

      /** Fraction along the path closest to a given point. */
      function fractionNear(path: SVGPathElement, x: number, y: number) {
        const total = path.getTotalLength();
        let best = 0;
        let bestD = Infinity;
        const steps = 400;
        for (let i = 0; i <= steps; i += 1) {
          const f = i / steps;
          const p = path.getPointAtLength(total * f);
          const dd = (p.x - x) ** 2 + (p.y - y) ** 2;
          if (dd < bestD) {
            bestD = dd;
            best = f;
          }
        }
        return best;
      }

      /**
       * Scroll progress → distance along the path.
       *
       * The two are not the same thing. The phone route squares off around
       * every card, so a third of its length is horizontal: mapped straight
       * across, the dot spends that third travelling sideways while the page
       * scrolls past it, and by the pricing grid it is a screen behind what
       * you are reading. This weights each step by how far it moves *down*
       * the page, with a little credit for sideways travel so the corners
       * still animate, which keeps the dot level with the reading line at
       * any width.
       */
      function buildProgressMap(path: SVGPathElement) {
        const total = path.getTotalLength();
        const STEPS = 400;
        const cumulative = [0];
        let prev = path.getPointAtLength(0);
        for (let i = 1; i <= STEPS; i += 1) {
          const p = path.getPointAtLength((total * i) / STEPS);
          const travel = Math.abs(p.y - prev.y) + 0.18 * Math.abs(p.x - prev.x);
          cumulative.push(cumulative[i - 1] + travel);
          prev = p;
        }
        const span = cumulative[STEPS] || 1;

        // 101 evenly spaced samples: enough to interpolate between without
        // walking the path on every scroll event.
        const table = new Array<number>(101);
        let j = 0;
        for (let k = 0; k <= 100; k += 1) {
          const target = (k / 100) * span;
          while (j < STEPS && cumulative[j + 1] < target) j += 1;
          const step = cumulative[j + 1] - cumulative[j] || 1;
          table[k] = (j + (target - cumulative[j]) / step) / STEPS;
        }
        return table;
      }

      const mm = gsap.matchMedia();

      // ---- reduced motion: the whole route, dot parked at the destination --
      mm.add("(prefers-reduced-motion: reduce)", () => {
        const draw = () => {
          if (!buildRoute()) return;
          gsap.set(done, { drawSVG: "0% 100%" });
          const end = base.getPointAtLength(base.getTotalLength());
          gsap.set(dot, { transformOrigin: "50% 50%", x: end.x, y: end.y, opacity: 1 });
          gsap.set(finishMark, { opacity: 1 });
          pins.forEach((p) => {
            if (p.dataset.placed === "1") gsap.set(p, { opacity: 1 });
          });
          cards.forEach((c) => {
            c.dataset.passed = "true";
          });
        };

        draw();

        // Same story as the animated branch: the route is layout-derived, so
        // it has to be redrawn whenever the layout settles or changes.
        let pending = 0;
        const redraw = () => {
          window.clearTimeout(pending);
          pending = window.setTimeout(draw, 120);
        };
        const observer = new ResizeObserver(redraw);
        observer.observe(root);
        window.addEventListener("resize", redraw);
        document.fonts?.ready.then(redraw);

        return () => {
          window.clearTimeout(pending);
          observer.disconnect();
          window.removeEventListener("resize", redraw);
        };
      });

      // ---- scroll-linked -------------------------------------------------
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        let cardStops: number[] = [];
        let pinStops: number[] = [];

        const layout = () => {
          const built = buildRoute();
          if (!built) return;

          const wrapRect = root.getBoundingClientRect();
          cardStops = cards.map((c) => {
            const b = box(c, wrapRect)!;
            // The point on the route level with the middle of the card.
            return fractionNear(base, b.cx, b.cy);
          });
          pinStops = pins.map((pin) => {
            const t = pin.getAttribute("transform") ?? "";
            const m = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(t);
            if (!m) return 2;
            return fractionNear(base, Number(m[1]), Number(m[2]));
          });
        };

        layout();

        // Everything that is not the stroke or the dot: which cards have been
        // passed, which stops have lit, whether the destination is reached.
        // Driven from ScrollTrigger's own progress so it reverses exactly.
        const applyStates = (at: number) => {
          cards.forEach((card, i) => {
            const passed = at >= (cardStops[i] ?? 2) - 0.005;
            const next = passed ? "true" : "false";
            if (card.dataset.passed !== next) card.dataset.passed = next;
          });
          pins.forEach((pin, i) => {
            if (pin.dataset.placed !== "1") return;
            gsap.set(pin, { opacity: at >= (pinStops[i] ?? 2) ? 1 : 0.28 });
          });
          gsap.set(finishMark, { opacity: at > 0.985 ? 1 : 0.5 });
        };

        gsap.set(dot, { transformOrigin: "50% 50%" });
        applyStates(0);

        let progressMap = buildProgressMap(base);
        const mapProgress = (p: number) => {
          const at = gsap.utils.clamp(0, 1, p) * 100;
          const i = Math.floor(at);
          const a = progressMap[i] ?? p;
          const b = progressMap[Math.min(100, i + 1)] ?? a;
          return a + (b - a) * (at - i);
        };

        // The route draws itself with DrawSVG and the dot rides the same path
        // with MotionPath, on one paused timeline — so they cannot drift
        // apart, and the timeline is scrubbed by hand rather than by
        // ScrollTrigger so the mapping above can sit in between.
        const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
        tl.fromTo(
          done,
          { drawSVG: "0% 0%" },
          { drawSVG: "0% 100%", duration: 1 },
          0,
        ).to(dot, { motionPath: { path: base }, duration: 1 }, 0);

        const render = (scrolled: number) => {
          const at = mapProgress(scrolled);
          tl.progress(at);
          applyStates(at);
        };

        const trigger = ScrollTrigger.create({
          // Tied to reading position: the dot sits level with whatever is in
          // the middle of the viewport, and lands on the destination marker
          // exactly as that marker reaches the middle.
          trigger: root,
          start: "top center",
          endTrigger: "[data-route-anchor='finish']",
          end: "center center",
          onUpdate: (self) => render(self.progress),
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            // The path is rebuilt from measured layout, so DrawSVG and
            // MotionPath have to re-read it, and the mapping has to be
            // measured again against the new geometry.
            layout();
            tl.invalidate();
            progressMap = buildProgressMap(base);
            render(self.progress);
          },
        });

        render(trigger.progress);

        // Anything that changes the page height moves every anchor the route
        // is built from: viewport resize, webfonts swapping in, an accordion
        // opening. A ResizeObserver catches all of them.
        let pending = 0;
        const refresh = () => {
          window.clearTimeout(pending);
          pending = window.setTimeout(() => ScrollTrigger.refresh(), 120);
        };

        const observer = new ResizeObserver(refresh);
        observer.observe(root);
        window.addEventListener("resize", refresh);
        document.fonts?.ready.then(refresh);

        return () => {
          window.clearTimeout(pending);
          observer.disconnect();
          window.removeEventListener("resize", refresh);
        };
      });

      return () => mm.revert();
    },
    { scope: wrap },
  );

  return (
    <div ref={wrap} data-journey className="relative">
      <svg
        data-route-svg
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="none"
      >
        <path
          data-route="base"
          fill="none"
          stroke="#e52222"
          strokeOpacity="0.28"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="7 7"
        />
        <path
          data-route="done"
          fill="none"
          stroke="#e52222"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Labelled stops on the hero map. Decorative: the same three points
            are written out as real text beside the headline. */}
        {HERO_PINS.map((pin) => (
          <g key={pin.id} data-route-pin opacity="0.25">
            <circle r="5.5" fill="#e52222" />
            <circle r="2" fill="#ffffff" />
            <g data-pin-label transform="translate(14 -13)">
              <rect
                width={pin.label.length * 7.1 + 22}
                height="26"
                rx="7"
                fill="#ffffff"
                stroke="#e3e2db"
              />
              <text
                x="11"
                y="17.5"
                fontSize="12.5"
                fontWeight="500"
                fill="#111111"
                fontFamily="var(--font-jakarta), system-ui, sans-serif"
              >
                {pin.label}
              </text>
            </g>
          </g>
        ))}

        {/* Destination */}
        <g data-destination opacity="0.5">
          <circle r="17" fill="#e52222" fillOpacity="0.1" />
          <path
            d="M0 4c-5.4-7.6-8-11-8-15.4A8 8 0 1 1 8-11.4C8-7 5.4-3.6 0 4Z"
            fill="#e52222"
          />
          <circle cy="-11.4" r="3" fill="#ffffff" />
        </g>

        {/* The single moving GPS dot. */}
        <g data-gps-dot>
          <circle r="14" fill="#e52222" fillOpacity="0.12" />
          <circle r="7.5" fill="#ffffff" />
          <circle r="5" fill="#e52222" />
        </g>
      </svg>

      {children}
    </div>
  );
}
