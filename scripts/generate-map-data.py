# Generates src/lib/map-data.ts — the fictional town behind the hero.
#
# Method, in the order it runs:
#   1. The route is drawn first, as a rounded polyline of 90-degree turns.
#   2. The primary road follows that same line, plus a handful of arterials.
#   3. The canvas is divided into districts, each with its OWN street angle
#      and spacing, so no two neighbourhoods read the same.
#   4. Local streets are clipped to their district polygon.
#   5. Buildings fill the blocks, rotated to their district, and are rejected
#      where they would sit on the route, a road, water or a park.
#
# Run:  python scripts/generate-map-data.py
import io
import math
import os
import random

random.seed(4711)

W, H = 1100.0, 1000.0
PAD = 90.0  # generate this far outside the canvas so slicing never shows an edge

# ---------------------------------------------------------------- the route --
# Unequal runs, turns in both directions, entering top-right and leaving
# bottom-left. These are also the centre line of the primary road.
ROUTE_PTS = [
    (952, -120),
    (952, 300),
    (742, 300),
    (742, 520),
    (884, 520),
    (884, 700),
    (676, 700),
    (676, 880),
    (880, 880),
    (880, 1160),
]
CORNER_R = 26.0

# Where the three hero waypoints sit, as an index into ROUTE_PTS plus a
# fraction along the following run.
HERO_PINS = [
    {"id": "first-turn", "label": "Your first turn", "seg": 1, "f": 0.62},
    {"id": "confidence", "label": "Build confidence", "seg": 3, "f": 0.55},
    {"id": "next-lesson", "label": "Your next lesson", "seg": 7, "f": 0.55},
]


def rounded_path(pts, r):
    """Axis-aligned polyline -> path string with small radii on each corner."""
    d = [f"M {pts[0][0]} {pts[0][1]}"]
    for i in range(1, len(pts) - 1):
        p0, p1, p2 = pts[i - 1], pts[i], pts[i + 1]
        v0 = (p1[0] - p0[0], p1[1] - p0[1])
        v1 = (p2[0] - p1[0], p2[1] - p1[1])
        l0 = math.hypot(*v0) or 1
        l1 = math.hypot(*v1) or 1
        rr = min(r, l0 / 2, l1 / 2)
        a = (p1[0] - v0[0] / l0 * rr, p1[1] - v0[1] / l0 * rr)
        b = (p1[0] + v1[0] / l1 * rr, p1[1] + v1[1] / l1 * rr)
        d.append(f"L {round(a[0], 1)} {round(a[1], 1)}")
        d.append(f"Q {p1[0]} {p1[1]} {round(b[0], 1)} {round(b[1], 1)}")
    d.append(f"L {pts[-1][0]} {pts[-1][1]}")
    return " ".join(d)


ROUTE_D = rounded_path(ROUTE_PTS, CORNER_R)


def point_on_route(seg, f):
    a, b = ROUTE_PTS[seg], ROUTE_PTS[seg + 1]
    return (a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f)


def seg_distance(px, py, ax, ay, bx, by):
    vx, vy = bx - ax, by - ay
    wx, wy = px - ax, py - ay
    L = vx * vx + vy * vy
    t = 0.0 if L == 0 else max(0.0, min(1.0, (wx * vx + wy * vy) / L))
    return math.hypot(px - (ax + vx * t), py - (ay + vy * t))


ROUTE_SEGS = list(zip(ROUTE_PTS, ROUTE_PTS[1:]))


def dist_to_route(x, y):
    return min(seg_distance(x, y, a[0], a[1], b[0], b[1]) for a, b in ROUTE_SEGS)


# ------------------------------------------------------------------ water ----
# One river, crossing the route exactly once so it can carry a bridge.
RIVER_PTS = [
    (-90, 470),
    (60, 452),
    (170, 500),
    (250, 596),
    (330, 640),
    (452, 636),
    (560, 676),
    (640, 760),
    (742, 830),
    (860, 856),
    (1000, 920),
    (1190, 1010),
]
LAKE = [
    (930, 236),
    (1010, 214),
    (1090, 236),
    (1130, 292),
    (1108, 352),
    (1030, 380),
    (952, 358),
    (918, 300),
]


def catmull(pts):
    """Smooth a polyline into a cubic path (Catmull-Rom -> Bezier)."""
    p = [pts[0]] + list(pts) + [pts[-1]]
    d = [f"M {round(pts[0][0], 1)} {round(pts[0][1], 1)}"]
    for i in range(1, len(p) - 2):
        p0, p1, p2, p3 = p[i - 1], p[i], p[i + 1], p[i + 2]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d.append(
            "C %.1f %.1f %.1f %.1f %.1f %.1f"
            % (c1[0], c1[1], c2[0], c2[1], p2[0], p2[1])
        )
    return " ".join(d)


RIVER_D = catmull(RIVER_PTS)
RIVER_SEGS = list(zip(RIVER_PTS, RIVER_PTS[1:]))


def dist_to_river(x, y):
    return min(seg_distance(x, y, a[0], a[1], b[0], b[1]) for a, b in RIVER_SEGS)


def poly_path(pts):
    return catmull(list(pts) + [pts[0], pts[1]]) + " Z"


LAKE_D = poly_path(LAKE)


def in_poly(x, y, poly):
    inside = False
    n = len(poly)
    for i in range(n):
        x1, y1 = poly[i]
        x2, y2 = poly[(i + 1) % n]
        if (y1 > y) != (y2 > y):
            xi = x1 + (y - y1) / (y2 - y1) * (x2 - x1)
            if x < xi:
                inside = not inside
    return inside


# ------------------------------------------------------------------ parks ----
PARKS = [
    [(150, 150), (280, 128), (352, 190), (330, 292), (214, 320), (128, 254)],
    [(430, 214), (532, 196), (588, 250), (556, 322), (452, 336), (408, 280)],
    [(232, 700), (344, 686), (404, 742), (372, 836), (256, 852), (200, 780)],
    [(792, 160), (868, 148), (900, 196), (874, 246), (800, 254), (770, 206)],
    [(830, 660), (944, 646), (996, 706), (960, 786), (860, 796), (812, 730)],
    [(60, 830), (152, 818), (196, 872), (166, 944), (74, 954), (32, 892)],
]
PARK_PATHS = [poly_path(p) for p in PARKS]

# -------------------------------------------------------------- arterials ----
# Long roads that give the network a spine beyond the route itself.
ARTERIALS = [
    [(-90, 300), (180, 296), (420, 316), (620, 292), (860, 300), (1190, 288)],
    [(-90, 700), (140, 690), (360, 706), (600, 690), (840, 700), (1190, 686)],
    [(300, -90), (306, 200), (288, 420), (300, 640), (292, 880), (300, 1090)],
    [(1052, -90), (1046, 240), (1064, 470), (1046, 700), (1058, 1090)],
    [(-90, 60), (200, 74), (470, 52), (700, 70), (952, 60)],
    [(120, 1090), (168, 900), (240, 760), (330, 640), (390, 470), (368, 300)],
    [(742, 402), (830, 330), (930, 300), (1052, 292)],
    [(536, 806), (440, 880), (380, 980), (360, 1090)],
    [(884, 604), (980, 560), (1052, 470)],
]
ARTERIAL_PATHS = [catmull(a) for a in ARTERIALS]
ARTERIAL_SEGS = [s for a in ARTERIALS for s in zip(a, a[1:])]


def dist_to_arterial(x, y):
    return min(
        seg_distance(x, y, a[0], a[1], b[0], b[1]) for a, b in ARTERIAL_SEGS
    )


# ------------------------------------------------------------- districts -----
# Convex polygons, each with its own street angle and spacing. Neighbouring
# districts deliberately disagree, which is what stops the town looking like
# graph paper.
DISTRICTS = [
    {"poly": [(-90, -90), (300, -90), (300, 300), (-90, 300)], "a": 8, "s": 46, "c": 62},
    {"poly": [(300, -90), (742, -90), (742, 300), (300, 300)], "a": -14, "s": 40, "c": 54},
    {"poly": [(742, -90), (1190, -90), (1190, 300), (742, 300)], "a": 3, "s": 44, "c": 58},
    {"poly": [(-90, 300), (300, 300), (300, 700), (-90, 700)], "a": 26, "s": 42, "c": 56},
    {"poly": [(300, 300), (742, 300), (742, 700), (300, 700)], "a": -6, "s": 38, "c": 50},
    {"poly": [(742, 300), (1190, 300), (1190, 700), (742, 700)], "a": 17, "s": 46, "c": 60},
    {"poly": [(-90, 700), (300, 700), (300, 1090), (-90, 1090)], "a": -22, "s": 44, "c": 58},
    {"poly": [(300, 700), (742, 700), (742, 1090), (300, 1090)], "a": 11, "s": 40, "c": 54},
    {"poly": [(742, 700), (1190, 700), (1190, 1090), (742, 1090)], "a": -3, "s": 46, "c": 62},
]


def edge_normals(poly):
    """Outward normal per edge, oriented away from the centroid."""
    cx = sum(p[0] for p in poly) / len(poly)
    cy = sum(p[1] for p in poly) / len(poly)
    out = []
    for i in range(len(poly)):
        a = poly[i]
        b = poly[(i + 1) % len(poly)]
        nx, ny = b[1] - a[1], -(b[0] - a[0])
        if nx * (cx - a[0]) + ny * (cy - a[1]) > 0:
            nx, ny = -nx, -ny
        out.append((a, nx, ny))
    return out


def clip_segment(p, q, normals):
    """Cyrus-Beck clip of segment p->q against a convex polygon."""
    t0, t1 = 0.0, 1.0
    dx, dy = q[0] - p[0], q[1] - p[1]
    for a, nx, ny in normals:
        denom = nx * dx + ny * dy
        num = nx * (p[0] - a[0]) + ny * (p[1] - a[1])
        if abs(denom) < 1e-9:
            if num > 0:
                return None
            continue
        t = -num / denom
        if denom > 0:
            t1 = min(t1, t)
        else:
            t0 = max(t0, t)
        if t0 > t1:
            return None
    return (
        (p[0] + dx * t0, p[1] + dy * t0),
        (p[0] + dx * t1, p[1] + dy * t1),
    )


streets = []
buildings = []
DIAG = math.hypot(W + 2 * PAD, H + 2 * PAD)

for d in DISTRICTS:
    poly = d["poly"]
    normals = edge_normals(poly)
    ang = math.radians(d["a"])
    ca, sa = math.cos(ang), math.sin(ang)
    cx = sum(p[0] for p in poly) / len(poly)
    cy = sum(p[1] for p in poly) / len(poly)

    def to_world(u, v):
        return (cx + u * ca - v * sa, cy + u * sa + v * ca)

    # Streets along the district's own two axes, at its own spacing.
    for axis, step in ((0, d["s"]), (1, d["c"])):
        k = -DIAG / 2
        while k < DIAG / 2:
            jitter = random.uniform(-4, 4)
            if axis == 0:
                p = to_world(-DIAG / 2, k + jitter)
                q = to_world(DIAG / 2, k + jitter)
            else:
                p = to_world(k + jitter, -DIAG / 2)
                q = to_world(k + jitter, DIAG / 2)
            clipped = clip_segment(p, q, normals)
            k += step * random.uniform(0.86, 1.3)
            if not clipped:
                continue
            (ax, ay), (bx, by) = clipped
            if math.hypot(bx - ax, by - ay) < 34:
                continue
            # Occasional dead ends and breaks, so it is not all through-roads.
            if random.random() < 0.22:
                t = random.uniform(0.25, 0.75)
                bx, by = ax + (bx - ax) * t, ay + (by - ay) * t
                if math.hypot(bx - ax, by - ay) < 30:
                    continue
            streets.append(
                (round(ax, 1), round(ay, 1), round(bx, 1), round(by, 1))
            )

    # Buildings on the same axes, so they line up with their own streets.
    su, sv = d["s"] * 0.5, d["c"] * 0.44
    u = -DIAG / 2
    while u < DIAG / 2:
        v = -DIAG / 2
        while v < DIAG / 2:
            bw = su * random.uniform(0.44, 0.78)
            bh = sv * random.uniform(0.4, 0.74)
            if random.random() < 0.12:  # occasional larger civic block
                bw *= random.uniform(1.5, 2.4)
                bh *= random.uniform(1.3, 2.0)
            px, py = to_world(
                u + random.uniform(2, su - 2), v + random.uniform(2, sv - 2)
            )
            v += sv * random.uniform(0.92, 1.12)
            if random.random() < 0.14:
                continue
            if not in_poly(px, py, poly):
                continue
            if px < -PAD or px > W + PAD or py < -PAD or py > H + PAD:
                continue
            reach = max(bw, bh) / 2
            if dist_to_route(px, py) < 26 + reach:
                continue
            if dist_to_arterial(px, py) < 18 + reach:
                continue
            if dist_to_river(px, py) < 30 + reach:
                continue
            if any(in_poly(px, py, p) for p in PARKS):
                continue
            if in_poly(px, py, LAKE):
                continue
            tone = 1 if random.random() < 0.07 else 0
            buildings.append(
                (
                    round(px, 1),
                    round(py, 1),
                    round(bw, 1),
                    round(bh, 1),
                    round(d["a"] + random.uniform(-2, 2), 1),
                    tone,
                )
            )
        u += su * random.uniform(0.92, 1.12)

# Streets are trimmed where they would run over water or a park.
streets = [
    s
    for s in streets
    if not (
        dist_to_river((s[0] + s[2]) / 2, (s[1] + s[3]) / 2) < 20
        or any(in_poly((s[0] + s[2]) / 2, (s[1] + s[3]) / 2, p) for p in PARKS)
        or in_poly((s[0] + s[2]) / 2, (s[1] + s[3]) / 2, LAKE)
    )
]

# ------------------------------------------------------------------ trees ----
trees = []
for p in PARKS:
    xs = [q[0] for q in p]
    ys = [q[1] for q in p]
    for _ in range(240):
        if len(trees) > 900:
            break
        x = random.uniform(min(xs), max(xs))
        y = random.uniform(min(ys), max(ys))
        if not in_poly(x, y, p):
            continue
        if any(math.hypot(x - tx, y - ty) < 17 for tx, ty, _ in trees):
            continue
        trees.append((round(x, 1), round(y, 1), round(random.uniform(4.5, 7.5), 1)))

# A thinner scatter of street trees along the route and arterials.
for _ in range(2600):
    if len(trees) > 620:
        break
    x = random.uniform(-PAD, W + PAD)
    y = random.uniform(-PAD, H + PAD)
    dr = dist_to_route(x, y)
    da = dist_to_arterial(x, y)
    if not (16 < dr < 24 or 13 < da < 20):
        continue
    if dist_to_river(x, y) < 24 or in_poly(x, y, LAKE):
        continue
    if any(math.hypot(x - tx, y - ty) < 22 for tx, ty, _ in trees):
        continue
    trees.append((round(x, 1), round(y, 1), round(random.uniform(3.8, 5.6), 1)))

# ----------------------------------------------------------------- bridge ----
# Where the route meets the river, so the road plainly crosses it.
bridge = None
for a, b in ROUTE_SEGS:
    for i in range(41):
        t = i / 40
        x = a[0] + (b[0] - a[0]) * t
        y = a[1] + (b[1] - a[1]) * t
        if dist_to_river(x, y) < 6:
            ang = math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))
            bridge = (round(x, 1), round(y, 1), round(ang, 1))
            break
    if bridge:
        break

# ---------------------------------------------------------------- junctions --
# Small roundabouts where the route meets an arterial.
junctions = []
for a, b in ROUTE_SEGS:
    for i in range(1, 40):
        t = i / 40
        x = a[0] + (b[0] - a[0]) * t
        y = a[1] + (b[1] - a[1]) * t
        if dist_to_arterial(x, y) < 3 and all(
            math.hypot(x - jx, y - jy) > 120 for jx, jy, _ in junctions
        ):
            junctions.append((round(x, 1), round(y, 1), 15))
junctions = junctions[:3]

# ------------------------------------------------------------------- emit ----
out = io.StringIO()
w = out.write
w(
    '''// AUTO-GENERATED. Run `python scripts/generate-map-data.py` to rebuild.
//
// An invented town. No real place, road or geography is represented here:
// the districts, streets, river and parks are all generated geometry.

export const MAP_VIEWBOX = { w: %d, h: %d } as const;

/**
 * The primary road, and the line the GPS dot follows through the hero.
 * Axis-aligned turns in both directions, softened with small radii.
 */
export const ROUTE_PTS: readonly (readonly [number, number])[] = [
'''
    % (int(W), int(H))
)
for p in ROUTE_PTS:
    w("  [%s, %s],\n" % p)
w("];\n\n")
w('export const ROUTE_D =\n  "%s";\n\n' % ROUTE_D)
w("export const ROUTE_CORNER_RADIUS = %s;\n\n" % CORNER_R)

w(
    """/** Labelled stops shown along the hero stretch of the route. */
export const HERO_PINS: readonly {
  id: string;
  label: string;
  x: number;
  y: number;
}[] = [
"""
)
for pin in HERO_PINS:
    x, y = point_on_route(pin["seg"], pin["f"])
    w(
        '  { id: "%s", label: "%s", x: %.1f, y: %.1f },\n'
        % (pin["id"], pin["label"], x, y)
    )
w("];\n\n")

w("export const ARTERIALS: readonly string[] = [\n")
for a in ARTERIAL_PATHS:
    w('  "%s",\n' % a)
w("];\n\n")

w("/** [x1, y1, x2, y2] */\nexport const STREETS: readonly (readonly [number, number, number, number])[] = [\n")
line = "  "
for s in streets:
    chunk = "[%s,%s,%s,%s]," % s
    if len(line) + len(chunk) > 94:
        w(line + "\n")
        line = "  "
    line += chunk
w(line + "\n];\n\n")

w(
    "/** [cx, cy, w, h, angle, tone] — tone 1 is the warm brick accent. */\nexport const BUILDINGS: readonly (readonly [number, number, number, number, number, number])[] = [\n"
)
line = "  "
for b in buildings:
    chunk = "[%s,%s,%s,%s,%s,%s]," % b
    if len(line) + len(chunk) > 94:
        w(line + "\n")
        line = "  "
    line += chunk
w(line + "\n];\n\n")

w("/** [x, y, r] */\nexport const TREES: readonly (readonly [number, number, number])[] = [\n")
line = "  "
for t in trees:
    chunk = "[%s,%s,%s]," % t
    if len(line) + len(chunk) > 94:
        w(line + "\n")
        line = "  "
    line += chunk
w(line + "\n];\n\n")

w('export const RIVER_D =\n  "%s";\n\n' % RIVER_D)
w('export const LAKE_D =\n  "%s";\n\n' % LAKE_D)

w("export const PARKS: readonly string[] = [\n")
for p in PARK_PATHS:
    w('  "%s",\n' % p)
w("];\n\n")

if bridge:
    w(
        "/** [x, y, angle] — where the route crosses the river. */\nexport const BRIDGE = [%s, %s, %s] as const;\n\n"
        % bridge
    )
else:
    w("export const BRIDGE = null;\n\n")

w("/** [x, y, r] */\nexport const JUNCTIONS: readonly (readonly [number, number, number])[] = [\n")
for j in junctions:
    w("  [%s, %s, %s],\n" % j)
w("];\n")

dest = os.path.join(os.path.dirname(__file__), "..", "src", "lib", "map-data.ts")
io.open(dest, "w", encoding="utf-8").write(out.getvalue())
print(
    "streets", len(streets),
    "buildings", len(buildings),
    "trees", len(trees),
    "bridge", bridge,
    "junctions", junctions,
    "bytes", len(out.getvalue()),
)
