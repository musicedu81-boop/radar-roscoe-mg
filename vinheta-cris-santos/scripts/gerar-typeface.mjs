// Converte a Montserrat (WOFF) em typeface JSON para o TextGeometry do three.js.
// Uso: node scripts/gerar-typeface.mjs
import fs from 'node:fs';
import opentype from 'opentype.js';

const PESOS = [500, 900];
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÂÊÔÃÕÇÀabcdefghijklmnopqrstuvwxyzáéíóúâêôãõçà&“”"\'.,!?- ';

for (const peso of PESOS) {
  const buf = fs.readFileSync(`node_modules/@fontsource/montserrat/files/montserrat-latin-${peso}-normal.woff`);
  const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const escala = 1000 / font.unitsPerEm;
  const r = (v) => Math.round(v * escala);
  const glyphs = {};
  for (const ch of new Set(CHARS)) {
    const g = font.charToGlyph(ch);
    if (!g || g.index === 0) {
      console.warn(`sem glifo: ${ch}`);
      continue;
    }
    const bb = g.getBoundingBox();
    let o = '';
    for (const c of g.path.commands) {
      const t = c.type === 'C' ? 'b' : c.type.toLowerCase();
      o += t + ' ';
      if (c.x !== undefined) o += `${r(c.x)} ${r(c.y)} `;
      if (c.x1 !== undefined) o += `${r(c.x1)} ${r(c.y1)} `;
      if (c.x2 !== undefined) o += `${r(c.x2)} ${r(c.y2)} `;
    }
    glyphs[ch] = {ha: r(g.advanceWidth), x_min: r(bb.x1), x_max: r(bb.x2), o: o.trim()};
  }
  const json = {
    glyphs,
    familyName: 'Montserrat',
    ascender: r(font.ascender),
    descender: r(font.descender),
    underlinePosition: r(font.tables.post.underlinePosition),
    underlineThickness: r(font.tables.post.underlineThickness),
    boundingBox: {xMin: r(font.tables.head.xMin), yMin: r(font.tables.head.yMin), xMax: r(font.tables.head.xMax), yMax: r(font.tables.head.yMax)},
    resolution: 1000,
    capHeight: r(font.tables.os2.sCapHeight),
    cssFontWeight: String(peso),
    cssFontStyle: 'normal',
  };
  fs.writeFileSync(`public/fonts/montserrat-${peso}.typeface.json`, JSON.stringify(json));
  console.log(peso, Object.keys(glyphs).length, 'glifos', 'capHeight', json.capHeight, 'Ú', glyphs['Ú'].ha);
}
