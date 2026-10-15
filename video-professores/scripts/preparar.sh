#!/usr/bin/env bash
# Prepara um vídeo bruto para a edição no Remotion.
# Uso: scripts/preparar.sh <video_bruto> <dir_modelos>
set -euo pipefail

RAW="$1"
MODELS="$2"
cd "$(dirname "$0")/.."
mkdir -p scripts/out public

echo "1/5 Normalizando vídeo (H.264, 30 fps constante, rotação aplicada)"
ffmpeg -hide_banner -loglevel error -y -i "$RAW" \
  -vf "fps=30,format=yuv420p" -c:v libx264 -preset medium -crf 18 \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart public/video-original.mp4

echo "2/5 Lendo metadados"
python3 - <<'EOF'
import json, subprocess
p = json.loads(subprocess.check_output([
    "ffprobe", "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height:format=duration", "-of", "json",
    "public/video-original.mp4"]))
meta = {
    "src": "video-original.mp4",
    "width": p["streams"][0]["width"],
    "height": p["streams"][0]["height"],
    "fps": 30,
    "durationInSeconds": round(float(p["format"]["duration"]), 3),
}
json.dump(meta, open("src/data/video-meta.json", "w"), indent=2)
print(meta)
EOF

echo "3/5 Transcrevendo a fala"
ffmpeg -hide_banner -loglevel error -y -i public/video-original.mp4 -ar 16000 -ac 1 scripts/out/audio16k.wav
python3 scripts/transcrever.py scripts/out/audio16k.wav "$MODELS"

echo "4/5 Rastreando o rosto"
python3 scripts/rastrear-rosto.py public/video-original.mp4 "$MODELS"

echo "5/5 Gerando trilha e efeitos"
DUR=$(python3 -c "import json;print(json.load(open('src/data/video-meta.json'))['durationInSeconds'])")
python3 scripts/gerar-trilha.py "$DUR" public/trilha.wav
python3 scripts/gerar-sfx.py

echo "Pronto. Revise scripts/out/transcricao.txt e ajuste src/Overlays.tsx."
