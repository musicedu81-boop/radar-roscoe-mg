#!/usr/bin/env bash
# Masteriza uma trilha de fundo em -16 LUFS / -1,5 dBTP: com os golpes da abertura e do fecho, o vídeo fica perto de -14 LUFS.
# Uso: bash scripts/masterizar-trilha.sh [entrada.wav] [saida.wav]  (padrão: out/trilha-bruta.wav -> public/trilha.wav)
set -euo pipefail
ENTRADA=${1:-out/trilha-bruta.wav}
SAIDA=${2:-public/trilha.wav}
J=$(ffmpeg -hide_banner -i "$ENTRADA" -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
MI=$(echo "$J" | python3 -c "import json,sys; d=json.load(sys.stdin); print(f\"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}\")")
ffmpeg -v error -y -i "$ENTRADA" -af "loudnorm=I=-16:TP=-1.5:LRA=11:$MI:linear=true" -ar 48000 -c:a pcm_s16le "$SAIDA"
