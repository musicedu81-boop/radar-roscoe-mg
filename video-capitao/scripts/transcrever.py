"""Transcreve a fala com tempo por palavra e gera as legendas do Remotion.

Pipeline 100% local:
  1. Silero VAD separa os trechos de fala.
  2. Parakeet TDT v3 (multilíngue, inclui português) dá palavras com tempo.
  3. Whisper small (pt) gera o texto de referência de cada trecho,
     usado para revisão manual de grafia.

Saídas:
  src/data/captions.json        (formato Caption do @remotion/captions)
  scripts/out/transcricao.txt   (texto do Whisper por trecho, para revisão)

Uso: python3 scripts/transcrever.py <audio_16k_mono.wav> <dir_modelos>
"""

import json
import os
import sys

import numpy as np
import sherpa_onnx
import soundfile as sf

SR = 16000


def load_models(models):
    p = f"{models}/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8"
    parakeet = sherpa_onnx.OfflineRecognizer.from_transducer(
        encoder=f"{p}/encoder.int8.onnx",
        decoder=f"{p}/decoder.int8.onnx",
        joiner=f"{p}/joiner.int8.onnx",
        tokens=f"{p}/tokens.txt",
        model_type="nemo_transducer",
        num_threads=4,
    )
    w = f"{models}/sherpa-onnx-whisper-small"
    whisper = sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=f"{w}/small-encoder.int8.onnx",
        decoder=f"{w}/small-decoder.int8.onnx",
        tokens=f"{w}/small-tokens.txt",
        language="pt",
        task="transcribe",
        num_threads=4,
    )
    return parakeet, whisper


def vad_segments(samples, models):
    cfg = sherpa_onnx.VadModelConfig()
    cfg.silero_vad.model = f"{models}/silero_vad.onnx"
    cfg.silero_vad.min_silence_duration = 0.3
    cfg.silero_vad.min_speech_duration = 0.2
    cfg.silero_vad.max_speech_duration = 12
    cfg.sample_rate = SR
    vad = sherpa_onnx.VoiceActivityDetector(cfg, buffer_size_in_seconds=600)
    win = cfg.silero_vad.window_size
    segs = []
    for i in range(0, len(samples), win):
        vad.accept_waveform(samples[i : i + win])
        while not vad.empty():
            segs.append((vad.front.start, np.array(vad.front.samples, dtype=np.float32)))
            vad.pop()
    vad.flush()
    while not vad.empty():
        segs.append((vad.front.start, np.array(vad.front.samples, dtype=np.float32)))
        vad.pop()
    return segs


def decode(rec, audio):
    s = rec.create_stream()
    s.accept_waveform(SR, audio)
    rec.decode_stream(s)
    return s.result


def words_from_tokens(tokens, stamps, offset, seg_end):
    words = []
    for tok, ts in zip(tokens, stamps):
        start_new = tok.startswith("▁") or tok.startswith(" ") or not words
        piece = tok.replace("▁", " ")
        if start_new:
            words.append({"text": piece.strip(), "start": offset + ts})
        else:
            words[-1]["text"] += piece
    for i, wd in enumerate(words):
        nxt = words[i + 1]["start"] if i + 1 < len(words) else seg_end
        wd["end"] = min(nxt, wd["start"] + 0.9)
    return [w for w in words if w["text"]]


def main(wav, models):
    samples, sr = sf.read(wav, dtype="float32")
    assert sr == SR, "o áudio precisa estar em 16 kHz mono"
    parakeet, whisper = load_models(models)
    segs = vad_segments(samples, models)

    captions = []
    lines = []
    for start, audio in segs:
        t0 = start / SR
        t1 = t0 + len(audio) / SR
        # Pequena margem para não cortar a primeira sílaba
        pad = int(0.15 * SR)
        a = max(0, start - pad)
        clip = samples[a : start + len(audio) + pad]
        off = a / SR
        res = decode(parakeet, clip)
        for wd in words_from_tokens(res.tokens, res.timestamps, off, t1 + 0.15):
            captions.append({
                "text": " " + wd["text"],
                "startMs": round(wd["start"] * 1000),
                "endMs": round(wd["end"] * 1000),
                "timestampMs": round((wd["start"] + wd["end"]) / 2 * 1000),
                "confidence": None,
            })
        ref = decode(whisper, clip).text.strip()
        lines.append(f"[{t0:6.2f} - {t1:6.2f}] PARAKEET: {res.text.strip()}\n                  WHISPER:  {ref}")

    os.makedirs("scripts/out", exist_ok=True)
    with open("src/data/captions.json", "w") as f:
        json.dump(captions, f, ensure_ascii=False, indent=1)
    with open("scripts/out/transcricao.txt", "w") as f:
        f.write("\n".join(lines) + "\n")
    print("\n".join(lines))
    print(f"\n{len(captions)} palavras em {len(segs)} trechos")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
