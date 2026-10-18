#!/usr/bin/env bash
# Gera a trilha e masteriza em -14 LUFS / -1 dBTP (padrão de redes sociais). Uso: bash scripts/masterizar-trilha.sh
set -euo pipefail
python3 scripts/compor-trilha.py
J=$(ffmpeg -hide_banner -i out/trilha-bruta.wav -af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
MI=$(echo "$J" | python3 -c "import json,sys; d=json.load(sys.stdin); print(f\"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}\")")
ffmpeg -v error -y -i out/trilha-bruta.wav -af "loudnorm=I=-14:TP=-1.0:LRA=11:$MI:linear=true" -ar 48000 -c:a pcm_s16le public/trilha.wav
