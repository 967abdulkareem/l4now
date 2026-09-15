/**
 * Derives every image asset from the supplied logo, with no npm dependencies:
 * it drives the local headless Chrome already used for screenshots.
 *
 *   npm run logo
 *
 * Source:  brand/logo-source.png — 446x337 RGBA, already background-removed.
 *          Kept out of public/ so the full-size original is never served:
 *          every mark on the page is one of the sized copies below.
 *
 * Writes:
 *   public/favicon-32.png    transparent, for browser tabs
 *   public/favicon-180.png   transparent, apple-touch-icon
 *   public/favicon-512.webp  composited on a WHITE SQUARE — the source is too
 *                            wide and too small to crop into a crisp square
 *   public/logo.webp         the whole mark at twice its largest slot, for
 *                            the footer
 *   public/logo-header.webp  the mark with the strapline band cropped off —
 *                            illegible at header size — also at 2x its slot
 *   public/og.jpg            1200x630 white canvas, logo centred
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const SOURCE = "brand/logo-source.png";
const PORT = 9335;
const CHROME =
  process.env.CHROME_PATH ??
  "C:/Program Files/Google/Chrome/Application/chrome.exe";

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
    // WebP: only Android and desktop PWAs ask for this one, and both read
    // it. As PNG-24 the same square is four times the size.
    out["favicon-512.webp"] = c.toDataURL("image/webp", 0.9).split(",")[1];
  }

  // Header variant: the strapline band at the foot of the logo is illegible
  // at header size and reads as noise, so it is cropped off. The full logo,
  // strapline included, still goes in the footer.
  {
    const keep = Math.round(th * 0.845);
    // Twice the widest slot it is drawn into (180 CSS px), not twice the
    // source: a 876px-wide PNG for a 180px mark is most of a slow first load.
    const W = 400;
    const c = document.createElement("canvas");
    c.width = W; c.height = Math.round((W / tw) * keep);
    const ctx = c.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(probe, minX, minY, tw, keep, 0, 0, c.width, c.height);
    // WebP, not PNG: the mark is a shaded illustration with an alpha edge,
    // which PNG-24 stores at around 100KB and WebP at a tenth of that with
    // the transparency intact.
    out["logo-header.webp"] = c.toDataURL("image/webp", 0.82).split(",")[1];
  }

  // The whole mark, strapline included, for the footer — same reasoning.
  {
    const W = 400;
    const c = document.createElement("canvas");
    c.width = W; c.height = Math.round((W / tw) * th);
    const ctx = c.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(probe, minX, minY, tw, th, 0, 0, c.width, c.height);
    out["logo.webp"] = c.toDataURL("image/webp", 0.82).split(",")[1];
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
    // JPEG: a 1200x630 white card with one mark on it costs 200KB as PNG
    // and 30KB here, and no one zooms into a social preview.
    out["og.jpg"] = c.toDataURL("image/jpeg", 0.88).split(",")[1];
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
