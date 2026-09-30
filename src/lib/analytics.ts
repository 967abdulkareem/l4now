/** Only fixed UI labels are sent; never include form details or WhatsApp URLs. */
export function trackEnquiry(source: string) {
  try {
    const analytics = window as Window & {
      gtag?: (...args: unknown[]) => void;
    };
    analytics.gtag?.("event", "generate_lead", {
      send_to: "G-76P2T1RNS7",
      contact_method: "whatsapp",
      enquiry_source: source,
    });
  } catch {
    // Analytics must never prevent an enquiry from opening.
  }
}
