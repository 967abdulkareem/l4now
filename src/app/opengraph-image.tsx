import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

// Required by `output: "export"` — the card is rendered once at build time.
export const dynamic = "force-static";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — ${site.tagline}`;

/** Generated at build time, so there is no binary asset to keep in sync. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "72px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <svg
          width="1200"
          height="630"
          viewBox="0 0 1200 630"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <path
            d="M760 -40C860 120 700 210 820 320C930 420 1120 380 1180 520"
            fill="none"
            stroke="#ffffff"
            strokeWidth="34"
            strokeLinecap="round"
          />
          <path
            d="M760 -40C860 120 700 210 820 320C930 420 1120 380 1180 520"
            fill="none"
            stroke="#e52222"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <circle cx="1180" cy="520" r="18" fill="#e52222" />
          <circle cx="1180" cy="520" r="7" fill="#ffffff" />
          <rect x="600" y="470" width="120" height="90" rx="10" fill="#ededed" />
          <rect x="520" y="120" width="90" height="70" rx="10" fill="#ededed" />
        </svg>

        <p
          style={{
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#111111",
            margin: 0,
          }}
        >
          {site.name}
        </p>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <p
            style={{
              fontSize: 92,
              fontWeight: 700,
              letterSpacing: "-0.035em",
              lineHeight: 1,
              color: "#111111",
              margin: 0,
              maxWidth: 720,
            }}
          >
            Learn to drive.
            <br />
            Feel in control.
          </p>
          <p
            style={{
              fontSize: 32,
              color: "#5f5f5f",
              margin: "28px 0 0",
              maxWidth: 640,
            }}
          >
            {site.tagline}
          </p>
        </div>
      </div>
    ),
    size,
  );
}
