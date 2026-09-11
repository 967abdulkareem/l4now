"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registered once, here, so no component has to remember to do it.
//
// The GPS dot is positioned with the browser's own `getPointAtLength` rather
// than MotionPathPlugin: the route is rebuilt from measured layout on every
// resize, so reading the live <path> is both simpler and exactly in step with
// the stroke that is drawn.
gsap.registerPlugin(useGSAP, ScrollTrigger);

export { gsap, ScrollTrigger, useGSAP };
