#!/usr/bin/env bash
# Masteriza o áudio do render (loudness -16 LUFS, pico -1.5 dBTP) sem reencodar o vídeo.
# Uso: bash scripts/finalizar.sh out/timoteo-vox-bruto.mp4 entrega/timoteo-vox.mp4
set -euo pipefail
IN="$1"
OUT="$2"
# 1ª passada: mede
STATS=$(ffmpeg -hide_banner -i "$IN" -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
mi=$(echo "$STATS" | python3 -c 'import json,sys;print(json.load(sys.stdin)["input_i"])')
mtp=$(echo "$STATS" | python3 -c 'import json,sys;print(json.load(sys.stdin)["input_tp"])')
mlra=$(echo "$STATS" | python3 -c 'import json,sys;print(json.load(sys.stdin)["input_lra"])')
mth=$(echo "$STATS" | python3 -c 'import json,sys;print(json.load(sys.stdin)["input_thresh"])')
# 2ª passada: aplica
ffmpeg -hide_banner -v error -y -i "$IN" -c:v copy \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$mi:measured_TP=$mtp:measured_LRA=$mlra:measured_thresh=$mth:linear=true" \
  -ar 48000 -c:a aac -b:a 256k -movflags +faststart "$OUT"
echo "ok: $OUT (entrada $mi LUFS)"
