# Motion Grande Carreata da Vitória em Timóteo

8 segundos, vertical 1080x1920, 30fps, com batida de funk carioca original a 150 BPM.

## Como funciona

1. `scripts/separar-camadas.py` recorta o flyer (`scripts/flyer.jpg`) em camadas: título, os dois homens, bandeiras, caminhão com a treliça vazada, informações, faixa e assinatura. O fundo é preenchido por trás e as posições vão para `src/camadas.json`.
2. `scripts/compor-batida.py` compõe a batida e grava os eventos (bumbo, palma, tamborzão, virada, pratos, golpe final) em `src/batida.json`. Cada semicolcheia dura 0,1s, ou seja, 3 frames.
3. `src/Carreata.tsx` anima tudo a partir desses mesmos eventos: os homens pulam alternados no tempo, o título balança, os woofers das torres bombeiam no bumbo, as bandeiras tremulam e o paredão novo da carreta pulsa com ondas de choque.

## Comandos

```bash
npm i
npm run camadas   # recorta o flyer (python3 + opencv-python-headless + scipy)
npm run batida    # compõe e masteriza a batida (-14 LUFS)
npm run studio    # pré-visualização
npm run render    # out/carreata-timoteo.mp4
```
