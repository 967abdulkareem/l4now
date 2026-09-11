import { site } from "@/lib/site";

/**
 * The L_4NOW mark: broken arc over a vanishing road, a car beneath it, and the
 * two-tone wordmark.
 *
 * Inline SVG so it stays crisp, needs no network request and carries no white
 * background. `scripts/process-logo.mjs` exports the same artwork — or the
 * supplied JPEG, once it is dropped in — to the PNG sizes in
 * /public/assets/logo/ used for favicons and social cards.
 */
export function BrandLogo({
  className = "",
  width = 190,
}: {
  className?: string;
  width?: number;
}) {
  return (
    <svg
      viewBox="0 0 442 100"
      width={width}
      height={(width / 442) * 100}
      className={className}
      role="img"
      aria-label={`${site.name} — ${site.tagline}`}
    >
      <BrandMark />

      <text
        x="160"
        y="60"
        fontFamily="var(--font-jakarta), system-ui, sans-serif"
        fontSize="44"
        fontWeight="800"
        letterSpacing="-1"
      >
        <tspan fill="#e52222">L_4</tspan>
        <tspan fill="#111111">NOW</tspan>
      </text>
      <text
        x="162"
        y="82"
        fontFamily="var(--font-jakarta), system-ui, sans-serif"
        fontSize="13.5"
        fontWeight="700"
        letterSpacing="3.6"
        fill="#111111"
      >
        DRIVING SCHOOL
      </text>
    </svg>
  );
}

/** The icon on its own — arc, road, car. Drawn in a 132 x 100 box. */
function BrandMark() {
  return (
    <g>
      {/* Broken arc across the top: black rising left, red falling right. */}
      <path
        d="M10 56A56 56 0 0 1 64 6"
        fill="none"
        stroke="#111111"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M122 56A56 56 0 0 0 68 6"
        fill="none"
        stroke="#e52222"
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Road, narrowing to the horizon. */}
      <path d="M46 58 60 16h12l14 42Z" fill="#2f2f2f" />
      <path
        d="M66 22v6M66.4 34v7M67 47v7"
        stroke="#ffffff"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* Car, sitting clear of the road above it. */}
      <path
        d="M26 86c0-8 4-12 11-14l8-9c3-3 6-5 10-5h16c4 0 8 2 11 5l8 9c7 2 11 6 11 14Z"
        fill="#111111"
      />
      <path d="M51 62h11v9H43Zm15 0h5l8 9H66Z" fill="#ffffff" opacity="0.92" />
      <circle cx="44" cy="86" r="8.5" fill="#111111" />
      <circle cx="44" cy="86" r="3.4" fill="#ffffff" />
      <circle cx="90" cy="86" r="8.5" fill="#111111" />
      <circle cx="90" cy="86" r="3.4" fill="#ffffff" />
    </g>
  );
}
