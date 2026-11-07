// Renderiza vários quadros de teste com um único bundle.
// Uso: node scripts/stills.mjs <saida_dir> <frame1> <frame2> ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [out, ...frames] = process.argv.slice(2);
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "TimoteoVox", browserExecutable, inputProps: { legendas: true } });
for (const fr of frames) {
  await renderStill({ composition, serveUrl, frame: Number(fr), output: path.join(out, `f${fr}.jpg`), imageFormat: "jpeg", jpegQuality: 80, scale: 0.5, browserExecutable, inputProps: { legendas: true } });
  process.stdout.write(fr + " ");
}
console.log("ok");
