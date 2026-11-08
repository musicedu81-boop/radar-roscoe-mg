# Encaixa a arte final do retrato (metade rosto, metade borboleta, fundo transparente) na tela do retrato
# da vinheta (1000x1750), com os olhos exatamente onde estavam no retrato anterior: a composição não muda.
# Uso: python3 scripts/encaixar-rosto.py  (lê scripts/rosto-arte.png, grava public/rosto.png)
import cv2
import numpy as np

LARGURA, ALTURA = 1000, 1750
# Centro das íris na tela do retrato (medido no retrato anterior) e na arte enviada
OLHOS_TELA = np.array([[360, 1202], [628, 1200]], float)
OLHOS_ARTE = np.array([[270, 627.5], [406.5, 624]], float)

arte = cv2.imread('scripts/rosto-arte.png', cv2.IMREAD_UNCHANGED).astype(np.float64) / 255
escala = np.linalg.norm(OLHOS_TELA[1] - OLHOS_TELA[0]) / np.linalg.norm(OLHOS_ARTE[1] - OLHOS_ARTE[0])
desloc = OLHOS_TELA.mean(0) - OLHOS_ARTE.mean(0) * escala
M = np.array([[escala, 0, desloc[0]], [0, escala, desloc[1]]])

# Alfa pré-multiplicado na reamostragem: sem halo escuro na borda recortada
alfa = arte[:, :, 3:4]
pre = np.concatenate([arte[:, :, :3] * alfa, alfa], 2)
tela = cv2.warpAffine(pre, M, (LARGURA, ALTURA), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
tela = np.clip(tela, 0, 1)
a = tela[:, :, 3:4]
cor = np.where(a > 1e-4, tela[:, :, :3] / np.maximum(a, 1e-4), 0)

# Nitidez leve para compensar a ampliação
borrada = cv2.GaussianBlur(cor, (0, 0), 1.2)
cor = np.clip(cor + 0.45 * (cor - borrada), 0, 1)

# A base da tela corta o pescoço: some suave nos últimos 190 px (fica sob o degradê escuro da vinheta)
y = np.arange(ALTURA)[:, None, None]
a = a * np.clip((ALTURA - y) / 190, 0, 1)

saida = np.concatenate([cor, a], 2)
cv2.imwrite('public/rosto.png', (saida * 255 + 0.5).astype(np.uint8))
print(f'escala {escala:.4f}, deslocamento ({desloc[0]:.1f}, {desloc[1]:.1f})')
