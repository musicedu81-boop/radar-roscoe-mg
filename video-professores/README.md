# Vídeo Dia dos Professores

## Fluxo de edição

1. Dependências: `pip install -r scripts/requirements.txt`, `npm ci` e `scripts/baixar-modelos.sh <dir_modelos>`.
2. Vídeo enviado em partes: `python3 scripts/juntar-partes.py <parte1> <parte2> [...] <video.mp4>`.
   Com ~1 s repetido entre as partes, o alinhamento é feito pelo áudio.
3. `scripts/preparar.sh <video> <dir_modelos>`: normaliza (corta a tela preta final do CapCut),
   transcreve, rastreia o rosto e gera trilha e efeitos.
4. Revise `scripts/out/transcricao.txt`, corrija `src/data/captions.json` e ajuste `src/Overlays.tsx`
   (título, zooms de ênfase e ícones, cada um no instante da palavra-chave).
5. `scripts/finalizar.sh`: renderiza e masteriza o MP4 em `out/`.

## Remotion

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Commands

**Install Dependencies**

```console
npm i --loglevel=error
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
