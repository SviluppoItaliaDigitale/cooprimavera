// Genera le grafiche dei post social (1080x1350, JPEG) da social/calendario.json.
// Uso, dalla radice del repository: node social/grafiche/genera.js [AAAA-MM-GG ...]
//   senza date: solo i post non ancora pubblicati (data e ora del calendario, ora italiana); quelli già usciti non si toccano.
//   node social/grafiche/genera.js --cornice FILE.jpg [...] [--anno AAAA]: aggiunge la cornice a un JPEG già fatto
//   (per esempio una copertina o una grafica preparata in altro modo); si ferma se ai bordi c'è un disegno o una scritta.
// Scrive in static/social/<file> e la miniatura 432x540 per gli elenchi del sito in static/social/mini/<file>. Regole: logo sempre sulla fascia chiara in basso,
// mai su fondo scuro; foto vostre o gratuite (Pexels/Pixabay); caratteri Barlow (OFL) locali.
// Cornice di microtesto (dal 21/10/2026, social/grafiche/cornice.js): ogni grafica esce con la provenienza scritta in piccolo
// lungo i bordi e con un segno nel file; foto e riquadri stanno a 20 px dai bordi, e il generatore si ferma se una scritta,
// il logo o una foto entrano nella fascia della cornice. Alla fine controlla il segno con scripts/controlla-cornice.py.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }
const R = path.resolve(__dirname, '../..'), F = p => 'file://' + path.join(R, p);
const CORNICE = fs.readFileSync(path.join(__dirname, 'cornice.js'), 'utf8');
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
/* foto: foto e pannello a 20 px dai bordi, come una stampa con il margine; nel margine corre la cornice di microtesto */
.f .ph{position:absolute;inset:20px 20px 170px 20px;background-size:cover;background-position:center}
.f .cart{position:absolute;top:56px;left:56px}
.f .pann{position:absolute;left:20px;right:20px;bottom:170px;background:var(--inchiostro);padding:44px 44px 50px}
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
/* consiglio del martedì: numero grande in contorno, passi numerati, chiusa */
.c{background:var(--fondo)}
.c .cart{position:absolute;top:70px;left:64px}
.c .num{position:absolute;right:56px;top:36px;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:250px;line-height:1;color:transparent;-webkit-text-stroke:4px var(--verde)}
.c h1{position:absolute;left:64px;right:64px;top:300px;color:var(--inchiostro);font-size:104px}
.c ol{position:absolute;left:64px;right:64px;top:560px;list-style:none;counter-reset:n;border-top:3px solid var(--inchiostro)}
.c li{counter-increment:n;position:relative;font-size:45px;line-height:1.15;font-weight:600;color:var(--inchiostro);padding:28px 0 28px 96px;border-bottom:2px dashed #b9c79a}
.c li::before{content:counter(n);position:absolute;left:0;top:24px;width:66px;height:66px;border-radius:50%;background:var(--inchiostro);color:#fff;font:800 40px/66px 'Barlow Condensed',sans-serif;text-align:center}
.c .chiusa{position:absolute;left:64px;right:64px;bottom:200px;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:56px;color:var(--scuro)}
/* consiglio con foto: foto in alto (a 20 px dai bordi, per la cornice), numero su blocco scuro, passi sotto */
.cf .ph{position:absolute;left:20px;right:20px;top:20px;height:430px;background-size:cover;background-position:center}
.cf .cart{top:56px;left:56px}
.cf .num{top:auto;bottom:auto;top:362px;right:56px;font-size:118px;color:var(--verde);-webkit-text-stroke:0;background:var(--inchiostro);padding:6px 26px 2px}
.cf h1{top:490px;font-size:92px}
.cf ol{top:700px}
.cf li{font-size:41px;padding:22px 0 22px 90px}
.cf li::before{top:18px;width:62px;height:62px;font:800 38px/62px 'Barlow Condensed',sans-serif}
.cf .chiusa{bottom:192px;font-size:50px}
/* bozza */
.b .vuoto{position:absolute;inset:40px 40px 400px 40px;border:6px dashed #9aa58a;display:flex;align-items:center;justify-content:center;text-align:center;padding:60px;font:600 46px Barlow,sans-serif;color:#5c6357;background:#eef1e6}
`;
function pagina(p) {
  const g = p.grafica;
  const piede = `<div class="piede"><img src="${F('assets/img/logo.png')}" alt=""><span>cooprimavera.com · 06 63 46 70</span></div>`;
  const cart = `<div class="cartello cart"><b>${esc(g.tema)}</b></div>`;
  let corpo;
  // Grafiche «anno»: sulla stampa va il periodo della foto, di norma uguale ad «anno». Con «anno_stampa» si scrive
  // altro; vuoto, la stampa resta senza scritta (fine anno 2026 con una foto del 2020: niente «2026» sulla foto).
  const stampa = g.anno_stampa ?? g.anno;
  if (g.tipo === 'foto') corpo = `<div class="tela f"><div class="ph" style="background-image:url('${F(g.foto)}')"></div>${cart}<div class="pann"><h1>${esc(g.titolo)}</h1><p>${esc(g.sotto)}</p></div>${piede}</div>`;
  else if (g.tipo === 'anno') corpo = `<div class="tela a"><div class="stampa"><div style="background-image:url('${F(g.foto)}')"></div>${stampa ? `<em>${esc(stampa)}</em>` : ''}</div>${cart}<div class="anno" style="font-size:${g.anno.length <= 4 ? 230 : 168}px">${g.anno}</div><h1>${esc(g.titolo)}</h1><p>${esc(g.sotto)}</p>${piede}</div>`;
  else if (g.tipo === 'consiglio') corpo = `<div class="tela c${g.foto ? ' cf' : ''}">${g.foto ? `<div class="ph" style="background-image:url('${F(g.foto)}');background-position:${g.fuoco || 'center'}"></div>` : ''}<div class="cartello cart"><b>${esc(g.tema)}</b></div><div class="num">${esc(g.numero)}</div><h1>${esc(g.titolo)}</h1><ol>${g.righe.map(r => `<li>${esc(r)}</li>`).join('')}</ol><div class="chiusa">${esc(g.chiusa || 'Non hai tempo? Ci pensiamo noi.')}</div>${piede}</div>`;
  else corpo = `<div class="tela t">${cart}<h1>${esc(g.titolo)}</h1><ul>${g.righe.map(r => `<li>${esc(r)}</li>`).join('')}</ul><div class="url">cooprimavera.com${p.pagina_sito}</div>${piede}</div>`;
  // Consiglio con foto e titolo su una riga sola: la foto si allunga e il titolo scende fino ai passi,
  // così non resta un vuoto fra titolo e lista (stessa distanza dei titoli su due righe).
  const ritocco = `<script>document.fonts.ready.then(()=>{const t=document.querySelector('.cf');if(!t)return;
    const h=t.querySelector('h1'),o=t.querySelector('ol'),d=Math.round(o.offsetTop-36-(h.offsetTop+h.offsetHeight));if(d<20)return;
    const s=(e,p,v)=>e.style[p]=(parseFloat(getComputedStyle(e)[p])+v)+'px';
    s(t.querySelector('.ph'),'height',d);s(t.querySelector('.num'),'top',d);s(h,'top',d);});
    // Grafica solo testo con titolo corto: il titolo scende verso l'elenco invece di lasciare un vuoto in mezzo.
    document.fonts.ready.then(()=>{const t=document.querySelector('.t');if(!t)return;
    const h=t.querySelector('h1'),u=t.querySelector('ul'),d=Math.round(u.offsetTop-105-(h.offsetTop+h.offsetHeight));if(d<20)return;
    h.style.top=(h.offsetTop+d)+'px';});</script>`;
  return `<!doctype html><html lang="it"><head><meta charset="utf-8"><style>${FONT}${CSS}</style></head><body>${corpo}${ritocco}<script>${CORNICE}</script></body></html>`;
}
// Data e ora di adesso in Italia, nella forma «AAAA-MM-GG HH:MM» (si confronta come testo con data e ora del calendario).
const adessoRoma = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
const daUscire = p => `${p.data} ${p.ora || '09:00'}` > adessoRoma();
const dati = s => Buffer.from(s.slice(s.indexOf(',') + 1), 'base64');

// Cornice su JPEG già fatti, in place. Salta i file che hanno già il segno (mai due cornici sulla stessa grafica).
async function soloCornice(b, file, anno) {
  const pg = await b.newPage(), tmp = path.join(require('os').tmpdir(), 'cornice-social.html');
  fs.writeFileSync(tmp, `<!doctype html><meta charset="utf-8"><style>${FONT}</style><body><script>${CORNICE}</script>`);
  await pg.goto('file://' + tmp);
  for (const f of file) {
    const buf = fs.readFileSync(f), segno = await pg.evaluate(() => window.MARCATORE_CORNICE);
    if (buf.includes(Buffer.from(segno))) { console.log('ha già la cornice:', f); continue; }
    const src = 'data:image/jpeg;base64,' + buf.toString('base64');
    const bordi = await pg.evaluate(s => window.zonaLibera(s), src);
    if (bordi.length) throw new Error(`${f}: ai bordi ci sono scritte, disegni o foto, la cornice li coprirebbe (${bordi.join('; ')})`);
    const r = await pg.evaluate(([s, a]) => window.corniceCooprimavera(s, { anno: a, qualita: 0.88 }), [src, anno]);
    fs.writeFileSync(f, dati(r.dati)); console.log('cornice:', f);
  }
  await pg.close();
}

(async () => {
  const arg = process.argv.slice(2), b = await chromium.launch();
  try {
    if (arg[0] === '--cornice') {
      const i = arg.indexOf('--anno'), anno = i > 0 ? arg[i + 1] : String(new Date().getFullYear());
      await soloCornice(b, arg.slice(1).filter((x, k) => x !== '--anno' && k !== i), anno);
      return;
    }
    const tutti = JSON.parse(fs.readFileSync(path.join(R, 'social/calendario.json'), 'utf8')).post;
    const cal = arg.length ? tutti.filter(p => arg.includes(p.data)) : tutti.filter(daUscire);
    for (const p of cal) if (!daUscire(p)) console.log(`attenzione: il post del ${p.data} è già uscito; lo rifaccio solo perché chiesto`);
    const pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
    fs.mkdirSync(path.join(R, 'static/social/mini'), { recursive: true });
    const tmp = path.join(require('os').tmpdir(), 'grafica-social.html');
    for (const p of cal) {
      fs.writeFileSync(tmp, pagina(p)); await pg.goto('file://' + tmp, { waitUntil: 'networkidle' }); await pg.evaluate(() => document.fonts.ready);
      await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));   // dopo i ritocchi
      const bordi = await pg.evaluate(() => window.bordiOccupati());
      if (bordi.length) throw new Error(`${p.file}: la cornice toccherebbe ${bordi.map(x => `${x.nome} (${x.lati.join(', ')})`).join('; ')}`);
      const png = await pg.screenshot({ type: 'png' });
      const r = await pg.evaluate(([s, a]) => window.corniceCooprimavera(s, { anno: a, qualita: 0.86, mini: [432, 540], qualitaMini: 0.82 }),
        ['data:image/png;base64,' + png.toString('base64'), p.data.slice(0, 4)]);
      fs.writeFileSync(path.join(R, 'static/social', p.file), dati(r.dati));
      fs.writeFileSync(path.join(R, 'static/social/mini', p.file), dati(r.mini)); console.log('ok', p.file);
    }
  } finally { await b.close(); }
  execFileSync('python3', [path.join(R, 'scripts/controlla-cornice.py'), '--solo-segno'], { stdio: 'inherit' });
})().catch(e => { console.error(e.message || e); process.exit(1); });
