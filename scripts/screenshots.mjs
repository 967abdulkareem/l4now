/**
 * Saves reference screenshots of the running site to docs/screenshots.
 *
 *   npm run dev              # in one terminal
 *   node scripts/screenshots.mjs
 *
 * Drives a local headless Chrome over the DevTools protocol — no extra
 * dependencies, and Node's built-in WebSocket does the talking.
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

// `nolenis` turns off smooth scrolling so plain scrollTo lands exactly.
const BASE = process.env.BASE_URL ?? "http://localhost:3000/?nolenis=1";
const OUT = "docs/screenshots";
const PORT = 9333;

const CHROME =
  process.env.CHROME_PATH ??
  "C:/Program Files/Google/Chrome/Application/chrome.exe";

/** [name, width, height, how to position the page before capturing] */
const SHOTS = [
  ["hero-desktop", 1440, 900, () => 0],
  ["pricing-desktop", 1440, 900, "[data-course-grid]", -150],
  ["booking-desktop", 1440, 980, "#book", -60],
  ["hero-mobile", 390, 844, () => 0],
  ["pricing-mobile", 390, 844, "[data-course-grid]", -80],
  ["booking-mobile", 390, 844, "#book", -40],
  ["reviews-desktop", 1440, 900, "#reviews", -90],
  ["reviews-mobile", 390, 844, "#reviews", -70],
];

mkdirSync(OUT, { recursive: true });

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--hide-scrollbars",
    "--force-device-scale-factor=2",
    "--no-first-run",
    "--no-default-browser-check",
    "--user-data-dir=" + process.env.TEMP + "/l4now-shots",
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
  return r.result?.value;
};

async function connect() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, {
        method: "PUT",
      });
      const tab = await res.json();
      return tab.webSocketDebuggerUrl;
    } catch {
      await sleep(500);
    }
  }
  throw new Error("Could not reach headless Chrome");
}

const url = await connect();
ws = new WebSocket(url);
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

await send("Page.enable");
await send("Runtime.enable");

for (const [name, width, height, target, offset = 0] of SHOTS) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: width < 768,
  });

  await send("Page.navigate", { url: BASE });
  await sleep(2500);
  // Webfonts change every measurement the route depends on.
  await evaluate("document.fonts.ready.then(()=>1)");
  await sleep(600);

  if (typeof target === "string") {
    // The route rebuilds as fonts and layout settle, so scroll, let it
    // settle, and scroll again until the target actually lands.
    let landed = 0;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      landed = await evaluate(
        `(() => { const el = document.querySelector(${JSON.stringify(target)});
          if (!el) return -1;
          window.scrollTo(0, el.getBoundingClientRect().top + scrollY + ${offset});
          return Math.round(el.getBoundingClientRect().top); })()`,
      );
      await sleep(500);
      if (Math.abs(landed + offset) < 4) break;
    }
    console.log(`  ${name}: target at ${landed}px (want ${-offset})`);
    // Let the scrubbed timeline catch up.
    await sleep(1500);
  }

  const shot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(shot.data, "base64"));
  console.log("saved", `${OUT}/${name}.png`);
}

ws.close();
chrome.kill();
