#!/usr/bin/env bash
# Renderiza a apresentação em motion do planejamento (ApresentacaoPlano) e masteriza o MP4.
# Uso: scripts/finalizar-apresentacao.sh [saida.mp4]
#
# O vídeo sai em partes (out/partes/v-<ini>-<fim>.mp4), sem áudio. Parte que já existe é
# reaproveitada: apague a parte da cena que mudou para refazer só ela. O áudio (narração,
# trilha com ducking e efeitos) sai inteiro de uma vez, para não ter emenda.
# Partes: PARTES="0-2393 2394-4499 4500-5759" scripts/finalizar-apresentacao.sh
# WebGL por software (cenas em 3D) exige --gl=swangle. Aponte REMOTION_BROWSER para um
# Chromium local quando o do Remotion não estiver disponível.
set -euo pipefail
cd "$(dirname "$0")/.."

COMP=ApresentacaoPlano
OUT="${1:-out/apresentacao-plano.mp4}"
PRESET="${PRESET:-slow}"
CONC="${CONC:-2}"
TOTAL=$(node -e "const n=require('./src/apresentacao/narracao.json');console.log(n.cenas.reduce((s,c)=>s+c.compassos*60,0))")
PARTES="${PARTES:-0-$((TOTAL - 1))}"
mkdir -p out/partes "$(dirname "$OUT")"
BROWSER=()
if [ -n "${REMOTION_BROWSER:-}" ]; then
  BROWSER=(--browser-executable="$REMOTION_BROWSER")
fi

: > out/partes/lista.txt
for parte in $PARTES; do
  arq="out/partes/v-${parte}.mp4"
  if [ ! -s "$arq" ]; then
    echo "Renderizando quadros ${parte}..."
    npx remotion render src/index.ts "$COMP" "$arq.tmp.mp4" --frames="$parte" --muted \
      --codec=h264 --crf=16 --gl=swangle --concurrency="$CONC" --log=error \
      ${BROWSER[@]+"${BROWSER[@]}"}
    mv "$arq.tmp.mp4" "$arq"
  fi
  echo "file '$(basename "$arq")'" >> out/partes/lista.txt
done

if [ ! -s out/partes/audio.wav ]; then
  echo "Renderizando o áudio..."
  npx remotion render src/index.ts "$COMP" out/partes/audio.tmp.wav --codec=wav \
    --gl=swangle --concurrency="$CONC" --log=error ${BROWSER[@]+"${BROWSER[@]}"}
  mv out/partes/audio.tmp.wav out/partes/audio.wav
fi

# Ganho para -14,5 LUFS integrado e limitador em -1,5 dB com compensação de atraso
# (latency=1: a voz não sai de sincronia com a legenda)
I=$(ffmpeg -hide_banner -nostats -i out/partes/audio.wav -af ebur128 -f null - 2>&1 |
  awk '/Integrated loudness:/{getline; print $2}' | tail -1)
GANHO=$(python3 -c "print(round(-14.5 - ($I), 2))")
echo "Loudness bruto: $I LUFS, ganho: $GANHO dB"

ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i out/partes/lista.txt \
  -i out/partes/audio.wav -map 0:v -map 1:a \
  -c:v libx264 -preset "$PRESET" -crf 19 -profile:v high -pix_fmt yuv420p \
  -af "volume=${GANHO}dB,alimiter=limit=0.84:attack=5:release=50:level=false:latency=1" \
  -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$OUT"
echo "Pronto: $OUT"
