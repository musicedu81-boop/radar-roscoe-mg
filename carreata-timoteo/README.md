# Motion Grande Carreata da Vitória em Timóteo

10 segundos, vertical 1080x1920, 30fps, com batida de funk carioca original a 150 BPM. Nenhum elemento usa vermelho.

## Roteiro

| Tempo | Música | Imagem |
| --- | --- | --- |
| 0,0s | apito e prato | caminhão entra, título cai, glitch de abertura |
| 1,6s | berimbau entra | homens pulam alternados, bandeiras balançam |
| 4,8s | quebra: grave longo, palma e berimbau | os dois saltam juntos e mais alto, bandeiras abrem mais, feixes baixam |
| 6,4s | volta o groove com prato | glitch de retorno |
| 7,2s | sirene e virada | estroboscópio, tremor e glitch crescente |
| 8,0s | drop | glitch forte, clarão, vazamento de luz e explosão de confete |
| 9,6s | golpe final | salto, glitch e confete |

Durante todo o vídeo, o contorno dos personagens troca entre azul, amarelo e verde a cada tempo. O número 22 troca entre azul, branco e amarelo. As ondas sonoras saem do áudio real: espectro radial atrás das cabeças, osciloscópios e anéis nas torres.

## Como funciona

1. `scripts/separar-camadas.py` recorta o flyer (`scripts/flyer.jpg`) em camadas: título, os dois homens com máscaras de contorno e de número, bandeiras com mastro, caminhão sem vermelho, informações, faixa e assinatura. O fundo é preenchido por trás e as posições vão para `src/camadas.json`.
2. `scripts/compor-batida.py` compõe a batida e grava os eventos em `src/batida.json`: bumbo, palma, tamborzão, quebra, virada, sirene, drop, pratos e golpe final. Cada semicolcheia dura 0,1s, ou seja, 3 frames. A duração do vídeo vem desse arquivo.
3. `src/Carreata.tsx` anima tudo a partir desses mesmos eventos. O glitch (`src/Glitch.tsx`) é um único filtro SVG que fatia e desloca a imagem pronta e soma fantasmas azul e verde.

## Comandos

```bash
npm i
npm run camadas   # recorta o flyer (python3 + opencv-python-headless + scipy)
npm run batida    # compõe e masteriza a batida (-14 LUFS)
npm run studio    # pré-visualização
npm run render    # out/carreata-timoteo.mp4
```
