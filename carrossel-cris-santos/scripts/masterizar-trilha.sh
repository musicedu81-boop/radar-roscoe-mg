#!/usr/bin/env bash
# Masteriza a trilha de fundo em -16 LUFS / -1,5 dBTP: com os golpes da abertura e do fecho, o vídeo fica perto de -14 LUFS.
# Uso: bash scripts/masterizar-trilha.sh  (lê out/trilha-bruta.wav, grava public/trilha.wav)
set -euo pipefail
J=$(ffmpeg -hide_banner -i out/trilha-bruta.wav -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
MI=$(echo "$J" | python3 -c "import json,sys; d=json.load(sys.stdin); print(f\"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}\")")
ffmpeg -v error -y -i out/trilha-bruta.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11:$MI:linear=true" -ar 48000 -c:a pcm_s16le public/trilha.wav
