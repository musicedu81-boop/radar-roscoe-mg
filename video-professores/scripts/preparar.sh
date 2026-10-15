#!/usr/bin/env bash
# Prepara um vídeo bruto para a edição no Remotion.
# Uso: scripts/preparar.sh <video_bruto> <dir_modelos>
set -euo pipefail

RAW="$1"
MODELS="$2"
# Segundos em que o último quadro fica congelado no fim, com fade
END_HOLD=1.5
cd "$(dirname "$0")/.."
mkdir -p scripts/out public

echo "1/5 Normalizando vídeo (H.264, 30 fps constante, rotação aplicada)"
# Tela preta no fim (vinheta do CapCut, por exemplo) é cortada automaticamente
FIM=$(python3 - "$RAW" <<'EOF'
import re, subprocess, sys
dur = float(subprocess.check_output([
    "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", sys.argv[1]]))
log = subprocess.run([
    "ffmpeg", "-hide_banner", "-i", sys.argv[1], "-vf", "blackdetect=d=0.5:pix_th=0.12:pic_th=0.90",
    "-an", "-f", "null", "-"], capture_output=True, text=True).stderr
pretos = [(float(a), float(b)) for a, b in re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", log)]
fim = dur
if pretos and pretos[-1][1] >= dur - 0.15 and pretos[-1][0] > 1:
    fim = pretos[-1][0]
    print(f"   tela preta final de {dur - fim:.2f}s removida", file=sys.stderr)
print(f"{fim:.3f}")
EOF
)
ffmpeg -hide_banner -loglevel error -y -i "$RAW" -t "$FIM" \
  -vf "fps=30,format=yuv420p" -c:v libx264 -preset medium -crf 18 \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart public/video-original.mp4

echo "2/5 Lendo metadados"
python3 - "$END_HOLD" <<'EOF'
import json, subprocess, sys
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
    "endHoldInSeconds": float(sys.argv[1]),
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
# A trilha cobre o vídeo inteiro mais o respiro final
DUR=$(python3 -c "import json;m=json.load(open('src/data/video-meta.json'));print(m['durationInSeconds']+m['endHoldInSeconds'])")
python3 scripts/gerar-trilha.py "$DUR" public/trilha.wav
python3 scripts/gerar-sfx.py

echo "Pronto. Revise scripts/out/transcricao.txt e ajuste src/Overlays.tsx."
