/**
 * Generates every image asset the site needs, with no npm dependencies:
 * it drives the local headless Chrome that is already used for screenshots.
 *
 *   node scripts/process-logo.mjs
 *
 * LOGO
 *   Drop the supplied logo at  assets/logo-source.jpg  (.jpeg/.png also work)
 *   and re-run. The white background is keyed out to transparency and these
 *   are written to public/assets/logo/:
 *
 *     favicon-32.png  favicon-180.png  favicon-512.png
 *     logo-master.png (transparent, full size)
 *     logo-header.png (~300px wide)   logo-footer.png (~180px wide)
 *
 *   With no source file present it falls back to the built-in SVG mark, so
 *   the paths always resolve and the site is never missing an icon.
 *
 * TESTIMONIAL AVATARS
 *   Six neutral initials-on-a-circle placeholders, drawn here rather than
 *   fetched, into public/assets/testimonials/.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = 9335;
const CHROME =
  process.env.CHROME_PATH ??
  "C:/Program Files/Google/Chrome/Application/chrome.exe";

const SOURCE_CANDIDATES = [
  "assets/logo-source.jpg",
  "assets/logo-source.jpeg",
  "assets/logo-source.png",
  "assets/logo/source.jpg",
];

const LOGO_DIR = "public/assets/logo";
const AVATAR_DIR = "public/assets/testimonials";

/** White-ish pixels below this distance from pure white become transparent. */
const WHITE_TOLERANCE = 22;

const LOGO_SIZES = [
  ["favicon-32.png", 32],
  ["favicon-180.png", 180],
  ["favicon-512.png", 512],
  ["logo-header.png", 300],
  ["logo-footer.png", 180],
  ["logo-master.png", 1024],
];

/* The same mark as src/components/brand-logo.tsx, square for icon use. */
const FALLBACK_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <g transform="translate(126 40) scale(2)">
    <path d="M18 68A48 48 0 0 1 62 14" fill="none" stroke="#111" stroke-width="7" stroke-linecap="round"/>
    <path d="M114 68A48 48 0 0 0 70 14" fill="none" stroke="#e52222" stroke-width="7" stroke-linecap="round"/>
    <path d="M44 66 60 22h12l16 44Z" fill="#2f2f2f"/>
    <path d="M66 28v6M66.6 40v7M67.4 53v8" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M16 84c0-9 4-13 11-15l9-11c3-4 7-6 12-6h20c5 0 10 2 13 6l8 11c8 2 12 6 12 14v2H16Z" fill="#111"/>
    <path d="M49 59h10v10H41Zm16 0h6l8 10H65Z" fill="#fff" opacity=".9"/>
    <circle cx="38" cy="85" r="9" fill="#111"/><circle cx="38" cy="85" r="3.6" fill="#fff"/>
    <circle cx="90" cy="85" r="9" fill="#111"/><circle cx="90" cy="85" r="3.6" fill="#fff"/>
    <path d="M12 92h104" stroke="#e52222" stroke-width="4" stroke-linecap="round"/>
  </g>
  <text x="256" y="424" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="86" font-weight="800" letter-spacing="-3">
    <tspan fill="#e52222">L_4</tspan><tspan fill="#111">NOW</tspan>
  </text>
  <text x="256" y="464" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="27" font-weight="700" letter-spacing="6" fill="#111">DRIVING SCHOOL</text>
</svg>`;

const AVATAR_COLOURS = [
  "#e52222",
  "#111111",
  "#7a7a7a",
  "#b81212",
  "#3a3a3a",
  "#9a9a9a",
];

mkdirSync(LOGO_DIR, { recursive: true });
mkdirSync(AVATAR_DIR, { recursive: true });

/* ------------------------------------------------------------- chrome ---- */

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--user-data-dir=" + (process.env.TEMP ?? "/tmp") + "/l4now-logo",
    "about:blank",
  ],
  { stdio: "ignore" },
);

let ws;
let nextId = 1;
const pending = new Map();
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => {
  const r = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result?.value;
};

let wsUrl;
for (let i = 0; i < 60; i += 1) {
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, {
      method: "PUT",
    });
    wsUrl = (await res.json()).webSocketDebuggerUrl;
    break;
  } catch {
    await sleep(500);
  }
}
if (!wsUrl) throw new Error("Could not reach headless Chrome");

ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message));
    else resolve(msg.result);
  }
});
await send("Runtime.enable");

/* --------------------------------------------------------------- logo ---- */

const source = SOURCE_CANDIDATES.find((f) => existsSync(f));
let dataUrl;

if (source) {
  const ext = source.split(".").pop().toLowerCase();
  const mime = ext === "png" ? "image/png" : "image/jpeg";
  dataUrl = `data:${mime};base64,${readFileSync(source).toString("base64")}`;
  console.log(`logo source: ${source} (white background will be removed)`);
} else {
  dataUrl = `data:image/svg+xml;base64,${Buffer.from(FALLBACK_SVG).toString("base64")}`;
  console.log(
    "logo source: none found — using the built-in mark.\n" +
      "             Drop the real file at assets/logo-source.jpg and re-run.",
  );
}

const keyOut = source ? "true" : "false";

const logoScript = `(async () => {
  const img = new Image();
  img.src = ${JSON.stringify(dataUrl)};
  await img.decode();

  // Draw at native size, then key out the white background.
  const w = img.naturalWidth || 1024;
  const h = img.naturalHeight || 1024;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);

  if (${keyOut}) {
    const px = ctx.getImageData(0, 0, w, h);
    const d = px.data;
    const tol = ${WHITE_TOLERANCE};
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const dist = Math.max(255 - r, 255 - g, 255 - b);
      if (dist <= tol) {
        d[i + 3] = 0;                       // solid background -> clear
      } else if (dist <= tol * 3) {
        // Feather the anti-aliased rim so edges do not look cut out.
        d[i + 3] = Math.round(255 * ((dist - tol) / (tol * 2)));
      }
    }
    ctx.putImageData(px, 0, 0);
  }

  // Trim fully transparent margins so the mark fills its box.
  let minX = w, minY = h, maxX = 0, maxY = 0;
  const scan = ctx.getImageData(0, 0, w, h).data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (scan[(y * w + x) * 4 + 3] > 8) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  if (maxX <= minX || maxY <= minY) { minX = 0; minY = 0; maxX = w - 1; maxY = h - 1; }
  const tw = maxX - minX + 1, th = maxY - minY + 1;

  const out = {};
  for (const [name, size] of ${JSON.stringify(LOGO_SIZES)}) {
    // Square for the favicons, aspect-preserving for the header/footer marks.
    const square = name.startsWith("favicon") || name === "logo-master";
    const scale = square
      ? size / Math.max(tw, th)
      : size / tw;
    const ow = square ? size : Math.round(tw * scale);
    const oh = square ? size : Math.round(th * scale);

    const o = document.createElement("canvas");
    o.width = ow; o.height = oh;
    const octx = o.getContext("2d");
    octx.imageSmoothingQuality = "high";
    const dw = Math.round(tw * scale), dh = Math.round(th * scale);
    octx.drawImage(c, minX, minY, tw, th, (ow - dw) / 2, (oh - dh) / 2, dw, dh);
    out[name] = o.toDataURL("image/png").split(",")[1];
  }
  return out;
})()`;

const logos = await evaluate(logoScript);
for (const [name, b64] of Object.entries(logos)) {
  writeFileSync(`${LOGO_DIR}/${name}`, Buffer.from(b64, "base64"));
  console.log(`  wrote ${LOGO_DIR}/${name}`);
}

/* ------------------------------------------------------------ avatars ---- */

const avatarScript = `(() => {
  const colours = ${JSON.stringify(AVATAR_COLOURS)};
  const out = {};
  for (let i = 0; i < 6; i++) {
    const size = 160;
    const c = document.createElement("canvas");
    c.width = size; c.height = size;
    const ctx = c.getContext("2d");
    ctx.fillStyle = colours[i];
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 62px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SN", size / 2, size / 2 + 3);
    out["placeholder-" + (i + 1) + ".png"] = c.toDataURL("image/png").split(",")[1];
  }
  return out;
})()`;

const avatars = await evaluate(avatarScript);
for (const [name, b64] of Object.entries(avatars)) {
  writeFileSync(`${AVATAR_DIR}/${name}`, Buffer.from(b64, "base64"));
  console.log(`  wrote ${AVATAR_DIR}/${name}`);
}

ws.close();
chrome.kill();
