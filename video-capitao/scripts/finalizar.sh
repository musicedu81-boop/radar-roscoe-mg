#!/usr/bin/env bash
# Renderiza a composição e masteriza o MP4 final para redes sociais.
# Uso: scripts/finalizar.sh [saida.mp4]
# Em ambientes sem o Chrome do Remotion, aponte REMOTION_BROWSER para um Chromium local.
# Com pressa: PRESET=veryfast troca ~2 min de masterização por um arquivo um pouco maior.
set -euo pipefail
cd "$(dirname "$0")/.."

OUT="${1:-out/video-final.mp4}"
PRESET="${PRESET:-slow}"
mkdir -p out "$(dirname "$OUT")"
BROWSER=()
if [ -n "${REMOTION_BROWSER:-}" ]; then
  BROWSER=(--browser-executable="$REMOTION_BROWSER")
fi

npx remotion render VideoCapitao out/render-bruto.mp4 --crf=17 ${BROWSER[@]+"${BROWSER[@]}"}

# Limitador em -1,5 dB com compensação de atraso (a voz não sai de sincronia)
# e vídeo reencodado mais leve, bom para enviar pelo celular
ffmpeg -hide_banner -loglevel error -y -i out/render-bruto.mp4 \
  -c:v libx264 -preset "$PRESET" -crf 19 -profile:v high -pix_fmt yuv420p \
  -af "alimiter=limit=0.84:attack=5:release=50:level=false:latency=1" \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT"
rm -f out/render-bruto.mp4
echo "Pronto: $OUT"
