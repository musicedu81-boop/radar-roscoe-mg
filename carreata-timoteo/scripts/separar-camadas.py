# Separa o flyer em camadas para animar: cada elemento vira um PNG recortado e o fundo é preenchido por trás.
# Uso: python3 scripts/separar-camadas.py   (requer opencv-python-headless e scipy)
# Saída: public/camadas/*.png e src/camadas.json (posição de cada camada em px do flyer 894x1600)
import json

import cv2
import numpy as np
from scipy import ndimage as ndi

IM = cv2.imread('scripts/flyer.jpg')
H, W = IM.shape[:2]
HSV = cv2.cvtColor(IM, cv2.COLOR_BGR2HSV).astype(np.int16)
h, s, v = HSV[..., 0], HSV[..., 1], HSV[..., 2]
yy, xx = np.mgrid[0:H, 0:W]
AMARELO = (h >= 12) & (h <= 35) & (s > 120) & (v > 140)
VERDE = (h >= 36) & (h <= 95) & (s > 90) & (v > 45)
ELIPSE = cv2.MORPH_ELLIPSE


def kernel(r):
    return cv2.getStructuringElement(ELIPSE, (2 * r + 1, 2 * r + 1))


def regiao(y0, y1, x0, x1):
    m = np.zeros((H, W), bool)
    m[y0:y1, x0:x1] = True
    return m


def maiores(m, minimo):
    lab, n = ndi.label(m)
    if n == 0:
        return m
    tam = ndi.sum(m, lab, range(1, n + 1))
    return np.isin(lab, 1 + np.nonzero(tam >= minimo)[0])


# ---------- Título ----------
titulo = (~AMARELO) & regiao(35, 485, 30, 870)
titulo = cv2.morphologyEx(titulo.astype(np.uint8), cv2.MORPH_OPEN, kernel(4)).astype(bool)
titulo = maiores(ndi.binary_fill_holes(titulo), 8000)

# ---------- Caminhão (treliça vazada) ----------
sombra = (v <= 60) & (h >= 36) & (h <= 95) & (s > 110)
cam = (~(VERDE | AMARELO | sombra)) & regiao(955, 1295, 55, 870)
cam = cv2.morphologyEx(cam.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)).astype(bool)
solido = regiao(1125, 1295, 55, 870) | regiao(960, 1295, 600, 870)
cheio = ndi.binary_fill_holes(cv2.morphologyEx(cam.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)))
cam = np.where(solido, cheio, cam)
env = np.array([(40, 1040), (95, 1035), (290, 985), (340, 958), (390, 985), (440, 993), (490, 996), (530, 1033), (600, 1038), (630, 978), (700, 972), (800, 988), (880, 1010)], np.float32)
topo = np.interp(np.arange(W), env[:, 0], env[:, 1])
pele = (h <= 20) & (s > 60) & (yy < 1045)
caminhao = maiores(cam & (yy >= topo[None, :] - 6) & ~pele, 400)


# ---------- Homens (GrabCut) ----------
def grabcut(caixa, elipses, retangulos, fundo_extra):
    x0, y0, x1, y1 = caixa
    roi = IM[y0:y1, x0:x1].copy()
    m = np.full(roi.shape[:2], cv2.GC_PR_BGD, np.uint8)
    for cx, cy, ax, ay in elipses:
        cv2.ellipse(m, (cx - x0, cy - y0), (int(ax * 1.9), int(ay * 1.7)), 0, 0, 360, cv2.GC_PR_FGD, -1)
    for a, b, c, d in retangulos:
        cv2.rectangle(m, (a - x0, b - y0), (c - x0, d - y0), cv2.GC_PR_FGD, -1)
    for cx, cy, ax, ay in elipses:
        cv2.ellipse(m, (cx - x0, cy - y0), (ax, ay), 0, 0, 360, cv2.GC_FGD, -1)
    for a, b, c, d in retangulos:
        cv2.rectangle(m, (a - x0 + 25, b - y0 + 25), (c - x0 - 25, d - y0 - 25), cv2.GC_FGD, -1)
    sub = (slice(y0, y1), slice(x0, x1))
    m[AMARELO[sub]] = cv2.GC_BGD
    m[caminhao[sub]] = cv2.GC_BGD
    m[fundo_extra[sub]] = cv2.GC_BGD
    bgd, fgd = np.zeros((1, 65)), np.zeros((1, 65))
    cv2.grabCut(roi, m, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
    p = np.isin(m, (cv2.GC_FGD, cv2.GC_PR_FGD))
    lab, _ = ndi.label(p)
    p = ndi.binary_fill_holes(lab == lab[elipses[0][1] - y0, elipses[0][0] - x0])
    out = np.zeros((H, W), bool)
    out[y0:y1, x0:x1] = p
    return out


fundo_e = regiao(0, H, 468, W) | regiao(700, H, 0, 105) | regiao(500, 640, 0, 140)
fundo_e &= ~((xx > 450) & (xx < 470) & (yy > 760))
homem_esq = grabcut((90, 455, 520, 1180), [(322, 565, 55, 70), (185, 715, 22, 45)], [(170, 760, 430, 1000), (395, 840, 455, 1000)], fundo_e)
fundo_d = regiao(0, H, 0, 452) | regiao(730, H, 812, W) | regiao(520, 690, 640, W)
fundo_d &= ~((xx > 640) & (yy > 640) & (yy < 830))
homem_dir = grabcut((440, 505, 840, 1180), [(565, 618, 55, 70), (740, 752, 25, 50)], [(490, 800, 730, 1000)], fundo_d)
# Inclui o contorno do adesivo (branco + verde) em volta de cada um
contorno = ~AMARELO & ~caminhao
for nome in ('esq', 'dir'):
    m = homem_esq if nome == 'esq' else homem_dir
    outro = homem_dir if nome == 'esq' else homem_esq
    cresce = cv2.dilate(m.astype(np.uint8), kernel(13)).astype(bool) & contorno & ~outro & (yy < 1060)
    if nome == 'esq':
        homem_esq = m | cresce
    else:
        homem_dir = m | (cresce & ~homem_esq)
homem_dir &= ~homem_esq
# Barras da treliça que sobraram acima do envelope não são dos homens
# Na faixa da treliça só ficam camiseta verde e pele
zona_trelica = (yy >= topo[None, :] - 12) & (xx >= 50) & (xx <= 545)
camiseta = (h >= 55) & (h <= 90) & (s > 140) & (v > 60)
braco = (h <= 20) & (s > 50) & (xx >= 370) & (xx <= 475)
metal = zona_trelica & ~(camiseta | braco)
homem_esq &= ~metal
homem_dir &= ~metal

# ---------- Bandeiras e mastros (balançam juntos) ----------
MASTROS = {'esq': ((74, 505), (0, 650)), 'dir': ((751, 528), (683, 700))}
pele_toda = (h <= 22) & (s > 45) & (v > 90)
homens = homem_esq | homem_dir
bandeiras, mastros, panos_cheios = {}, {}, {}
for lado, caixa in {'esq': (0, 490, 205, 700), 'dir': (680, 515, 894, 735)}.items():
    x0, y0, x1, y1 = caixa
    topo_m, base_m = MASTROS[lado]
    linha = np.zeros((H, W), np.uint8)
    cv2.line(linha, topo_m, base_m, 1, thickness=9)
    cv2.circle(linha, topo_m, 9, 1, -1)
    mastro = linha.astype(bool) & ~AMARELO & ~homens & ~pele_toda
    pano = (~AMARELO) & regiao(y0, y1, x0, x1) & ~homens & ~mastro & ~pele_toda
    pano = cv2.morphologyEx(pano.astype(np.uint8), cv2.MORPH_OPEN, kernel(3)).astype(bool)
    pano = maiores(ndi.binary_fill_holes(cv2.morphologyEx(pano.astype(np.uint8), cv2.MORPH_CLOSE, kernel(4))), 4000)
    pano &= ~homens & ~mastro
    # O canto do pano escondido atrás da mão em V é completado (senão abre buraco quando balança)
    casco = np.zeros((H, W), np.uint8)
    cv2.fillPoly(casco, [cv2.convexHull(np.argwhere(pano)[:, ::-1].astype(np.int32))], 1)
    escondido = casco.astype(bool) & cv2.dilate(homens.astype(np.uint8), kernel(3)).astype(bool) & ~pano
    bandeiras[f'bandeira-{lado}'] = pano
    panos_cheios[f'bandeira-{lado}'] = escondido
    mastros[f'mastro-{lado}'] = mastro

# ---------- Rodapé: informações, faixa e assinatura ----------
nao_verde = ~VERDE & ~((v < 70) & (s > 60) & (h >= 36) & (h <= 95))  # verde e verde escuro são fundo
infos = {}
for nome, caixa in {'info-dia': (55, 1278, 312, 1400), 'info-hora': (325, 1278, 547, 1400), 'info-local': (558, 1278, 870, 1405)}.items():
    x0, y0, x1, y1 = caixa
    m = nao_verde & regiao(y0, y1, x0, x1)
    infos[nome] = maiores(cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_OPEN, np.ones((2, 2), np.uint8)).astype(bool), 30)
faixa = (nao_verde & regiao(1395, 1538, 80, 850))
faixa = maiores(ndi.binary_fill_holes(cv2.morphologyEx(faixa.astype(np.uint8), cv2.MORPH_CLOSE, kernel(3))), 3000)
assinatura = maiores(nao_verde & regiao(1536, 1560, 270, 620), 4)

# Textos do rodapé levam uma auréola de 4 px do próprio fundo (sombra e antisserrilhado vão juntos)
for nome in infos:
    infos[nome] = cv2.dilate(infos[nome].astype(np.uint8), kernel(4)).astype(bool)
faixa = cv2.dilate(faixa.astype(np.uint8), kernel(3)).astype(bool)
assinatura = cv2.dilate(assinatura.astype(np.uint8), kernel(3)).astype(bool)

CAMADAS = {'titulo': titulo, 'homem-esq': homem_esq, 'homem-dir': homem_dir, 'caminhao': caminhao, **bandeiras, **mastros, **infos, 'faixa': faixa, 'assinatura': assinatura}

# ---------- Fundo limpo (preenchido por trás das camadas) ----------
def push_pull(img, peso):
    niveis = []
    I, P = img * peso[..., None], peso.copy()
    while min(I.shape[:2]) > 8:
        niveis.append((I, P))
        I, P = cv2.pyrDown(I), cv2.pyrDown(P)
    out = I / np.maximum(P[..., None], 1e-6)
    for I, P in reversed(niveis):
        up = cv2.pyrUp(out, dstsize=(I.shape[1], I.shape[0]))
        a = np.clip(P * 4, 0, 1)[..., None]
        out = (I / np.maximum(P[..., None], 1e-6)) * a + up * (1 - a)
    return out


# Raios verdes atrás das cabeças: saem do fundo, voltam animados no Remotion
raios = VERDE & regiao(330, 620, 90, 810) & ~titulo & ~homem_esq & ~homem_dir & ~bandeiras['bandeira-esq'] & ~bandeiras['bandeira-dir']
raios &= (yy < 480) | ~regiao(560, H, 0, W)
buraco = np.zeros((H, W), bool)
for m in CAMADAS.values():
    buraco |= m
for m in panos_cheios.values():
    buraco |= m
buraco = cv2.dilate(buraco.astype(np.uint8), kernel(4)).astype(bool)
# Em volta dos homens o buraco é maior: nenhum resto do contorno do adesivo fica no fundo quando eles pulam
buraco |= cv2.dilate((homem_esq | homem_dir).astype(np.uint8), kernel(10)).astype(bool)
# Restos finos da treliça (fora da máscara do caminhão) também saem; as torres de som ficam
restos = zona_trelica & (yy < 1245) & (((s < 70) & (v > 110)) | ((v < 70) & ~VERDE))
buraco |= cv2.dilate(restos.astype(np.uint8), kernel(3)).astype(bool)
buraco |= cv2.dilate(caminhao.astype(np.uint8), kernel(6)).astype(bool)
# Objetos coloridos de dentro do palco da carreta (vão junto com o caminhão, não ficam no fundo)
palco = regiao(990, 1135, 150, 600) & (s > 90) & ((h < 36) | (h > 95))
buraco |= cv2.dilate(palco.astype(np.uint8), kernel(5)).astype(bool)
img = IM.astype(np.float32) / 255


def completar_corpo(m):
    """Fecha os buracos que a treliça e o gerador fazem na camiseta e estende o corpo por trás do caminhão."""
    corpo = ndi.binary_fill_holes(cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_CLOSE, kernel(12)))
    base = corpo & (yy > 940) & (yy < 1000)
    colunas = np.nonzero(base.any(0))[0]
    if len(colunas):
        for x in range(colunas.min(), colunas.max() + 1):
            ys = np.nonzero(corpo[:, x])[0]
            if len(ys) and ys.max() > 960:  # só onde o corpo encosta no caminhão (não embaixo dos braços)
                corpo[ys.max():1115, x] = True
    # Continua a roupa para baixo: cor mediana de um trecho bem dentro do corpo, suavizada entre colunas
    cores = np.zeros((1, W, 3), np.float32)
    peso = np.zeros((1, W), np.float32)
    for x in np.nonzero(corpo.any(0))[0]:
        ys = np.nonzero(m[:, x])[0]
        if len(ys) < 30:
            continue
        trecho = ys[(ys < ys.max() - 6) & (ys > ys.max() - 32)]
        if len(trecho):
            cores[0, x] = np.median(img[trecho, x], axis=0)
            peso[0, x] = 1
    cores = cv2.GaussianBlur(cores, (0, 0), 6) / np.maximum(cv2.GaussianBlur(peso, (0, 0), 6)[..., None], 1e-6)
    escurece = np.clip(1 - (yy - 1000) / 400, 0.75, 1).astype(np.float32)[..., None]
    rgb = np.where(m[..., None], img, cores * escurece)
    alfa = corpo.astype(np.float32) * np.clip((1115 - yy) / 30, 0, 1)
    return rgb, alfa


CORPOS = {nome: completar_corpo(CAMADAS[nome]) for nome in ('homem-esq', 'homem-dir')}
cheio = push_pull(img, (~(buraco | cv2.dilate(raios.astype(np.uint8), kernel(2)).astype(bool))).astype(np.float32))
fundo = np.where(buraco[..., None], cheio, img)
fundo8 = (np.clip(fundo, 0, 1) * 255).astype(np.uint8)
fundo8 = cv2.inpaint(fundo8, cv2.dilate(raios.astype(np.uint8), kernel(3)), 6, cv2.INPAINT_TELEA)
cv2.imwrite('public/camadas/fundo.png', fundo8)

# ---------- Salva cada camada recortada na sua caixa ----------
meta = {'largura': W, 'altura': H, 'camadas': {}}
def sem_vermelho(bgr, mascara):
    """Nada vermelho na peça: luzes viram amarelo, objetos viram verde (mesmo brilho e sombra)."""
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    hh, ss, vv = hsv[..., 0].astype(int), hsv[..., 1].astype(int), hsv[..., 2].astype(int)
    vermelho = ((hh < 10) | (hh > 168)) & (ss > 140) & (vv > 90) & mascara  # vermelho saturado (pneu e chassi marrom ficam)
    lanterna = (hh >= 10) & (hh < 20) & (ss > 160) & (vv > 170) & mascara    # laranja de lanterna acesa
    hsv[..., 0] = np.where(lanterna, 27, np.where(vermelho, 68, hsv[..., 0]))
    # Marrom avermelhado (ferrugem, sombra quente) perde a saturação: nenhum tom puxa para o vermelho
    puxa = ((hh < 10) | (hh > 168)) & (ss > 100) & ~vermelho & ~lanterna & mascara
    hsv[..., 1] = np.where(puxa, np.minimum(ss, 70), hsv[..., 1]).astype(np.uint8)
    return cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR), int(vermelho.sum() + lanterna.sum() + puxa.sum())


for nome, m in CAMADAS.items():
    if nome in CORPOS:
        rgb, alfa = CORPOS[nome]
        cores = (np.clip(rgb, 0, 1) * 255).astype(np.uint8)
    elif nome in panos_cheios:
        cor = push_pull(img, m.astype(np.float32))
        cores = (np.clip(np.where(m[..., None], img, cor), 0, 1) * 255).astype(np.uint8)
        alfa = (m | panos_cheios[nome]).astype(np.float32)
    elif nome == 'caminhao':
        cores, n = sem_vermelho(IM, m)
        print('caminhão: pixels vermelhos recoloridos', n)
        alfa = m.astype(np.float32)
    else:
        alfa, cores = m.astype(np.float32), IM
    alfa = cv2.GaussianBlur(alfa, (0, 0), 0.7)
    ys, xs = np.nonzero(alfa > 0.01)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    rgba = np.dstack([cores[y0:y1, x0:x1], (alfa[y0:y1, x0:x1] * 255).astype(np.uint8)])
    cv2.imwrite(f'public/camadas/{nome}.png', rgba)
    meta['camadas'][nome] = {'x': int(x0), 'y': int(y0), 'w': int(x1 - x0), 'h': int(y1 - y0)}
    print(f'{nome:14s} x={x0:4d} y={y0:4d} {x1 - x0}x{y1 - y0}')
# Contorno do adesivo (faixa de 12px na borda de cada homem) e dígitos 22 da camisa
AMARELO_ESTAMPA = (h >= 16) & (h <= 36) & (s > 130) & (v > 140)
ESTAMPA = {'esq': (235, 760, 400, 890), 'dir': (490, 810, 660, 920)}
for lado, m in (('esq', homem_esq), ('dir', homem_dir)):
    c = meta['camadas'][f'homem-{lado}']
    caixa = (slice(c['y'], c['y'] + c['h']), slice(c['x'], c['x'] + c['w']))
    dist = cv2.distanceTransform(m.astype(np.uint8), cv2.DIST_L2, 5)
    anel = np.clip((13 - dist) / 1.5, 0, 1) * (dist > 0) * (yy < 985)
    anel = cv2.GaussianBlur(anel.astype(np.float32), (0, 0), 0.7)
    rgba = np.dstack([np.full(anel.shape + (3,), 255, np.uint8), (anel * 255).astype(np.uint8)])[caixa]
    cv2.imwrite(f'public/camadas/contorno-{lado}.png', rgba)
    x0, y0, x1, y1 = ESTAMPA[lado]
    amarelo = AMARELO_ESTAMPA & regiao(y0, y1, x0, x1) & m
    lab, n = ndi.label(amarelo)
    digitos = np.zeros((H, W), bool)
    for i in range(1, n + 1):
        ys, xs = np.nonzero(lab == i)
        if len(ys) > 400 and ys.max() - ys.min() > 50:
            digitos |= lab == i
    digitos = cv2.dilate(digitos.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    a = cv2.GaussianBlur(digitos.astype(np.float32), (0, 0), 0.8)
    rgba = np.dstack([np.full(a.shape + (3,), 255, np.uint8), (a * 255).astype(np.uint8)])[caixa]
    cv2.imwrite(f'public/camadas/numero-{lado}.png', rgba)
    print(f'numero-{lado}: {int(digitos.sum())} px')
meta['mastros'] = {k: {'topo': list(v[0]), 'base': list(v[1])} for k, v in MASTROS.items()}
json.dump(meta, open('src/camadas.json', 'w'), indent=1)
