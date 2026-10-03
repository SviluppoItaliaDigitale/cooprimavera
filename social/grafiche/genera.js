// Genera le grafiche dei post social (1080x1350, JPEG) da social/calendario.json.
// Uso, dalla radice del repository: node social/grafiche/genera.js [AAAA-MM-GG ...]
// Scrive in static/social/<file>. Regole: logo sempre sulla fascia chiara in basso,
// mai su fondo scuro; foto vostre o gratuite (Pexels/Pixabay); caratteri Barlow (OFL) locali.
const fs = require('fs'), path = require('path');
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }
const R = path.resolve(__dirname, '../..'), F = p => 'file://' + path.join(R, p);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const FONT = [['Barlow', 400, 'Barlow-400'], ['Barlow', 600, 'Barlow-600'], ['Barlow Condensed', 600, 'BarlowCondensed-600'], ['Barlow Condensed', 800, 'BarlowCondensed-800']]
  .map(([f, w, n]) => `@font-face{font-family:'${f}';font-weight:${w};src:url('${F('social/grafiche/font/' + n + '.woff2')}') format('woff2')}`).join('');
const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
:root{--verde:#9fc63d;--scuro:#627c26;--inchiostro:#232a1c;--carta:#fbfcf6;--chiaro:#c8e07e;--fondo:#f4f8e8}
body{width:1080px;height:1350px;overflow:hidden;font-family:Barlow,Arial,sans-serif;background:var(--carta)}
.tela{position:relative;width:1080px;height:1350px}
.piede{position:absolute;left:0;right:0;bottom:0;height:170px;background:var(--carta);display:flex;align-items:center;justify-content:space-between;padding:0 64px;border-top:6px solid var(--verde)}
.piede img{height:80px;width:auto}
.piede span{font-weight:600;font-size:28px;color:var(--inchiostro);letter-spacing:.01em}
h1{font-family:'Barlow Condensed',Arial Narrow,sans-serif;font-weight:800;line-height:.95;letter-spacing:-.01em;text-wrap:balance}
.cartello{display:inline-flex;font-family:'Barlow Condensed',sans-serif;font-weight:600;font-size:34px}
.cartello b{background:var(--verde);color:var(--inchiostro);padding:8px 18px;font-weight:600}
.cartello i{font-style:normal;background:var(--inchiostro);color:#fff;padding:8px 18px}
/* foto */
.f .ph{position:absolute;inset:0 0 170px 0;background-size:cover;background-position:center}
.f .cart{position:absolute;top:56px;left:56px}
.f .pann{position:absolute;left:0;right:0;bottom:170px;background:var(--inchiostro);padding:44px 64px 50px}
.f h1{color:#fff;font-size:104px}
.f p{color:var(--chiaro);font-size:38px;font-weight:600;margin-top:16px}
/* anno */
.a{background:var(--inchiostro)}
.a .stampa{position:absolute;top:70px;right:60px;width:640px;background:#fff;padding:16px 16px 54px;transform:rotate(2.2deg);box-shadow:0 18px 40px rgba(0,0,0,.45)}
.a .stampa div{width:100%;height:470px;background-size:cover;background-position:center}
.a .stampa em{position:absolute;right:22px;bottom:12px;font:600 26px ui-monospace,Menlo,Consolas,monospace;color:var(--inchiostro);font-style:normal}
.a .cart{position:absolute;top:70px;left:56px}
.a .anno{position:absolute;left:52px;top:600px;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:230px;line-height:1;color:transparent;-webkit-text-stroke:4px var(--verde);letter-spacing:-.02em;white-space:nowrap}
.a h1{position:absolute;left:60px;right:60px;top:870px;color:#fff;font-size:100px}
.a p{position:absolute;left:62px;bottom:178px;color:var(--chiaro);font-size:34px;font-weight:600}
/* testo */
.t{background:var(--fondo)}
.t .cart{position:absolute;top:70px;left:64px}
.t h1{position:absolute;left:64px;right:64px;top:170px;color:var(--inchiostro);font-size:150px}
.t ul{position:absolute;left:64px;right:64px;top:560px;list-style:none;border-top:3px solid var(--inchiostro)}
.t li{font-size:46px;font-weight:600;color:var(--inchiostro);padding:26px 0;border-bottom:2px dashed #b9c79a;display:flex;gap:24px;align-items:center}
.t li::before{content:"";width:18px;height:18px;background:var(--verde);flex:none}
.t .url{position:absolute;left:64px;bottom:186px;font-size:38px;font-weight:600;color:var(--scuro)}
.g{background:var(--inchiostro)}
.g .fiore{position:absolute;right:-90px;top:-10px;width:640px}
.g .cart{position:absolute;top:70px;left:56px}
.g h1{position:absolute;left:60px;right:60px;top:700px;color:#fff;font-size:200px}
.g p{position:absolute;left:62px;top:1010px;color:var(--chiaro);font-size:46px;font-weight:600}
/* bozza */
.b .vuoto{position:absolute;inset:40px 40px 400px 40px;border:6px dashed #9aa58a;display:flex;align-items:center;justify-content:center;text-align:center;padding:60px;font:600 46px Barlow,sans-serif;color:#5c6357;background:#eef1e6}
`;
function pagina(p) {
  const g = p.grafica;
  const piede = `<div class="piede"><img src="${F('assets/img/logo.png')}" alt=""><span>cooprimavera.com · 06 63 46 70</span></div>`;
  const cart = `<div class="cartello cart"><b>${esc(g.tema)}</b></div>`;
  let corpo;
  if (g.tipo === 'foto') corpo = `<div class="tela f"><div class="ph" style="background-image:url('${F(g.foto)}')"></div>${cart}<div class="pann"><h1>${esc(g.titolo)}</h1><p>${esc(g.sotto)}</p></div>${piede}</div>`;
  else if (g.tipo === 'anno') corpo = `<div class="tela a"><div class="stampa"><div style="background-image:url('${F(g.foto)}')"></div><em>${g.anno}</em></div>${cart}<div class="anno" style="font-size:${g.anno.length <= 4 ? 230 : 168}px">${g.anno}</div><h1>${esc(g.titolo)}</h1><p>${esc(g.sotto)}</p>${piede}</div>`;
  else corpo = `<div class="tela t">${cart}<h1>${esc(g.titolo)}</h1><ul>${g.righe.map(r => `<li>${esc(r)}</li>`).join('')}</ul><div class="url">cooprimavera.com${p.pagina_sito}</div>${piede}</div>`;
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><style>${FONT}${CSS}</style></head><body>${corpo}</body></html>`;
}
(async () => {
  const solo = process.argv.slice(2);
  const cal = JSON.parse(fs.readFileSync(path.join(R, 'social/calendario.json'), 'utf8')).post.filter(p => !solo.length || solo.includes(p.data));
  const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  const tmp = path.join(require('os').tmpdir(), 'grafica-social.html');
  for (const p of cal) {
    fs.writeFileSync(tmp, pagina(p)); await pg.goto('file://' + tmp, { waitUntil: 'networkidle' }); await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: path.join(R, 'static/social', p.file), type: 'jpeg', quality: 86 }); console.log('ok', p.file);
  }
  await b.close();
})();
