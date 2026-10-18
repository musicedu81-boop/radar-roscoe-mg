# Recorta o retrato (metade rosto, metade borboleta), aplica a paleta e grava public/rosto.png com bordas suaves.
# Uso: python3 scripts/preparar-rosto.py
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

PROFUNDO = np.array([0x2D, 0x08, 0x45]) / 255
MEDIO = np.array([0x7B, 0x2F, 0xBE]) / 255

im = Image.open('scripts/rosto-original.png').convert('RGB').crop((150, 300, 1150, 2050))
w, h = im.size
rgb = np.asarray(im).astype(np.float32) / 255

# Vinheta em multiply: centro limpo, bordas puxadas para o Roxo Profundo
yy, xx = np.mgrid[0:h, 0:w]
r = np.sqrt(((xx - 500) / 648) ** 2 + ((yy - 1113) / 768) ** 2)
a = np.clip((r - 0.4) / 0.6, 0, 1)[..., None] * 0.9
rgb = rgb * (1 - a) + rgb * PROFUNDO * a

# Soft-light com o Roxo Médio a 50%
def soft_light(cb, cs):
    d = np.where(cb <= 0.25, ((16 * cb - 12) * cb + 4) * cb, np.sqrt(cb))
    return np.where(cs <= 0.5, cb - (1 - 2 * cs) * cb * (1 - cb), cb + (2 * cs - 1) * (d - cb))

rgb = rgb * 0.5 + soft_light(rgb, MEDIO) * 0.5

# Máscara elíptica com borda bem difusa
m = Image.new('L', (w, h), 0)
ImageDraw.Draw(m).ellipse((90, 120, w - 60, h - 80), fill=255)
m = m.filter(ImageFilter.GaussianBlur(90))

out = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8))
out.putalpha(m)
out.save('public/rosto.png', optimize=True)
print(out.size)
