/* ───────────────────────────────────────────────────────────────────────────
 * WHATSAPP NUMBER — change it here and nowhere else.
 *
 * Digits only: country code first, no "+", no spaces, no brackets.
 * UK example: +44 7404 697331  →  "447404697331"
 * ────────────────────────────────────────────────────────────────────────── */
export const WHATSAPP_NUMBER = "447404697331";

/** Pretty version, for anything shown on screen. */
export const WHATSAPP_DISPLAY = "+44 7404 697331";

/**
 * Builds a wa.me link with the message pre-filled.
 *
 * This needs no API key and no server: the visitor's own WhatsApp opens with
 * the text ready, and they press send. See NOTES.md for the automated
 * WhatsApp Cloud API upgrade path.
 */
export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
