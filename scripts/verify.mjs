/**
 * Behaviour verification: carousel, reduced motion, route scrub, anchors, FOUC.
 *   npm run dev  (in another terminal)
 *   node scripts/verify.mjs
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/";
const PORT = 9336;
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
    "--user-data-dir=" + process.env.TEMP + "/l4now-verify",
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
const js = async (expression) => {
  const r = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (r.exceptionDetails) {
    throw new Error(
      r.exceptionDetails.text +
        " " +
        (r.exceptionDetails.exception?.description ?? ""),
    );
  }
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

let failed = false;
const check = (name, ok, detail = "") => {
  if (!ok) failed = true;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  " + detail : ""}`);
};

const load = async (path = "", width = 1440) => {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });
  await send("Page.navigate", { url: BASE + path });
  await sleep(2400);
  await js("document.fonts.ready.then(()=>1)");
  await sleep(600);
};

const reduce = (on) =>
  send("Emulation.setEmulatedMedia", {
    features: [
      {
        name: "prefers-reduced-motion",
        value: on ? "reduce" : "no-preference",
      },
    ],
  });

const HELPERS = [
  'window.__c = () => document.querySelector("[aria-roledescription=\\"carousel\\"]");',
  'window.__live = () => __c().querySelector("[aria-live]").textContent.trim();',
  'window.__cardH = () => Math.round(__c().querySelector(".card-surface").getBoundingClientRect().height);',
  'window.__btn = (re) => [...__c().querySelectorAll("button")].find((b) => new RegExp(re).test(b.getAttribute("aria-label") || ""));',
  'window.__over = (type) => { const c = __c(); const outside = document.body; c.dispatchEvent(new MouseEvent(type, { bubbles: true, relatedTarget: outside })); };',
  'window.__focusEvt = (type, el) => el.dispatchEvent(new FocusEvent(type, { bubbles: true }));',
  'window.__show = (el) => { el.scrollIntoView({ block: "center" }); return new Promise((r) => setTimeout(r, 900)); };',
  "1",
].join("\n");

/* ------------------------------------------------ carousel, motion on --- */
console.log("\ncarousel (1440px, motion on)");
await reduce(false);
await load();
await js(HELPERS);
await js("__show(__c())");

const first = await js("__live()");
await sleep(8000);
const advanced = await js("__live()");
check("autoplay advances", first !== advanced, `${first} -> ${advanced}`);

const h1 = await js("__cardH()");

/* Real mouse move over the carousel — React derives onMouseEnter from
   delegated events, so a trusted pointer is the only honest test. */
const mouse = async (type, y) => {
  const at = await js(
    '(() => { const r = __c().getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)]; })()',
  );
  await send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: at[0],
    y: y ?? at[1],
    buttons: 0,
  });
};
await mouse("mouseMoved");
await sleep(300);
const held = await js("__live()");
await sleep(8000);
check("pauses on hover", held === (await js("__live()")), held);
await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 2, y: 2, buttons: 0 });

/* Everything below is deterministic only while the timer is stopped. */
await js('__btn("slideshow").click()');
await sleep(400);
const pausedLabel = await js('__btn("slideshow").getAttribute("aria-label")');
check("pause button toggles", /Play review/.test(pausedLabel), pausedLabel);
const atPause = await js("__live()");
await sleep(8000);
check("paused stays put", atPause === (await js("__live()")), atPause);

await js('__btn("Next review").click()');
await sleep(800);
const afterNext = await js("__live()");
check("next button", afterNext !== atPause, afterNext);

await js('__btn("Previous review").click()');
await sleep(800);
check("prev button", (await js("__live()")) === atPause, await js("__live()"));

await js(
  '__c().focus(); __c().dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }))',
);
await sleep(800);
check("arrow-key nav", (await js("__live()")) !== atPause);
await js('__c().dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }))');
await sleep(800);

/* Resume, then hold it with keyboard focus. */
await js('__btn("slideshow").click()');
await sleep(400);
const focusHeld = await js('__focusEvt("focusin", __c().querySelector("button")); __live()');
await sleep(8000);
check("pauses on keyboard focus", focusHeld === (await js("__live()")), focusHeld);
await js('__focusEvt("focusout", __c().querySelector("button"))');

const beforeSwipe = await js("__live()");
await js(
  [
    "const c = __c();",
    "const mk = (x) => new Touch({ identifier: 1, target: c, clientX: x, clientY: 10 });",
    'const fire = (type, x) => c.dispatchEvent(new TouchEvent(type, { bubbles: true, touches: type === "touchend" ? [] : [mk(x)], changedTouches: [mk(x)] }));',
    'fire("touchstart", 300); fire("touchend", 150); 1',
  ].join("\n"),
);
await sleep(800);
check("swipe advances", beforeSwipe !== (await js("__live()")), beforeSwipe);

await js('__c().querySelectorAll("li button")[4].click()');
await sleep(800);
const dotLive = await js("__live()");
check("dots jump to slide", /Review 5 of/.test(dotLive), dotLive);

const heights = [];
for (let i = 0; i < 6; i += 1) {
  await js(`__c().querySelectorAll("li button")[${i}].click()`);
  await sleep(700);
  heights.push(await js("__cardH()"));
}
check("no height jump between slides", new Set(heights).size === 1, heights.join(","));
check("card height stable vs start", Math.abs(heights[0] - h1) < 2, `${heights[0]} vs ${h1}`);

/* -------------------------------------------------- reduced motion ------ */
console.log("\nreduced motion (1440px)");
await reduce(true);
await load();
await js(HELPERS);
const rm = await js(
  [
    "(() => {",
    '  const marked = [...document.querySelectorAll("[data-anim-item],[data-anim-line],[data-anim-heading],[data-hero-line],[data-hero-heading]")];',
    "  const faded = marked.filter((e) => Number(getComputedStyle(e).opacity) < 0.99).length;",
    '  const invisible = marked.filter((e) => getComputedStyle(e).visibility === "hidden").length;',
    "  return {",
    "    marked: marked.length, faded, invisible,",
    '    lenis: document.documentElement.classList.contains("lenis"),',
    "  };",
    "})()",
  ].join("\n"),
);
check(
  "nothing hidden",
  rm.marked > 0 && rm.faded === 0 && rm.invisible === 0,
  JSON.stringify(rm),
);
check("lenis off", rm.lenis === false);
await js("__show(__c())");
const rmFirst = await js("__live()");
await sleep(8000);
check("autoplay off", rmFirst === (await js("__live()")), rmFirst);

/* ---------------------------------------------------- route + scroll ---- */
console.log("\nroute scrub + layout stability (1440px)");
await reduce(false);
await load();
const scrub = await js(
  [
    "(async () => {",
    "  const wait = (ms) => new Promise((r) => setTimeout(r, ms || 280));",
    '  const done = document.querySelector("[data-route=\\"done\\"]");',
    "  const off = () => String(getComputedStyle(done).strokeDasharray);",
    "  const h0 = document.documentElement.scrollHeight;",
    "  const max = h0 - innerHeight;",
    "  const seen = [];",
    "  for (let i = 0; i <= 20; i++) { window.scrollTo(0, (max * i) / 20); await wait(i === 0 ? 900 : 0); seen.push(off()); }",
    "  const uniq = new Set(seen).size;",
    "  const hMid = document.documentElement.scrollHeight;",
    "  const back = [];",
    "  for (let i = 20; i >= 0; i--) { window.scrollTo(0, (max * i) / 20); await wait(i === 0 ? 900 : 0); back.push(off()); }",
    "  window.scrollTo(0, 0); await wait();",
    "  return { h0, hMid, hEnd: document.documentElement.scrollHeight,",
    "    drew: uniq, first: seen[0], last: seen[seen.length - 1],",
    "    reversed: back[0] !== back[back.length - 1],",
    "    endMatchesStart: back[back.length - 1] === seen[0], backLast: back[back.length - 1] };",
    "})()",
  ].join("\n"),
);
check(
  "page height stable through scroll",
  scrub.h0 === scrub.hMid && scrub.hMid === scrub.hEnd,
  JSON.stringify(scrub),
);
check("route draws on scroll", scrub.drew > 10, `${scrub.drew} distinct dash states`);
check("route reverses on scroll up", scrub.reversed && scrub.endMatchesStart);

/* ----------------------------------------------------------- anchors ---- */
console.log("\nanchor offsets (1440px)");
for (const id of ["how", "pricing", "instructor", "reviews", "faqs", "book"]) {
  const r = await js(
    [
      "(async () => {",
      `  const el = document.getElementById(${JSON.stringify(id)});`,
      "  if (!el) return null;",
      '  location.hash = "";',
      `  location.hash = ${JSON.stringify(id)};`,
      "  await new Promise((r) => setTimeout(r, 1000));",
      '  const head = document.querySelector("header").getBoundingClientRect().height;',
      "  return { top: Math.round(el.getBoundingClientRect().top), head: Math.round(head) };",
      "})()",
    ].join("\n"),
  );
  check(
    `#${id} lands below header`,
    !!r && r.top >= r.head,
    r ? `top=${r.top} header=${r.head}` : "missing",
  );
}

/* -------------------------------------------------------------- FOUC ---- */
console.log("\nFOUC (cache disabled, first paint)");
await send("Network.enable");
await send("Network.setCacheDisabled", { cacheDisabled: true });
await send("Page.navigate", { url: BASE });
await sleep(150);
const early = await js(
  [
    "(() => {",
    '  const h = document.querySelector("[data-hero-heading]");',
    "  if (!h) return { noHeading: true };",
    "  const s = getComputedStyle(h);",
    "  return { opacity: Number(s.opacity), visibility: s.visibility, text: h.textContent.trim().slice(0, 24) };",
    "})()",
  ].join("\n"),
);
check(
  "hero heading painted immediately",
  !!early && !early.noHeading && early.opacity > 0.99 && early.visibility !== "hidden",
  JSON.stringify(early),
);

ws.close();
chrome.kill();
console.log(failed ? "\nFAILURES\n" : "\nall checks passed\n");
process.exit(failed ? 1 : 0);
