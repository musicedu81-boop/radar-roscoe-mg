"""Amostras de vozes do Gemini TTS para escolher o locutor antes de gerar a narração inteira.

Lê a direção de locução do roteiro (src/apresentacao/narracao-roteiro.json) e grava a mesma
passagem, com as pronúncias que importam ("Timótêo", "Kést"), em cada voz pedida.
Saída: out/amostras-voz/<voz>.m4a

Uso: python3 scripts/amostras-voz-gemini.py Puck Fenrir Orus Sadachbia
Chave em GEMINI_API_KEY (ou GOOGLE_API_KEY).
"""

import importlib.util
import json
import os
import subprocess
import sys

spec = importlib.util.spec_from_file_location("narracao", "scripts/gerar-narracao.py")
narracao = importlib.util.module_from_spec(spec)
spec.loader.exec_module(narracao)

PASSAGEM = (
    "Planejamento estratégico do Capitão Vítor Prado. "
    "Utilidade no momento crítico. Orgulho de Timótêo. Cuidado com gente. "
    "Quarta, Prefeito Kést ou Prefeito no Bairro, alternando a cada quinzena."
)


def main(vozes):
    voz = json.load(open("src/apresentacao/narracao-roteiro.json", encoding="utf-8"))["voz"]
    os.makedirs("out/amostras-voz", exist_ok=True)
    for nome in vozes:
        x, sr = narracao.falar_gemini(PASSAGEM, {**voz, "vozGemini": nome})
        x = narracao.nivelar(narracao.aparar(x, sr))
        saida = f"out/amostras-voz/{nome}.m4a"
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", "-",
             "-c:a", "aac", "-b:a", "128k", saida],
            input=x.tobytes(), check=True,
        )
        print(f"{nome:<14} {len(x) / sr:4.1f}s  ->  {saida}")


if __name__ == "__main__":
    main(sys.argv[1:] or ["Puck", "Fenrir", "Orus", "Sadachbia"])
