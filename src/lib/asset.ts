/**
 * Prefixes a root-relative URL with the deployment's base path.
 *
 * Next rewrites its own bundle URLs (`/_next/...`) when `basePath` is set, and
 * `next/link` handles routes, but neither touches a string you wrote by hand:
 * `<img src="/logo.webp">` and `<a href="/privacy">` stay as they are and 404
 * on a GitHub Pages project site, where the app lives at `/<repo>/`. Anything
 * hand-written that starts at the site root goes through here.
 *
 * The value is inlined at build time, so this works in server and client
 * components alike.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBase(path: `/${string}`) {
  return `${BASE_PATH}${path}`;
}
