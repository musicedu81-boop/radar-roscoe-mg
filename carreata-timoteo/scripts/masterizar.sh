#!/usr/bin/env bash
# Compõe a batida e masteriza em -14 LUFS / -1 dBTP. Uso: bash scripts/masterizar.sh
set -euo pipefail
python3 scripts/compor-batida.py
J=$(ffmpeg -hide_banner -i out/batida-bruta.wav -af loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
MI=$(echo "$J" | python3 -c "import json,sys; d=json.load(sys.stdin); print(f\"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}\")")
ffmpeg -v error -y -i out/batida-bruta.wav -af "loudnorm=I=-14:TP=-1.0:LRA=11:$MI:linear=true" -ar 48000 -c:a pcm_s16le public/batida.wav
