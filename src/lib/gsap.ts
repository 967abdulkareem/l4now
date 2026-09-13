"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Registered once, here, so no component has to remember to — and before any
// component runs, because `useGSAP` itself is a plugin.
gsap.registerPlugin(
  useGSAP,
  ScrollTrigger,
  DrawSVGPlugin,
  MotionPathPlugin,
  SplitText,
);

/**
 * One easing family and one stagger rhythm across the site, so sections can
 * differ in treatment without the page feeling like several websites.
 */
export const MOTION = {
  ease: "power3.out",
  easeLong: "expo.out",
  heading: 0.9,
  line: 0.7,
  stagger: 0.075,
} as const;

export {
  DrawSVGPlugin,
  MotionPathPlugin,
  ScrollTrigger,
  SplitText,
  gsap,
  useGSAP,
};
