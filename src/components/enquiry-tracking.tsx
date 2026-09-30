"use client";

import { useEffect } from "react";
import { trackEnquiry } from "@/lib/analytics";

export function EnquiryTracking() {
  useEffect(() => {
    const track = (event: MouseEvent) => {
      if (event.defaultPrevented || (event.type === "auxclick" && event.button !== 1)) return;
      const link = event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>("a[data-enquiry-source]")
        : null;
      if (link?.dataset.enquirySource) trackEnquiry(link.dataset.enquirySource);
    };
    document.addEventListener("click", track);
    document.addEventListener("auxclick", track);
    return () => {
      document.removeEventListener("click", track);
      document.removeEventListener("auxclick", track);
    };
  }, []);
  return null;
}
