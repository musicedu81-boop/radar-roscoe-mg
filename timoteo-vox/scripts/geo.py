"""Pre-projeta GeoJSON (Brasil, MG, Vale do Aço) para paths SVG em um único plano.
Uso: python3 scripts/geo.py <mg-mun.json> <br-states.json> <saida.json>"""
import json, math, sys
from shapely.geometry import shape, Polygon, MultiPolygon, LineString, MultiLineString, box
from shapely.ops import unary_union, linemerge

mg_path, br_path, out_path = sys.argv[1:4]
LAT0 = -15.0
K = 25.0  # unidades por grau
GEO_K = K
COS = math.cos(math.radians(LAT0))

def P(lon, lat):
    return ((lon + 54.0) * K * COS, -(lat - LAT0) * K)

def ring_d(coords, nd):
    pts = [P(x, y) for x, y in coords]
    f = f"{{:.{nd}f}}"
    s = "M" + " L".join(f.format(x) + "," + f.format(y) for x, y in pts) + "Z"
    return s

def geom_d(g, nd=2, closed=True):
    out = []
    if isinstance(g, Polygon):
        g = [g]
    elif isinstance(g, MultiPolygon):
        g = list(g.geoms)
    elif isinstance(g, (LineString, MultiLineString)):
        lines = [g] if isinstance(g, LineString) else list(g.geoms)
        f = f"{{:.{nd}f}}"
        for ln in lines:
            pts = [P(x, y) for x, y in ln.coords]
            out.append("M" + " L".join(f.format(x) + "," + f.format(y) for x, y in pts))
        return "".join(out)
    else:
        g = [p for p in getattr(g, 'geoms', []) if isinstance(p, Polygon)]
    for poly in g:
        out.append(ring_d(poly.exterior.coords, nd))
        for r in poly.interiors:
            out.append(ring_d(r.coords, nd))
    return "".join(out)

mg = json.load(open(mg_path))
br = json.load(open(br_path))
feats = {f["properties"]["name"]: shape(f["geometry"]) for f in mg["features"]}

res = {"K": K, "COS": COS, "LAT0": LAT0}
# Brasil (estados)
states = []
for f in br["features"]:
    g = shape(f["geometry"]).simplify(0.06, preserve_topology=True)
    nm = f["properties"].get("name") or f["properties"].get("sigla")
    states.append({"name": nm, "d": geom_d(g, 1)})
res["states"] = states
# MG municipios (simplificado)
res["mgMun"] = [{"name": n, "d": geom_d(g.simplify(0.006, preserve_topology=True), 2)} for n, g in feats.items()]
mg_union = unary_union(list(feats.values())).simplify(0.01)
res["mgOutline"] = geom_d(mg_union, 2)

REGION = ["Timóteo", "Ipatinga", "Coronel Fabriciano", "Santana do Paraíso", "Antônio Dias",
          "Jaguaraçu", "Marliéria", "Caratinga", "Bom Jesus do Galho", "Dionísio", "Belo Oriente",
          "Mesquita", "Joanésia", "São José do Goiabal", "Pingo-d'Água", "Córrego Novo", "Ipaba",
          "Açucena", "Nova Era", "São Domingos do Prata", "Ferros", "Santo Antônio do Rio Abaixo"]
reg = {}
for n in REGION:
    if n in feats:
        reg[n] = feats[n]
    else:
        print("faltando", n, file=sys.stderr)
res["region"] = [{"name": n, "d": geom_d(g.simplify(0.0007, preserve_topology=True), 3)} for n, g in reg.items()]

def cent(g):
    c = g.representative_point()
    x, y = P(c.x, c.y)
    return [round(x, 3), round(y, 3)]
res["centroids"] = {n: cent(g) for n, g in reg.items()}

tim = feats["Timóteo"]
# Rios aproximados pelos limites municipais
def shared(a, b):
    i = a.boundary.intersection(b.boundary)
    try:
        return linemerge(i)
    except Exception:
        return i
pir = unary_union([shared(tim, feats["Coronel Fabriciano"]), shared(tim, feats["Ipatinga"])])
doce = unary_union([shared(tim, feats["Caratinga"]), shared(tim, feats["Bom Jesus do Galho"]),
                    shared(feats["Ipatinga"], feats["Caratinga"]), shared(feats["Marliéria"], feats["Bom Jesus do Galho"]),
                    shared(feats["Santana do Paraíso"], feats["Caratinga"]), shared(feats["Ipatinga"], feats["Ipaba"]) if "Ipaba" in feats else LineString()])
res["rioPiracicaba"] = geom_d(pir.simplify(0.0005), 3)
res["rioDoce"] = geom_d(doce.simplify(0.0005), 3)
res["timoteo"] = geom_d(tim.simplify(0.0004, preserve_topology=True), 3)

# Parque (aprox.): parte leste de Timóteo + Marliéria + Dionísio, limitada ao bbox do PERD
area_tim = tim.area
best = None
for i in range(0, 200):
    lon_cut = -42.66 + i * 0.001
    park_tim = tim.intersection(box(lon_cut, -19.9, -42.3, -19.4))
    frac = park_tim.area / area_tim
    if best is None or abs(frac - 0.368) < abs(best[1] - 0.368):
        best = (lon_cut, frac)
lon_cut = best[0]
print("corte parque lon", lon_cut, "fração", round(best[1], 3), file=sys.stderr)
perd_box = box(lon_cut, -19.82, -42.40, -19.45)
perd = unary_union([feats["Timóteo"], feats["Marliéria"], feats["Dionísio"]]).intersection(perd_box)
res["parque"] = geom_d(perd.simplify(0.0008), 3)
# ~40 lagoas ilustrativas, sorteadas dentro da área aproximada do parque (fora de Timóteo urbano)
import random
from shapely.geometry import Point
random.seed(40)
lag = []
pb = perd.bounds
while len(lag) < 40:
    lo = random.uniform(pb[0] + 0.03, pb[2]); la = random.uniform(pb[1], pb[3])
    if perd.buffer(-0.012).contains(Point(lo, la)) and all((lo - a) ** 2 + (la - b) ** 2 > 0.012 ** 2 for a, b, _ in lag):
        lag.append((lo, la, random.uniform(0.004, 0.011)))
res["lagoas"] = [[round(P(a, b)[0], 3), round(P(a, b)[1], 3), round(r * GEO_K, 3)] for a, b, r in lag]
# pontos dentro da mancha urbana (para os "prédios" da cena da densidade)
urb = tim.difference(box(lon_cut, -19.9, -42.3, -19.4)).buffer(-0.006)
pr = []
ub = urb.bounds
random.seed(64)
while len(pr) < 46:
    lo = random.uniform(ub[0], ub[2]); la = random.uniform(ub[1], ub[3])
    if urb.contains(Point(lo, la)) and lo > -42.69:
        pr.append([round(v, 3) for v in P(lo, la)])
res["predios"] = sorted(pr, key=lambda q: q[1])
pc = perd.representative_point()
res["parqueCentro"] = [round(v, 3) for v in P(pc.x, pc.y)]
pbx0, pby1 = P(pb[0], pb[1]); pbx1, pby0 = P(pb[2], pb[3])
res["parqueBox"] = [round(pbx0, 3), round(pby0, 3), round(pbx1, 3), round(pby1, 3)]
res["parqueTimoteo"] = geom_d(tim.intersection(box(lon_cut, -19.9, -42.3, -19.4)).simplify(0.0006), 3)
res["timoteoUrbano"] = geom_d(tim.difference(box(lon_cut, -19.9, -42.3, -19.4)).simplify(0.0006), 3)
b = tim.bounds
x0, y1 = P(b[0], b[1]); x1, y0 = P(b[2], b[3])
res["timoteoBox"] = [round(x0, 3), round(y0, 3), round(x1, 3), round(y1, 3)]
b = mg_union.bounds
x0, y1 = P(b[0], b[1]); x1, y0 = P(b[2], b[3])
res["mgBox"] = [round(x0, 2), round(y0, 2), round(x1, 2), round(y1, 2)]

pts = {"Timóteo": (-42.6439, -19.5828), "Belo Horizonte": (-43.9378, -19.9208), "Ipatinga": (-42.5369, -19.4703),
       "Coronel Fabriciano": (-42.6286, -19.5186), "Santana do Paraíso": (-42.5689, -19.3661), "Itabira": (-43.2272, -19.6194),
       "Vitória": (-40.3377, -20.3155), "Pico do Ana Moura": (-42.6820, -19.5650), "Brasília": (-47.8825, -15.7942)}
res["points"] = {k: [round(c, 3) for c in P(*v)] for k, v in pts.items()}
json.dump(res, open(out_path, "w"), ensure_ascii=False, separators=(",", ":"))
import os
print("ok", os.path.getsize(out_path), "bytes", file=sys.stderr)
