"""Baixa as fontes (subset latin, woff2) do Google Fonts para public/fonts e gera src/fonts.json."""
import json, os, re, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
FAM = {"Archivo": [500, 700, 800, 900], "Source Serif 4": [400, 600, 700], "IBM Plex Mono": [400, 500, 700], "Caveat": [600, 700], "Special Elite": [400], "Playfair Display": [700, 900], "Anton": [400]}
out = []
for fam, ws in FAM.items():
    q = fam.replace(" ", "+") + ":wght@" + ";".join(map(str, ws))
    css = subprocess.check_output(["curl", "-sS", "-A", UA, f"https://fonts.googleapis.com/css2?family={q}&display=swap"]).decode()
    for block in re.findall(r"/\* ([\w-]+) \*/\s*@font-face \{(.*?)\}", css, re.S):
        subset, body = block
        if subset != "latin":
            continue
        w = int(re.search(r"font-weight: (\d+)", body).group(1))
        url = re.search(r"url\((.*?)\)", body).group(1)
        rng = re.search(r"unicode-range: (.*?);", body).group(1)
        fn = f"{fam.replace(' ', '')}-{w}.woff2"
        subprocess.check_call(["curl", "-sS", "-o", os.path.join(ROOT, "public", "fonts", fn), url])
        out.append({"family": fam, "weight": str(w), "file": f"fonts/{fn}", "unicodeRange": rng})
json.dump(out, open(os.path.join(ROOT, "src", "data", "fonts.json"), "w"), indent=1)
print(len(out), "arquivos")
