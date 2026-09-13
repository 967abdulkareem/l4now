/**
 * Two whole-page checks the other audits do not cover:
 *   1. the largest run of empty vertical space (brief allows ~160px at 1440),
 *   2. the phone hero carries map artwork only — no route, pins or labels.
 *
 *   npm run dev  (in another terminal)
 *   node scripts/audit-gaps.mjs
 *
 * Reduced motion is emulated so the page is measured in its final state; a
 * full-page capture otherwise sees every below-fold reveal mid-flight.
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/?nolenis=1";
const PORT = 9337;
const CHROME =
  process.env.CHROME_PATH ??
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const WIDTHS = [390, 1440];
const LIMIT = 160;

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--hide-scrollbars",
    "--no-first-run",
    "--user-data-dir=" + process.env.TEMP + "/l4now-gaps",
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
const js = async (expression) =>
  (
    await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    })
  ).result?.value;

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
await send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-reduced-motion", value: "reduce" }],
});

/* Page-space occupancy: every visible element that carries ink marks the rows
   it covers. Whatever is left is genuinely empty. */
const GAPS = `(() => {
  const doc = document.documentElement;
  const H = doc.scrollHeight;
  const rows = new Uint8Array(H);
  const paint = (top, bottom) => {
    for (let y = Math.max(0, Math.floor(top)); y < Math.min(H, Math.ceil(bottom)); y++) rows[y] = 1;
  };
  const inked = (el) => {
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none" || Number(s.opacity) < 0.05) return false;
    if (el.matches("img, svg, input, textarea, select, hr, video")) return true;
    if (s.backgroundImage !== "none") return true;
    if (!/rgba\\(0, 0, 0, 0\\)|transparent/.test(s.backgroundColor)) return true;
    if (parseFloat(s.borderTopWidth) + parseFloat(s.borderBottomWidth) > 0) return true;
    return [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  };
  for (const el of document.body.querySelectorAll("*")) {
    // Decoration does not fill space: the route SVG and the hero map span the
    // page, and counting them would hide every real gap behind them.
    if (el.closest("[data-route-svg], [aria-hidden='true']")) continue;
    if (!inked(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.height < 1 || r.width < 1) continue;
    if (r.height > innerHeight * 1.5) continue;
    paint(r.top + scrollY, r.bottom + scrollY);
  }
  let worst = 0;
  let at = 0;
  let run = 0;
  for (let y = 0; y < H; y++) {
    if (rows[y]) { run = 0; continue; }
    run += 1;
    if (run > worst) { worst = run; at = y - run; }
  }
  const near = [...document.querySelectorAll("section, h1, h2, h3, footer")].map((e) => {
    const r = e.getBoundingClientRect();
    return { tag: e.tagName, id: e.id || "", top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY),
      text: e.textContent.trim().slice(0, 24) };
  }).filter((b) => Math.abs(b.bottom - at) < 60 || Math.abs(b.top - (at + worst)) < 60);
  return { height: H, worst, at, near };
})()`;

const PHONE_HERO = `(() => {
  const hero = document.querySelector("#hero, header + section, main section");
  const art = document.querySelector("[data-route-anchor='map']");
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
  };
  const inHero = (sel) => [...hero.querySelectorAll(sel)].filter(vis).length;
  return {
    route: inHero("[data-route], [data-map-route]"),
    pins: inHero("[data-pin], [data-map-pin]"),
    labels: inHero("[data-pin-label], [data-map-label]"),
    hangingLine: !!document.querySelector('[data-route="base"], [data-route="done"]'),
    artHidden: art ? art.getAttribute("aria-hidden") : null,
    artEvents: art ? getComputedStyle(art).pointerEvents : null,
  };
})()`;

let failed = false;
for (const width of WIDTHS) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url: BASE });
  await sleep(2400);
  await js("document.fonts.ready.then(()=>1)");
  await sleep(700);

  const g = await js(GAPS);
  const ok = g.worst <= LIMIT;
  if (!ok) failed = true;
  console.log(
    `${String(width).padStart(5)}px  ${ok ? "PASS" : "FAIL"}  ` +
      `largest empty run ${g.worst}px at y=${g.at} (page ${g.height}px, limit ${LIMIT})`,
  );
  if (!ok) console.log("         between:", JSON.stringify(g.near));

  if (width < 768) {
    const h = await js(PHONE_HERO);
    const clean = h.route === 0 && h.pins === 0 && h.labels === 0 && h.hangingLine;
    if (!clean) failed = true;
    console.log(`         ${clean ? "PASS" : "FAIL"}  phone hero ${JSON.stringify(h)}`);
  }
}

ws.close();
chrome.kill();
process.exit(failed ? 1 : 0);
