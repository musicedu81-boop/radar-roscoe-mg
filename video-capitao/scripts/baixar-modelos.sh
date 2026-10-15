#!/usr/bin/env bash
# Baixa os modelos usados por transcrever.py e rastrear-rosto.py.
# Uso: scripts/baixar-modelos.sh <dir_modelos>
set -euo pipefail

DEST="$1"
mkdir -p "$DEST"
cd "$DEST"

ASR=https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models
for m in sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 sherpa-onnx-whisper-small; do
  [ -d "$m" ] || curl -sSL "$ASR/$m.tar.bz2" | tar xj
done
[ -f silero_vad.onnx ] || curl -sSLO "$ASR/silero_vad.onnx"

[ -f res10.caffemodel ] || curl -sSL -o res10.caffemodel \
  https://raw.githubusercontent.com/opencv/opencv_3rdparty/dnn_samples_face_detector_20170830/res10_300x300_ssd_iter_140000.caffemodel
[ -f deploy.prototxt ] || curl -sSL -o deploy.prototxt \
  https://raw.githubusercontent.com/opencv/opencv/4.x/samples/dnn/face_detector/deploy.prototxt

echo "Modelos em $DEST"
