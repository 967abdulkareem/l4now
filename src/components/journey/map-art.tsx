import {
  ARTERIALS,
  BRIDGE,
  BUILDINGS,
  JUNCTIONS,
  LAKE_D,
  MAP_VIEWBOX,
  PARKS,
  RIVER_D,
  ROUTE_D,
  STREETS,
  TREES,
} from "@/lib/map-data";

const GROUND = "#f4f4f4";
const BLOCK = "#e2e2e2";
const BLOCK_WARM = "#f0d4d4";
const STREET = "#ffffff";
const PARK = "#dfe6da";
const WATER = "#d8e3ea";

/**
 * The town behind the hero: pure SVG, no images, no map service.
 *
 * Nothing here is a real place. The primary road follows the same line as the
 * GPS route, which is drawn separately in the route overlay so that it can
 * share one coordinate system with the rest of the page.
 */
export function MapArt({
  className,
  preserveAspectRatio = "xMidYMid slice",
  viewBox,
  route = true,
}: {
  className?: string;
  preserveAspectRatio?: string;
  /** Crop window, for the narrow portrait framing. Defaults to the whole map. */
  viewBox?: string;
  /**
   * Draw the wide primary road the GPS route follows. Off for the phone crop,
   * where the route is not rendered and the road would read as a stray band.
   */
  route?: boolean;
}) {
  return (
    <svg
      data-map-svg
      viewBox={viewBox ?? `0 0 ${MAP_VIEWBOX.w} ${MAP_VIEWBOX.h}`}
      preserveAspectRatio={preserveAspectRatio}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="-200" y="-200" width="1600" height="1500" fill={GROUND} />

      {/* ---- parks and water sit under the street network ---- */}
      <g data-map-layer="land">
        {PARKS.map((d, i) => (
          <path key={i} d={d} fill={PARK} opacity="0.85" />
        ))}
        <path d={LAKE_D} fill={WATER} />
        <path
          d={RIVER_D}
          fill="none"
          stroke={WATER}
          strokeWidth="26"
          strokeLinecap="round"
        />
      </g>

      {/* ---- blocks ---- */}
      <g data-map-layer="blocks">
        {BUILDINGS.map(([cx, cy, w, h, a, tone], i) => (
          <rect
            key={i}
            x={-w / 2}
            y={-h / 2}
            width={w}
            height={h}
            rx="1.6"
            fill={tone === 1 ? BLOCK_WARM : BLOCK}
            transform={`translate(${cx} ${cy}) rotate(${a})`}
          />
        ))}
      </g>

      {/* ---- streets, then arterials, then the primary road ---- */}
      <g data-map-layer="streets">
        <g stroke={STREET} strokeWidth="7" strokeLinecap="round" fill="none">
          {STREETS.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </g>
        <g
          stroke={STREET}
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          {ARTERIALS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* The primary road the route runs along. Omitted on the phone crop,
            where no route is drawn and it would read as a stray band. */}
        {route && (
          <>
            <path
              d={ROUTE_D}
              fill="none"
              stroke="#ededed"
              strokeWidth="26"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={ROUTE_D}
              fill="none"
              stroke={STREET}
              strokeWidth="21"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {/* Where the primary road crosses the river. */}
        {route && BRIDGE && (
          <g transform={`translate(${BRIDGE[0]} ${BRIDGE[1]}) rotate(${BRIDGE[2]})`}>
            <rect x="-22" y="-15" width="44" height="30" rx="3" fill={STREET} />
            <rect x="-22" y="-15" width="44" height="2" fill="#e3e3e3" />
            <rect x="-22" y="13" width="44" height="2" fill="#e3e3e3" />
          </g>
        )}

        {/* Junctions where the route meets an arterial. */}
        {route &&
          JUNCTIONS.map(([x, y, r], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill="none" stroke={STREET} strokeWidth="12" />
            <circle cx={x} cy={y} r={r - 6} fill={PARK} opacity="0.7" />
          </g>
        ))}
      </g>

      {/* ---- trees ---- */}
      <g data-map-layer="trees">
        {TREES.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#c9d4c2" opacity="0.8" />
        ))}
      </g>
    </svg>
  );
}
