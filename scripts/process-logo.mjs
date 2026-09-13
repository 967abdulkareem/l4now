/**
 * Derives every image asset from the supplied logo, with no npm dependencies:
 * it drives the local headless Chrome already used for screenshots.
 *
 *   npm run logo
 *
 * Source:  public/logo.png  — 446x337 RGBA, already background-removed.
 *          It is used AS-IS. No background removal, no upscaling.
 *
 * Writes:
 *   public/favicon-32.png    transparent, for browser tabs
 *   public/favicon-180.png   transparent, apple-touch-icon
 *   public/favicon-512.png   composited on a WHITE SQUARE — the source is too
 *                            wide and too small to crop into a crisp square
 *   public/logo-header.png   the mark with the strapline band cropped off,
 *                            which is illegible at header size
 *   public/og.png            1200x630 white canvas, logo centred
 *   public/assets/testimonials/placeholder-1..6.svg
 *                            initials-on-colour avatars (written directly,
 *                            no browser needed)
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const SOURCE = "public/logo.png";
const PORT = 9335;
const CHROME =
  process.env.CHROME_PATH ??
  "C:/Program Files/Google/Chrome/Application/chrome.exe";

/* ---------------------------------------------------------- avatars ------ */
/* Plain SVG files — no browser, no external requests. */

/* Deliberately quiet greys: a placeholder should hold the shape of a photo
   without competing with the brand's red. */
const AVATAR_TONES = [
  ["#e9e7e3", "#b4aea6"],
  ["#e6e8e9", "#adb3b6"],
  ["#eae8e4", "#b7b0a7"],
  ["#e7e9e7", "#aeb5af"],
  ["#ebe8e6", "#b9b1ab"],
  ["#e6e7ea", "#aeb2b9"],
];

mkdirSync("public/assets/testimonials", { recursive: true });

AVATAR_TONES.forEach(([bg, fg], i) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 600" width="480" height="600" role="img" aria-label="Student photo placeholder">
  <rect width="480" height="600" fill="${bg}"/>
  <circle cx="240" cy="236" r="76" fill="${fg}"/>
  <path d="M96 520c0-84 64-140 144-140s144 56 144 140v80H96Z" fill="${fg}"/>
</svg>
`;
  writeFileSync(`public/assets/testimonials/placeholder-${i + 1}.svg`, svg);
  console.log(`  wrote public/assets/testimonials/placeholder-${i + 1}.svg`);
});

/* ------------------------------------------------------------- logo ------ */

if (!existsSync(SOURCE)) {
  console.error(`Missing ${SOURCE}. Put the supplied logo there and re-run.`);
  process.exit(1);
}

const dataUrl = `data:image/png;base64,${readFileSync(SOURCE).toString("base64")}`;

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

const script = `(async () => {
  const img = new Image();
  img.src = ${JSON.stringify(dataUrl)};
  await img.decode();
  const W = img.naturalWidth, H = img.naturalHeight;

  // Trim transparent margins so the mark fills whatever box it is placed in.
  const probe = document.createElement("canvas");
  probe.width = W; probe.height = H;
  const pctx = probe.getContext("2d");
  pctx.drawImage(img, 0, 0);
  const a = pctx.getImageData(0, 0, W, H).data;
  let minX = W, minY = H, maxX = 0, maxY = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (a[(y * W + x) * 4 + 3] > 8) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  if (maxX <= minX || maxY <= minY) { minX = 0; minY = 0; maxX = W - 1; maxY = H - 1; }
  const tw = maxX - minX + 1, th = maxY - minY + 1;

  // Never scale past the source's own pixels.
  const draw = (ctx, boxW, boxH, pad) => {
    const avail = Math.min(boxW - pad * 2, boxH - pad * 2);
    const scale = Math.min(avail / Math.max(tw, th), 1);
    const dw = tw * scale, dh = th * scale;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(probe, minX, minY, tw, th,
      (boxW - dw) / 2, (boxH - dh) / 2, dw, dh);
  };

  const out = {};

  // Transparent square favicons.
  for (const [name, size, pad] of [["favicon-32.png", 32, 1], ["favicon-180.png", 180, 8]]) {
    const c = document.createElement("canvas");
    c.width = size; c.height = size;
    draw(c.getContext("2d"), size, size, pad);
    out[name] = c.toDataURL("image/png").split(",")[1];
  }

  // 512: white square behind it, so the small wide source still reads.
  {
    const c = document.createElement("canvas");
    c.width = 512; c.height = 512;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 512, 512);
    draw(ctx, 512, 512, 44);
    out["favicon-512.png"] = c.toDataURL("image/png").split(",")[1];
  }

  // Header variant: the strapline band at the foot of the logo is illegible
  // at header size and reads as noise, so it is cropped off. The full logo,
  // strapline included, still goes in the footer.
  {
    const keep = Math.round(th * 0.845);
    const scale = 2;
    const c = document.createElement("canvas");
    c.width = Math.round(tw * scale); c.height = Math.round(keep * scale);
    const ctx = c.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(probe, minX, minY, tw, keep, 0, 0, c.width, c.height);
    out["logo-header.png"] = c.toDataURL("image/png").split(",")[1];
  }

  // Social card: 1200x630 white, logo centred.
  {
    const c = document.createElement("canvas");
    c.width = 1200; c.height = 630;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 1200, 630);
    const scale = Math.min((1200 - 320) / tw, (630 - 190) / th, 1.9);
    const dw = tw * scale, dh = th * scale;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(probe, minX, minY, tw, th, (1200 - dw) / 2, (630 - dh) / 2, dw, dh);
    out["og.png"] = c.toDataURL("image/png").split(",")[1];
  }

  return { out, native: [W, H], trimmed: [tw, th] };
})()`;

const res = await send("Runtime.evaluate", {
  expression: script,
  awaitPromise: true,
  returnByValue: true,
});
if (res.exceptionDetails) throw new Error(res.exceptionDetails.text);

const { out, native, trimmed } = res.result.value;
console.log(`  source ${SOURCE}: ${native.join("x")}, trimmed to ${trimmed.join("x")}`);
for (const [name, b64] of Object.entries(out)) {
  writeFileSync(`public/${name}`, Buffer.from(b64, "base64"));
  console.log(`  wrote public/${name}`);
}

ws.close();
chrome.kill();
