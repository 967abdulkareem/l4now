/**
 * Every local URL in the build must resolve to a file that is actually there,
 * spelled exactly the same way.
 *
 *   npm run build
 *   node scripts/audit-links.mjs            # site served from /
 *   node scripts/audit-links.mjs /l4now     # served from /<repo>
 *
 * Two failures this catches that a browser on Windows will not:
 *
 * 1. Case. NTFS treats Logo.webp and logo.webp as the same file; the servers
 *    behind GitHub Pages do not. So the check compares against a listing of
 *    real names rather than asking the filesystem whether a path "exists",
 *    which would answer yes to the wrong spelling.
 * 2. Base path. Next rewrites its own bundle URLs when `basePath` is set but
 *    leaves hand-written ones alone, so a project-site deploy can serve every
 *    script and still 404 the logo.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, posix, relative, sep } from "node:path";

const OUT = "out";
const BASE = (process.argv[2] ?? "").replace(/\/$/, "");

/** Every file in the build, as a "/"-joined path, case intact. */
function walk(dir) {
  const found = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) found.push(...walk(full));
    else found.push("/" + relative(OUT, full).split(sep).join("/"));
  }
  return found;
}

const files = new Set(walk(OUT));
const pages = [...files].filter((f) => f.endsWith(".html"));

/* src="…", href="…", and the content of any meta that carries a URL. */
const ATTR = /(?:src|href)="([^"]+)"/g;
const META = /<meta[^>]+content="([^"]+)"/g;

let missing = 0;
let checked = 0;

for (const page of pages) {
  const html = readFileSync(join(OUT, page.slice(1)), "utf8");
  const urls = new Set();

  for (const [, url] of html.matchAll(ATTR)) urls.add(url);
  for (const [, url] of html.matchAll(META)) {
    if (/^(?:https?:)?\/|^\//.test(url)) urls.add(url);
  }

  for (const raw of urls) {
    // Only local files can be checked here; anchors and other origins cannot.
    if (/^(https?:)?\/\//.test(raw) || raw.startsWith("#")) continue;
    if (/^(data|mailto|tel|whatsapp):/.test(raw)) continue;
    if (!raw.startsWith("/")) continue;

    const path = raw.split(/[?#]/)[0];
    if (BASE && !path.startsWith(BASE + "/") && path !== BASE) {
      console.log(`  MISSING BASE PATH  ${path}   (in ${page})`);
      missing += 1;
      continue;
    }

    const local = BASE ? path.slice(BASE.length) || "/" : path;
    const candidates = local.endsWith("/")
      ? [posix.join(local, "index.html")]
      : [local, posix.join(local, "index.html")];

    checked += 1;
    if (!candidates.some((c) => files.has(c))) {
      // Name it precisely: a wrong case is a different bug from a wrong path.
      const wanted = candidates[0].toLowerCase();
      const near = [...files].find((f) => f.toLowerCase() === wanted);
      console.log(
        near
          ? `  CASE MISMATCH      ${local}   file is ${near}   (in ${page})`
          : `  404                ${local}   (in ${page})`,
      );
      missing += 1;
    }
  }
}

console.log(
  `\n${pages.length} pages, ${checked} local URLs, ${missing} broken` +
    (BASE ? `   base path ${BASE}` : "   served from /"),
);
process.exit(missing ? 1 : 0);
