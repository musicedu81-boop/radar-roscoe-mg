"""Texturas do Short (estilo Vox colagem): papel amassado claro/escuro e mapa de terreno
estilo satélite, na mesma projeção de scripts/geo.py.
Uso: python3 scripts/short_texturas.py <mg-mun.json>
"""
import json
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from shapely.geometry import shape, box, Point
from shapely.ops import unary_union

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "tex")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(64)


def blur(a, r):
    from scipy.ndimage import gaussian_filter
    return gaussian_filter(a.astype(np.float32), r)


def fbm(h, w, octaves=6, base=4, seed=0):
    r = np.random.default_rng(seed)
    out = np.zeros((h, w), np.float32)
    amp = 1.0
    for o in range(octaves):
        n = base * 2 ** o
        small = r.normal(0, 1, (n + 2, int(n * w / h) + 2)).astype(np.float32)
        im = Image.fromarray(small, mode="F").resize((w, h), Image.BICUBIC)
        out += np.asarray(im, np.float32) * amp
        amp *= 0.5
    return out


# ------------------------------------------------------------ papel amassado
def amassado(W, H, n=240, seed=1):
    r = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    h = np.zeros((H, W), np.float32)
    for _ in range(n):
        cx, cy = r.uniform(-0.1 * W, 1.1 * W), r.uniform(-0.1 * H, 1.1 * H)
        ang = r.uniform(0, math.pi)
        nx, ny = math.cos(ang), math.sin(ang)
        d = (xx - cx) * nx + (yy - cy) * ny  # distância ao vinco
        t = -(xx - cx) * ny + (yy - cy) * nx  # posição ao longo do vinco
        L = r.uniform(0.15, 0.6) * max(W, H)
        win = np.exp(-(t / L) ** 2)
        a = r.uniform(0.02, 0.07) * (1 if r.random() > 0.5 else -1)
        h += a * np.abs(d) * win
    h = blur(h, 0.9)
    gy, gx = np.gradient(h)
    nz = 1.0 / np.sqrt(gx ** 2 + gy ** 2 + 1)
    lx, ly, lz = -0.55, -0.6, 0.58
    shade = (-gx * lx - gy * ly + lz) * nz
    shade = (shade - shade.mean()) / (shade.std() + 1e-6)
    fine = fbm(H, W, 5, 40, seed + 7) * 0.12
    blot = fbm(H, W, 3, 3, seed + 9) * 0.35
    return shade, fine, blot


W, H = 1080, 1920
shade, fine, blot = amassado(W, H)
lum = 0.78 + shade * 0.095 + fine * 0.05 + blot * 0.03
yy, xx = np.mgrid[0:H, 0:W]
vig = 1 - 0.18 * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
lum = lum * vig
rgb = np.stack([lum * 1.0, lum * 0.985, lum * 0.955], -1)
Image.fromarray((rgb * 255).clip(0, 255).astype(np.uint8)).save(os.path.join(OUT, "amassado.jpg"), quality=92)

shade2, fine2, blot2 = amassado(W, H, seed=5)
lum2 = 0.15 + shade2 * 0.05 + fine2 * 0.04 + blot2 * 0.03
lum2 *= vig
rgb2 = np.stack([lum2, lum2 * 1.0, lum2 * 0.98], -1)
Image.fromarray((rgb2 * 255).clip(0, 255).astype(np.uint8)).save(os.path.join(OUT, "amassado-escuro.jpg"), quality=92)

# folha de papel amassado (para cartões/cédula) menor
shade3, fine3, blot3 = amassado(900, 1100, n=90, seed=11)
lum3 = 0.9 + shade3 * 0.04 + fine3 * 0.04
rgb3 = np.stack([lum3, lum3 * 0.99, lum3 * 0.96], -1)
Image.fromarray((rgb3 * 255).clip(0, 255).astype(np.uint8)).save(os.path.join(OUT, "folha.jpg"), quality=90)

# ------------------------------------------------------------ mapa de terreno
mg = json.load(open(sys.argv[1]))
feats = {f["properties"]["name"]: shape(f["geometry"]) for f in mg["features"]}
K = 25.0
COS = math.cos(math.radians(-15.0))


def P(lon, lat):
    return ((lon + 54.0) * K * COS, -(lat + 15.0) * K)


X0, Y0, X1, Y1 = 268.5, 107.5, 282.5, 121.5  # caixa em unidades de mapa
S = 200  # px por unidade
MW, MH = int((X1 - X0) * S), int((Y1 - Y0) * S)


def topx(x, y):
    return ((x - X0) * S, (y - Y0) * S)


def poly_px(g):
    out = []
    geoms = [g] if g.geom_type == "Polygon" else list(getattr(g, "geoms", []))
    for p in geoms:
        if p.geom_type != "Polygon":
            continue
        out.append([topx(*P(x, y)) for x, y in p.exterior.coords])
    return out


def mask_of(g, blur_r=0):
    m = Image.new("L", (MW, MH), 0)
    d = ImageDraw.Draw(m)
    for pts in poly_px(g):
        d.polygon(pts, fill=255)
    if blur_r:
        m = m.filter(ImageFilter.GaussianBlur(blur_r))
    return np.asarray(m, np.float32) / 255


relief = fbm(MH, MW, 7, 3, 21)
relief += fbm(MH, MW, 4, 18, 22) * 0.35
gy, gx = np.gradient(blur(relief, 2))
hill = np.clip(0.75 + (-gx * 0.7 - gy * 0.7) * 9, 0.35, 1.25)
veg = fbm(MH, MW, 6, 10, 23)
col = np.zeros((MH, MW, 3), np.float32)
# base: pasto/eucalipto/mata secundária
base_a = np.array([0.42, 0.47, 0.30])
base_b = np.array([0.30, 0.38, 0.22])
solo = np.array([0.55, 0.46, 0.34])
t = np.clip((veg + 1.2) / 2.4, 0, 1)[..., None]
col = base_a * (1 - t) + base_b * t
soil = np.clip((fbm(MH, MW, 5, 14, 24) - 0.9) * 2, 0, 1)[..., None]
col = col * (1 - soil * 0.6) + solo * soil * 0.6
# parque: mata atlântica densa
perd_box = box(-42.58, -19.82, -42.40, -19.45)
perd = unary_union([feats["Timóteo"], feats["Marliéria"], feats["Dionísio"]]).intersection(perd_box)
pm0 = blur(mask_of(perd, 0), 40) + fbm(MH, MW, 5, 12, 27) * 0.22
pm = np.clip((pm0 - 0.38) / 0.24, 0, 1)[..., None]
mata = np.array([0.13, 0.26, 0.14]) * (0.85 + 0.3 * np.clip((veg[..., None] + 1) / 2, 0, 1))
col = col * (1 - pm) + mata * pm
# manchas urbanas
urb = unary_union([
    feats["Timóteo"].difference(box(-42.58, -19.9, -42.3, -19.4)).buffer(-0.004),
])
cidades = [(-42.537, -19.47, 0.035), (-42.628, -19.515, 0.03), (-42.57, -19.37, 0.02), (-42.635, -19.56, 0.03)]
um = mask_of(urb, 6)
for lo, la, r in cidades:
    um = np.maximum(um, mask_of(Point(lo, la).buffer(r), 14))
speck = np.clip(fbm(MH, MW, 3, 160, 25) * 0.6 + 0.5, 0, 1)
urbcol = np.array([0.66, 0.62, 0.57]) * (0.75 + 0.4 * speck[..., None])
um3 = np.clip(um * (0.6 + 0.6 * np.clip(fbm(MH, MW, 4, 30, 26), -1, 1)), 0, 1)[..., None]
col = col * (1 - um3) + urbcol * um3
col = col * hill[..., None]
img = Image.fromarray((col * 255).clip(0, 255).astype(np.uint8))
d = ImageDraw.Draw(img)


def linhas(g, width, color):
    geoms = [g] if g.geom_type == "LineString" else list(getattr(g, "geoms", []))
    for ln in geoms:
        if ln.geom_type != "LineString":
            continue
        pts = [topx(*P(x, y)) for x, y in ln.coords]
        d.line(pts, fill=color, width=width, joint="curve")


def shared(a, b):
    return feats[a].boundary.intersection(feats[b].boundary)


pir = unary_union([shared("Timóteo", "Coronel Fabriciano"), shared("Timóteo", "Ipatinga")])
doce = unary_union([shared("Timóteo", "Caratinga"), shared("Timóteo", "Bom Jesus do Galho"), shared("Ipatinga", "Caratinga"),
                    shared("Marliéria", "Bom Jesus do Galho"), shared("Santana do Paraíso", "Caratinga"), shared("Ipatinga", "Ipaba")])
linhas(pir, 9, (58, 92, 104))
linhas(doce, 13, (58, 92, 104))
# lagoas
r2 = np.random.default_rng(40)
inner = perd.buffer(-0.012)
pb = perd.bounds
n = 0
while n < 40:
    lo = r2.uniform(pb[0] + 0.03, pb[2])
    la = r2.uniform(pb[1], pb[3])
    if inner.contains(Point(lo, la)):
        x, y = topx(*P(lo, la))
        rx, ry = r2.uniform(8, 26), r2.uniform(6, 18)
        d.ellipse([x - rx, y - ry, x + rx, y + ry], fill=(44, 70, 84))
        n += 1
img = img.filter(ImageFilter.GaussianBlur(0.8))
img.save(os.path.join(OUT, "terreno.jpg"), quality=90)
json.dump({"x0": X0, "y0": Y0, "x1": X1, "y1": Y1, "w": MW, "h": MH},
          open(os.path.join(ROOT, "src", "data", "terreno.json"), "w"))

# nuvens (alfa) para sobrepor ao terreno
cl = fbm(MH // 2, MW // 2, 6, 3, 31)
cl = np.clip((cl - 0.6) * 1.4, 0, 1)
cl = blur(cl, 3)
a = (cl * 235).clip(0, 255).astype(np.uint8)
rgba = np.dstack([np.full_like(a, 250), np.full_like(a, 250), np.full_like(a, 252), a])
Image.fromarray(rgba, "RGBA").save(os.path.join(OUT, "nuvens.png"))
print("ok", MW, MH)
