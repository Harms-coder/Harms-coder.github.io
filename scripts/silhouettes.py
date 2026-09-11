"""
Generator til vægt-sammenligningens silhuetter (Oversigt → "Kg løftet"). Skriver
src/features/overview/comparisonSilhouettes.ts og en forhåndsvisning (silhouettes.html) ved siden af.

    python3 scripts/silhouettes.py

48x24 viewBox, y nedad, jorden ved y≈22. Alle udfyldte former samles i ÉN path med nonzero-fyldregel:
solide former tegnes med uret, huller (vinduer, hjulnav, pletter) mod uret. Tynde detaljer (haler,
snabler, striber) er stroke-paths. Ret i formerne her og kør scriptet igen — ret ikke i TS-filen.
"""
import json, pathlib

def _orient(pts, cw=True):
    area = 0
    for i in range(len(pts)):
        x1, y1 = pts[i]; x2, y2 = pts[(i + 1) % len(pts)]
        area += x1 * y2 - x2 * y1
    # SVG y går nedad: positivt "signed area" her = mod uret på skærmen
    is_cw = area > 0
    return pts if is_cw == cw else list(reversed(pts))

def poly(pts, hole=False):
    pts = _orient(pts, cw=not hole)
    return "M" + " L".join(f"{x:g},{y:g}" for x, y in pts) + " Z"

def rect(x, y, w, h, hole=False):
    return poly([(x, y), (x + w, y), (x + w, y + h), (x, y + h)], hole)

def rr(x, y, w, h, r, hole=False):
    r = min(r, w / 2, h / 2)
    s = 0 if hole else 1
    if hole:
        # mod uret: start øverst-venstre efter hjørnet, gå ned ad venstre side
        return (f"M{x:g},{y + r:g} V{y + h - r:g} A{r:g},{r:g} 0 0 0 {x + r:g},{y + h:g} "
                f"H{x + w - r:g} A{r:g},{r:g} 0 0 0 {x + w:g},{y + h - r:g} V{y + r:g} "
                f"A{r:g},{r:g} 0 0 0 {x + w - r:g},{y:g} H{x + r:g} A{r:g},{r:g} 0 0 0 {x:g},{y + r:g} Z")
    return (f"M{x + r:g},{y:g} H{x + w - r:g} A{r:g},{r:g} 0 0 {s} {x + w:g},{y + r:g} "
            f"V{y + h - r:g} A{r:g},{r:g} 0 0 {s} {x + w - r:g},{y + h:g} H{x + r:g} "
            f"A{r:g},{r:g} 0 0 {s} {x:g},{y + h - r:g} V{y + r:g} A{r:g},{r:g} 0 0 {s} {x + r:g},{y:g} Z")

def ell(cx, cy, rx, ry, hole=False):
    s = 0 if hole else 1
    return (f"M{cx - rx:g},{cy:g} A{rx:g},{ry:g} 0 1 {s} {cx + rx:g},{cy:g} "
            f"A{rx:g},{ry:g} 0 1 {s} {cx - rx:g},{cy:g} Z")

def circ(cx, cy, r, hole=False):
    return ell(cx, cy, r, r, hole)

def wheel(cx, cy, r=3.2, hub=1.3):
    return circ(cx, cy, r) + circ(cx, cy, hub, hole=True)

def legs(xs, y, w, h):
    return "".join(rect(x, y, w, h) for x in xs)

S = {}   # kind -> {"fill": path, "strokes": [(d, width)]}

def add(kind, *fills, strokes=()):
    S[kind] = {"fill": "".join(fills), "strokes": [list(s) for s in strokes]}

# --- mennesker og ting ---
add("person",
    circ(24, 4.6, 2.7), rr(20.6, 8, 6.8, 8.6, 2.2),
    rect(21, 16, 2.6, 7), rect(24.4, 16, 2.6, 7),
    rect(17.6, 8.6, 2.2, 7.4), rect(28.2, 8.6, 2.2, 7.4))

add("fridge",
    rr(16.5, 1, 15, 22, 1.4),
    rect(17.6, 8.6, 12.8, 0.7, hole=True),
    rect(28.4, 3.4, 0.9, 3.6, hole=True), rect(28.4, 11, 0.9, 7.2, hole=True))

add("piano",   # flygel set fra siden: åbent låg, tre ben, klaviatur til højre
    rr(5, 11, 38, 7.4, 1.4),
    poly([(6.5, 11), (31, 11), (11, 2.2)]),
    poly([(22, 11), (23.2, 11), (19.6, 5.8), (18.6, 6.4)]),   # lågstøtte
    rect(8, 18.2, 2.6, 5), rect(23, 18.2, 2.6, 5), rect(38, 18.2, 2.6, 5),
    rect(34, 13.2, 8.4, 1.2, hole=True))

# --- dyr ---
def bigcat(mane_r):
    return (ell(23, 13.2, 11, 5), circ(36.5, 9.2, mane_r),
            circ(34, 4.8, 1.4), circ(39, 4.8, 1.4),
            legs([14, 18.5, 26.5, 31], 15.5, 2.8, 7.2),
            circ(38.6, 9, 0.8, hole=True))
add("lion", *bigcat(5.2), strokes=[("M12.5,11 C8,9 6,13 7,17.5", 1.9)])
add("tiger", *bigcat(4.1), strokes=[("M12.5,11 C8,9 6,13 7,17.5", 1.9),
                                     ("M17,10 v5 M21,9.4 v6 M25,9.4 v6 M29,10 v5", 1.1)])

add("gorilla",
    poly([(8, 21.5), (9, 13), (14, 7.5), (22, 5), (30, 6), (34, 10), (35.5, 15), (33, 21.5)]),
    circ(33, 9.6, 4.8),
    poly([(9.5, 12), (15, 11), (14.5, 22), (8.5, 22)]),
    circ(11.4, 21.4, 2.6),
    rect(26.5, 15, 4.2, 8), rect(20, 16, 3.6, 7),
    circ(35.4, 8.6, 0.8, hole=True), circ(37.2, 10.4, 0.6, hole=True),
    strokes=[("M31,7 L36,7", 1.1)])

add("bear",
    ell(23, 13, 12.5, 5.6), ell(36.8, 10.4, 5.2, 3.4), circ(35, 7.2, 1.4),
    legs([13, 18, 26, 31.5], 15.5, 3.4, 7.2),
    circ(38.6, 9.8, 0.8, hole=True))

add("horse",
    ell(22, 12.5, 10.5, 4.6),
    poly([(29, 9.5), (33, 3.5), (37, 2.4), (39.5, 6.5), (36, 12), (31, 14)]),
    poly([(35, 3.4), (43.2, 5), (43.8, 7.6), (37.8, 8.8), (34.6, 7.2)]),
    legs([13.5, 17.5, 26, 30], 15.5, 2.3, 7.5),
    circ(38.6, 5.2, 0.7, hole=True),
    strokes=[("M12,10.5 C8,11 7,15 8.5,18.5", 1.9), ("M32.5,3.6 L34.2,1.4 M35.8,2.6 L37.4,0.8", 1.2),
             ("M31,8.6 C33,7 34.6,5 36,3.4", 1.4)])

add("cow",
    rr(11, 7.5, 23, 10.5, 4.5), rr(32.5, 9.2, 8.5, 6.2, 2.2),
    legs([13, 17.5, 26, 30.5], 16.5, 2.9, 6.5),
    circ(25, 18.6, 2.1),
    poly([(34, 9.4), (33, 6), (36, 8.6)]), poly([(38, 8.6), (40.5, 5.8), (40, 9.4)]),
    ell(18, 11.5, 3.4, 2.2, hole=True), ell(27, 13.6, 2.6, 1.8, hole=True),
    circ(39.4, 11.4, 0.7, hole=True),
    strokes=[("M11.5,10 C8.5,11 8,15 9.5,18", 1.7)])

add("giraffe",
    ell(19, 12.4, 8.2, 3.8),
    poly([(24.5, 11), (31.5, 1.8), (35, 1.8), (30, 14)]),
    ell(35.2, 3.2, 3.4, 1.9), rect(33.4, 0.2, 0.9, 2), rect(36.2, 0.2, 0.9, 2),
    legs([12.4, 16, 22, 25.6], 14.5, 2.2, 8.5),
    ell(16.5, 11.6, 1.8, 1.3, hole=True), ell(21.5, 13.4, 1.6, 1.2, hole=True),
    ell(29, 7.5, 1.1, 1.4, hole=True), circ(36.8, 2.9, 0.6, hole=True),
    strokes=[("M11.2,11.5 C8.5,12.5 8.5,16 10,18", 1.5)])

add("rhino",
    ell(21, 13, 13, 6.2),
    poly([(31, 8.5), (40, 8), (45.5, 12), (44.5, 15.5), (36, 17.5), (31, 16)]),
    poly([(41.5, 9.4), (45.6, 3.2), (45.4, 10.4)]), poly([(38.4, 8.6), (39.6, 5.6), (40.8, 8.6)]),
    circ(34.4, 6.6, 1.3),
    legs([11.5, 16.5, 25, 30], 16.5, 3.6, 6.5),
    circ(40.6, 10.6, 0.7, hole=True),
    strokes=[("M9,11.5 C6.5,12 6,15 7.5,17", 1.6)])

add("hippo",
    ell(21, 13.5, 13.5, 6.6), rr(30, 8.8, 15, 9.4, 4.4),
    circ(35, 8.4, 1.5), circ(40.4, 8.4, 1.5),
    legs([11, 16.5, 25, 30.5], 17.5, 4, 5.5),
    circ(41.6, 11.4, 0.7, hole=True), circ(36.4, 11.4, 0.7, hole=True))

add("elephant",
    ell(19.5, 12, 12.5, 7.4), circ(33.5, 9.4, 6.4),
    legs([9.5, 15, 22, 27.5], 15.5, 4.2, 7.5),
    ell(29.4, 10.2, 2.6, 4, hole=True),
    circ(36.8, 7.6, 0.7, hole=True),
    strokes=[("M39,11.5 C41.5,14 42,18 40.5,21.5", 3.2), ("M37.8,13.4 L41.6,15.2", 1.4)])

add("orca",
    ell(24, 13.6, 16.5, 5.2),
    poly([(19.5, 9.4), (23.5, 1), (27, 9.4)]),
    poly([(9, 9.6), (7.2, 5.6), (3.2, 8.4), (8.6, 13.6), (3.2, 18.8), (7.2, 21.6), (9, 17.6)]),
    poly([(27, 15.4), (31.5, 21.4), (25, 18.6)]),
    ell(34.5, 11.4, 2.4, 1.3, hole=True),
    ell(22, 16.4, 8, 1.6, hole=True))

add("whale",
    ell(22, 14, 18.5, 5.4),
    poly([(24, 9), (27, 7.6), (29.5, 9.2)]),
    poly([(5.2, 10.4), (3, 6.4), (0.5, 9.6), (4.6, 14), (0.5, 18.4), (3, 21.6), (5.2, 17.6)]),
    poly([(24, 16), (31, 21.6), (21, 18.6)]),
    circ(37.8, 12.4, 0.8, hole=True),
    strokes=[("M40.4,14.6 C36,16.2 30,16.6 25,16.2", 1.1)])

# --- køretøjer ---
add("car",
    poly([(4, 16), (4, 12.6), (9, 11.6), (14, 6.6), (30, 6.6), (37, 11.8), (44, 12.8), (44, 16)]),
    wheel(13, 18), wheel(35, 18),
    poly([(15, 8.2), (22, 8.2), (22, 11.8), (11.5, 11.8)], hole=True),
    poly([(23.6, 8.2), (29.4, 8.2), (34.8, 11.8), (23.6, 11.8)], hole=True))

S["smallcar"] = S["car"]   # samme silhuet som bilen; kun fotoet adskiller dem

add("suv",
    poly([(4, 16), (4, 10.6), (8, 9.8), (12, 4.8), (32, 4.8), (38, 9.8), (44, 10.8), (44, 16)]),
    rect(13, 3.4, 18, 1.2),
    wheel(12.5, 18, 3.5, 1.4), wheel(35.5, 18, 3.5, 1.4),
    rr(13.6, 6.2, 8, 4.2, 0.6, hole=True), poly([(23, 6.2), (31, 6.2), (35.5, 10.4), (23, 10.4)], hole=True))

add("pickup",
    poly([(4, 16), (4, 9.6), (22, 9.6), (22, 4.6), (34, 4.6), (39.5, 9.6), (44, 10.6), (44, 16)]),
    wheel(12, 18), wheel(36, 18),
    rr(5.4, 11, 15.4, 3.6, 0.5, hole=True),
    poly([(23.6, 6.2), (32.8, 6.2), (37, 9.8), (23.6, 9.8)], hole=True))

add("bus",
    rr(3, 4, 42, 12.6, 2.2),
    wheel(11, 18), wheel(37, 18),
    *[rr(x, 6.4, 4.6, 4.4, 0.6, hole=True) for x in (5.6, 11.6, 17.6, 23.6, 29.6)],
    rr(36.4, 6.4, 6.2, 8.6, 0.6, hole=True),
    rect(35.2, 6.4, 0.001, 0.001))

add("garbage",
    poly([(4, 9.6), (9, 4.8), (30, 4.8), (30, 16), (4, 16)]),
    rr(31, 7, 12.5, 9, 1.6),
    wheel(10, 18), wheel(22, 18), wheel(38, 18),
    rr(33, 8.6, 5.6, 4, 0.5, hole=True),
    rect(7, 8, 20.5, 0.9, hole=True), rect(7, 11.4, 20.5, 0.9, hole=True))

add("lorry",
    rr(3, 3.6, 28, 12.4, 1.2), rr(32, 7, 11.5, 9, 1.6),
    wheel(10, 18), wheel(22, 18), wheel(38, 18),
    rr(34, 8.6, 5.4, 4, 0.5, hole=True))

add("semi",
    rr(1, 2.2, 30.5, 13.8, 1.2), rr(33.5, 6, 10, 10, 1.6),
    wheel(7, 18), wheel(13.5, 18), wheel(38.5, 18),
    rr(35.4, 7.6, 5, 4.2, 0.5, hole=True),
    rect(31.5, 12, 2, 1.6))

add("locomotive",
    rr(1.5, 8, 27, 9, 3.4), rr(27, 3.8, 15.5, 13.2, 1.6),
    rect(5.5, 4, 3.4, 5), rect(12, 5.8, 2.4, 3),
    wheel(8, 18, 2.6, 1), wheel(16, 18, 2.6, 1), wheel(24, 18, 2.6, 1), wheel(36, 18, 3.4, 1.4),
    rr(29.5, 5.6, 4.6, 4.6, 0.5, hole=True), rr(35.8, 5.6, 4.6, 4.6, 0.5, hole=True),
    poly([(43, 12), (46.5, 17), (43, 17)]),
    rect(0, 21.6, 48, 1.2))

add("submarine",
    ell(24, 14.4, 20.5, 5.6), rr(21, 5, 9, 7.4, 1.6), rect(27.2, 1.6, 1.3, 4.4),
    poly([(3.5, 10.2), (7.5, 14.4), (3.5, 18.6), (2, 14.4)]),
    rect(0.6, 12.6, 2.4, 3.6),
    circ(14, 14.4, 1.1, hole=True), circ(19, 14.4, 1.1, hole=True), circ(30, 14.4, 1.1, hole=True))

add("plane",
    ell(25, 13, 20, 3.6),
    poly([(6, 12), (9.5, 3), (13.5, 3), (12, 12)]),
    poly([(19, 12), (27, 12), (19.5, 21), (13.5, 21)]),
    poly([(6, 12), (10, 8.6), (13, 12)]),
    rr(20, 17.4, 5, 2.6, 1.2),
    *[circ(x, 12.2, 0.7, hole=True) for x in (24, 27, 30, 33, 36)],
    poly([(38.5, 10.4), (42.6, 11.4), (39, 12.6)], hole=True))

root = pathlib.Path(__file__).resolve().parent.parent
ts_lines = ["// Genereret af scripts/silhouettes.py — ret ikke her, ret i scriptet og kør det igen.",
            'import type { ComparisonKind } from "../../lib/weightComparisons";', "",
            "export interface Silhouette {", "  /** Én path med nonzero-fyldregel: solide former med uret, huller mod uret. */",
            "  fill: string;", "  /** Tynde detaljer som [path, stregbredde]. */", "  strokes: [string, number][];", "}", "",
            "export const COMPARISON_SILHOUETTES: Record<ComparisonKind, Silhouette> = {"]
for kind, s_ in S.items():
    strokes = ", ".join(f"[{json.dumps(d)}, {w}]" for d, w in s_["strokes"])
    ts_lines.append(f"  {kind}: {{ fill: {json.dumps(s_['fill'])}, strokes: [{strokes}] }},")
ts_lines += ["};", ""]
(root / "src/features/overview/comparisonSilhouettes.ts").write_text("\n".join(ts_lines))

# Forhåndsvisning: stort + i appens størrelse
cells = []
for kind, s_ in S.items():
    strokes = "".join(f'<path d="{d}" fill="none" stroke="currentColor" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>' for d, w in s_["strokes"])
    svg = lambda h: (f'<svg viewBox="0 0 48 24" style="height:{h}px;color:#f0b27a"><path d="{s_["fill"]}" fill="currentColor" fill-rule="nonzero"/>{strokes}</svg>')
    cells.append(f'<div class="cell"><div class="big">{svg(120)}</div><div class="small">{svg(40)}</div><span>{kind}</span></div>')
html = f"""<!doctype html><meta charset="utf-8"><style>
body{{margin:0;background:#12161c;font:13px system-ui;color:#aab}}
.grid{{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:16px;width:1100px;box-sizing:border-box}}
.cell{{background:#1a1f27;border:1px solid #2a313b;border-radius:12px;padding:10px;display:flex;flex-direction:column;align-items:center;gap:6px}}
.big{{background:#0d1117;border-radius:8px;padding:6px}} .small{{padding:2px}}
</style><div class="grid">{"".join(cells)}</div>"""
(pathlib.Path(__file__).parent / "silhouettes.html").write_text(html)
print(len(S), "silhuetter →", "src/features/overview/comparisonSilhouettes.ts")
