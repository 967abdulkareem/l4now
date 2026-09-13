/**
 * Geometry + accessibility smoke test across widths.
 *   npm run dev  (in another terminal)
 *   node scripts/audit.mjs
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/?nolenis=1";
const PORT = 9334;
const CHROME =
  process.env.CHROME_PATH ??
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const WIDTHS = [360, 390, 768, 1024, 1280, 1440, 1728];

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--hide-scrollbars",
    "--no-first-run",
    "--user-data-dir=" + process.env.TEMP + "/l4now-audit",
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
const evaluate = async (expression) =>
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

const CHECK = `(() => {
  const w = document.querySelector("[data-journey]");
  const base = document.querySelector('[data-route="base"]');
  if (!w || !base || !base.getAttribute("d")) return { error: "no route" };
  const wr = w.getBoundingClientRect();
  const sel = "h1,h2,h3,p,li,a,button,input,select,textarea,label,dt,dd";
  // Inputs carry no text, so test them on their box alone — the route must
  // not cross a form field any more than it may cross a heading.
  const empties = new Set(["INPUT", "SELECT", "TEXTAREA", "BUTTON"]);
  const boxes = [...w.querySelectorAll(sel)]
    .filter(
      (e) =>
        !e.closest("[data-route-svg]") &&
        (e.textContent.trim() || empties.has(e.tagName)) &&
        e.getBoundingClientRect().width > 0,
    )
    .map((e) => {
      const r = e.getBoundingClientRect();
      return {
        e,
        l: r.left - wr.left,
        t: r.top - wr.top,
        r: r.right - wr.left,
        b: r.bottom - wr.top,
      };
    });
  const L = base.getTotalLength();
  const PAD = 10;
  const hits = new Set();
  for (let i = 0; i <= 1200; i += 1) {
    const p = base.getPointAtLength((L * i) / 1200);
    for (const b of boxes)
      if (p.x > b.l - PAD && p.x < b.r + PAD && p.y > b.t - PAD && p.y < b.b + PAD)
        hits.add(
          b.e.tagName +
            ":" +
            (b.e.textContent.trim().slice(0, 20) || b.e.name || b.e.type || "") +
            " @route(" + Math.round(p.x) + "," + Math.round(p.y) +
            ") box(" + Math.round(b.l) + "," + Math.round(b.t) + "-" +
            Math.round(b.r) + "," + Math.round(b.b) + ")",
        );
  }
  return {
    overflow: document.documentElement.scrollWidth - innerWidth,
    checked: boxes.length,
    collisions: [...hits],
    routeLen: Math.round(L),
  };
})()`;

let failed = false;
for (const width of WIDTHS) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });
  await send("Page.navigate", { url: BASE });
  await sleep(2200);
  await evaluate("document.fonts.ready.then(()=>1)");
  await sleep(800);
  const r = await evaluate(CHECK);
  const ok = r && !r.error && r.overflow <= 0 && r.collisions.length === 0;
  if (!ok) failed = true;
  console.log(
    `${String(width).padStart(5)}px  ${ok ? "PASS" : "FAIL"}  ` +
      `overflow=${r?.overflow} elements=${r?.checked} route=${r?.routeLen}px` +
      (r?.collisions?.length ? `
        collisions: ${r.collisions.join(" | ")}` : "") +
      (r?.error ? `  ${r.error}` : ""),
  );
}

ws.close();
chrome.kill();
process.exit(failed ? 1 : 0);
