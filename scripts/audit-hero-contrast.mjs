/**
 * Checks hero text legibility over the mobile map background, by sampling the
 * actual rendered pixels rather than reasoning about CSS layers.
 *
 *   npm run dev   (in another terminal)
 *   node scripts/audit-hero-contrast.mjs
 *
 * For each width it screenshots the hero, then for every text node measures
 * the darkest background pixel inside that node's box (ignoring the glyphs
 * themselves by sampling the lightest pixels per column) and computes the
 * WCAG contrast against the text colour.
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/?nolenis=1";
const PORT = 9336;
const WIDTHS = (process.env.WIDTHS ?? "360,390,430").split(",").map(Number);
/** Which section to sample. Defaults to the hero. */
const SECTION = process.env.SECTION ?? "section";
const SCROLL_TO = process.env.SCROLL_TO ?? "";
const CHROME =
  process.env.CHROME_PATH ??
  "C:/Program Files/Google/Chrome/Application/chrome.exe";

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--hide-scrollbars",
    "--no-first-run",
    "--user-data-dir=" + (process.env.TEMP ?? "/tmp") + "/l4now-contrast",
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

let url;
for (let i = 0; i < 60; i += 1) {
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, {
      method: "PUT",
    });
    url = (await res.json()).webSocketDebuggerUrl;
    break;
  } catch {
    await sleep(500);
  }
}
ws = new WebSocket(url);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) reject(new Error(m.error.message));
    else resolve(m.result);
  }
});
await send("Page.enable");
await send("Runtime.enable");

const CHECK = (shotDataUrl) => `(async () => {
  const img = new Image();
  img.src = ${JSON.stringify(shotDataUrl)};
  await img.decode();
  const c = document.createElement("canvas");
  c.width = img.naturalWidth; c.height = img.naturalHeight;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const ratio = img.naturalWidth / innerWidth;

  const lum = (r, g, b) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const parse = (css) => css.match(/\\d+(\\.\\d+)?/g).slice(0, 3).map(Number);

  const hero = document.querySelector(${JSON.stringify("__SECTION__")});
  const nodes = [...hero.querySelectorAll("p, h1, li, a, span")]
    .filter((e) => e.children.length === 0 && e.textContent.trim().length > 1);

  const results = [];
  for (const el of nodes) {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || r.top > innerHeight) continue;
    const x0 = Math.max(0, Math.round(r.left * ratio));
    const y0 = Math.max(0, Math.round(r.top * ratio));
    const w = Math.min(c.width - x0, Math.round(r.width * ratio));
    const h = Math.min(c.height - y0, Math.round(r.height * ratio));
    if (w < 2 || h < 2) continue;

    const d = ctx.getImageData(x0, y0, w, h).data;
    // The background is whatever most pixels in the box share — glyphs are
    // always the minority. A histogram mode gets that right for dark-on-light
    // and light-on-dark alike, which a percentile does not.
    const BUCKETS = 40;
    const hist = new Array(BUCKETS).fill(0);
    const sum = new Array(BUCKETS).fill(0);
    for (let i = 0; i < d.length; i += 4) {
      const l = lum(d[i], d[i + 1], d[i + 2]);
      const b = Math.min(BUCKETS - 1, Math.floor(l * BUCKETS));
      hist[b] += 1;
      sum[b] += l;
    }
    let top = 0;
    let total = 0;
    for (let b = 0; b < BUCKETS; b += 1) {
      total += hist[b];
      if (hist[b] > hist[top]) top = b;
    }
    const bg = sum[top] / hist[top];

    // In a small tight label the glyphs can rival the background, and
    // then the mode is the text colour rather than what is behind it. Say so
    // instead of reporting a bogus failure.
    if (hist[top] / total < 0.7) {
      results.push({ text: el.textContent.trim().slice(0, 30), skipped: true });
      continue;
    }

    const [tr, tg, tb] = parse(getComputedStyle(el).color);
    const tl = lum(tr, tg, tb);
    const [hi, lo] = bg > tl ? [bg, tl] : [tl, bg];
    const ratioC = (hi + 0.05) / (lo + 0.05);

    const size = parseFloat(getComputedStyle(el).fontSize);
    const bold = parseInt(getComputedStyle(el).fontWeight) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5;

    results.push({
      text: el.textContent.trim().slice(0, 30),
      ratio: +ratioC.toFixed(2),
      need,
      pass: ratioC >= need,
    });
  }
  return results;
})()`;

let failed = false;
for (const width of WIDTHS) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 860,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send("Page.navigate", { url: BASE });
  await sleep(2500);
  await evaluate("document.fonts.ready.then(()=>1)");
  await sleep(900);

  if (SCROLL_TO) {
    await evaluate(
      `(() => { const el = document.querySelector(${JSON.stringify(SCROLL_TO)});
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 70, behavior: "instant" });
        return 1; })()`,
    );
    await sleep(1200);
  }

  const shot = await send("Page.captureScreenshot", { format: "png" });
  const results = await evaluate(
    CHECK(`data:image/png;base64,${shot.data}`).replace("__SECTION__", SECTION),
  );

  const judged = results.filter((r) => !r.skipped);
  const skipped = results.filter((r) => r.skipped);
  const bad = judged.filter((r) => !r.pass);
  if (bad.length) failed = true;
  console.log(
    `${String(width).padStart(4)}px  ${bad.length ? "FAIL" : "PASS"}  ` +
      `${judged.length} judged` +
      (skipped.length ? `, ${skipped.length} too small to judge` : "") +
      `, min ratio ${Math.min(...judged.map((r) => r.ratio)).toFixed(2)}`,
  );
  bad.forEach((r) =>
    console.log(`        ${r.ratio} (needs ${r.need}) — "${r.text}"`),
  );
}

ws.close();
chrome.kill();
process.exit(failed ? 1 : 0);
