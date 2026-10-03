// Genera i video verticali (Reel 1080x1920, MP4) dei servizi da social/video/<nome>.json.
// Uso, dalla radice del repository: node social/video/genera.js [nome ...]  (senza nomi: tutti)
// Scrive static/social/video/<nome>.mp4 e <nome>.jpg (copertina). Serve ffmpeg.
// Scene: parole, foto (archivio), disegno (SVG di social/disegni/ che si traccia da solo), fine.
// Regole: logo sempre sulla fascia chiara in basso, sopra l'area coperta dai pulsanti dei Reel.
const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); }
const R = path.resolve(__dirname, '../..'), F = p => 'file://' + path.join(R, p), FPS = 30, DISS = 0.35;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const FONT = [['Barlow', 600, 'Barlow-600'], ['Barlow Condensed', 600, 'BarlowCondensed-600'], ['Barlow Condensed', 800, 'BarlowCondensed-800']]
  .map(([f, w, n]) => `@font-face{font-family:'${f}';font-weight:${w};src:url('${F('social/grafiche/font/' + n + '.woff2')}')}`).join('');
const CSS = `${FONT}
*{margin:0;padding:0;box-sizing:border-box}
:root{--verde:#9fc63d;--inchiostro:#232a1c;--carta:#fbfcf6;--chiaro:#c8e07e;--fondo:#f4f8e8}
body{width:1080px;height:1920px;overflow:hidden;background:var(--inchiostro);font-family:Barlow,sans-serif}
.cart{position:absolute;top:210px;left:64px;font:600 40px 'Barlow Condensed';background:var(--verde);color:var(--inchiostro);padding:8px 20px}
.sc{position:absolute;inset:0;opacity:0}
h1{position:absolute;left:64px;right:64px;top:300px;font:800 112px/.95 'Barlow Condensed';color:#fff}
.stampa{position:absolute;left:60px;top:560px;width:960px;background:#fff;padding:18px 18px 70px;box-shadow:0 20px 44px rgba(0,0,0,.5)}
.stampa .ph{height:640px;overflow:hidden}.stampa .ph div{width:100%;height:100%;background-size:cover;background-position:center}
.stampa em{position:absolute;left:24px;bottom:16px;font:600 32px 'Barlow Condensed';color:var(--inchiostro);font-style:normal}
.anno{position:absolute;left:58px;top:1290px;font:800 170px/1 'Barlow Condensed';color:transparent;-webkit-text-stroke:4px var(--verde)}
.cosa{position:absolute;left:470px;right:60px;top:1316px;font:600 40px/1.15 Barlow;color:var(--chiaro)}
.tavola{position:absolute;left:60px;top:450px;width:960px;height:800px;background:var(--fondo);border:4px solid var(--inchiostro);box-shadow:12px 12px 0 var(--verde)}
.tavola svg{width:100%;height:100%}
.didas{position:absolute;left:64px;right:64px;top:1300px;height:170px}
.didas p{position:absolute;inset:0;font:600 50px/1.12 Barlow;color:var(--chiaro);opacity:0}
.disegno h1{top:290px;font-size:104px}
.big{position:absolute;left:64px;right:64px;top:600px;font:800 150px/.93 'Barlow Condensed';color:#fff}
.big span{display:block}
.fine-t{position:absolute;left:64px;right:64px;top:1060px;font:600 48px/1.3 Barlow;color:var(--chiaro)}
.piede{position:absolute;left:0;right:0;top:1500px;bottom:0;background:var(--carta);border-top:8px solid var(--verde);padding:56px 64px 0}
.piede img{height:120px}.piede p{font:600 40px Barlow;color:var(--inchiostro);margin-top:26px}`;

function scena(s, i) {
  const h = s.titolo ? `<h1>${esc(s.titolo)}</h1>` : '';
  if (s.tipo === 'parole' || s.tipo === 'fine')
    return `<div class="sc ${s.tipo}" id="s${i}"><div class="big">${s.parole.map(w => `<span>${esc(w)}</span>`).join('')}</div>${s.testo ? `<div class="fine-t">${s.testo.map(esc).join('<br>')}</div>` : ''}</div>`;
  if (s.tipo === 'foto')
    return `<div class="sc foto" id="s${i}">${h}<div class="stampa"><div class="ph"><div style="background-image:url('${F(s.foto)}')"></div></div><em>${esc(s.dove)}</em></div><div class="anno">${esc(s.anno)}</div><div class="cosa">${esc(s.cosa)}</div></div>`;
  if (s.tipo === 'disegno')
    return `<div class="sc disegno" id="s${i}">${h}<div class="tavola">${fs.readFileSync(path.join(R, s.disegno), 'utf8')}</div><div class="didas">${s.didascalie.map(d => `<p data-t="${d.t}">${esc(d.testo)}</p>`).join('')}</div></div>`;
  throw new Error('tipo di scena sconosciuto: ' + s.tipo);
}

// In pagina: frame(t) disegna lo stato esatto al tempo t (niente animazioni CSS, così ogni fotogramma è ripetibile).
function motore() {
  const cl = x => Math.max(0, Math.min(1, x)), ease = x => 1 - Math.pow(1 - cl(x), 3);
  const sc = [...document.querySelectorAll('.sc')];
  let t0 = 0; sc.forEach(e => { e.t0 = t0; t0 += +e.dataset.d; });
  window.T = t0;
  document.querySelectorAll('.disegno .d').forEach(p => { const L = p.getTotalLength(); p.L = L; p.style.strokeDasharray = L; });
  window.frame = t => sc.forEach((e, i) => {
    const a = t - e.t0, D = +e.dataset.d, primo = i === 0, ultimo = i === sc.length - 1;
    e.style.opacity = a < 0 || a > D ? 0 : Math.min(primo ? 1 : cl(a / DISS), ultimo ? 1 : cl((D - a) / DISS));
    if (e.style.opacity == 0) return;
    e.querySelectorAll('.big span').forEach((w, k) => { const p = ease((a - .2 - k * .42) / .5); w.style.opacity = p; w.style.transform = `translateY(${40 * (1 - p)}px)`; });
    const ft = e.querySelector('.fine-t'); if (ft) ft.style.opacity = ease((a - .9) / .6);
    const st = e.querySelector('.stampa');
    if (st) { const p = ease(a / .7), v = i % 2 ? -1 : 1; st.style.transform = `translateX(${v * 120 * (1 - p)}px) rotate(${v * 1.6 * p}deg)`;
      e.querySelector('.ph div').style.transform = `scale(${1.02 + .1 * cl(a / D)})`;
      const y = ease((a - .3) / .6), an = e.querySelector('.anno'); an.style.opacity = y; an.style.transform = `translateY(${30 * (1 - y)}px)`;
      e.querySelector('.cosa').style.opacity = ease((a - .55) / .6); }
    // disegno: .d si traccia da data-t in data-v secondi; .f compare; .via sparisce; .muovi scorre di data-dx,data-dy tra data-t e data-t1
    e.querySelectorAll('.d').forEach(p => { p.style.strokeDashoffset = p.L * (1 - ease((a - +p.dataset.t) / +(p.dataset.v || .7))); });
    e.querySelectorAll('.f').forEach(p => { p.style.opacity = ease((a - +p.dataset.t) / .35); });
    e.querySelectorAll('.via').forEach(p => { p.style.opacity = 1 - cl((a - +p.dataset.t) / .25); });
    e.querySelectorAll('.muovi').forEach(p => { const k = cl((a - +p.dataset.t) / (+p.dataset.t1 - +p.dataset.t)), s = k * k * (3 - 2 * k);
      p.setAttribute('transform', `translate(${(+p.dataset.dx || 0) * s} ${(+p.dataset.dy || 0) * s})`); });
    const ps = [...e.querySelectorAll('.didas p')];
    ps.forEach((p, k) => { const nx = ps[k + 1] ? +ps[k + 1].dataset.t : 1e9, x = a - +p.dataset.t;
      p.style.opacity = Math.min(ease(x / .35), cl((nx - a) / .25)); p.style.transform = `translateY(${16 * (1 - ease(x / .35))}px)`; });
  });
}

async function genera(br, nome) {
  const c = JSON.parse(fs.readFileSync(path.join(__dirname, nome + '.json'), 'utf8'));
  const html = `<!doctype html><meta charset=utf-8><style>${CSS}</style><body><div class="cart">${esc(c.tema)}</div>
${c.scene.map((s, i) => scena(s, i).replace('class="sc', `data-d="${s.durata}" class="sc`)).join('\n')}
<div class="piede"><img src="${F('assets/img/logo.png')}" alt=""><p>cooprimavera.com · 06 63 46 70</p></div>
<script>const DISS=${DISS};(${motore})()</script>`;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'video-'));
  fs.writeFileSync(path.join(tmp, 'v.html'), html);
  const pg = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  await pg.goto('file://' + path.join(tmp, 'v.html')); await pg.evaluate(() => document.fonts.ready);
  const T = await pg.evaluate(() => window.T), n = Math.round(T * FPS), out = path.join(R, 'static/social/video');
  fs.mkdirSync(out, { recursive: true });
  for (let k = 0; k < n; k++) {
    await pg.evaluate(t => window.frame(t), k / FPS);
    await pg.screenshot({ path: path.join(tmp, String(k).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 92 });
  }
  await pg.evaluate(t => window.frame(t), c.copertina ?? T / 2);
  await pg.screenshot({ path: path.join(out, nome + '.jpg'), type: 'jpeg', quality: 88 });
  await pg.close();
  // Traccia audio muta: alcuni lettori e Instagram preferiscono un video con audio.
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, '%05d.jpg'),
    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-crf', '21', '-r', String(FPS), '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '96k', path.join(out, nome + '.mp4')]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('ok', nome + '.mp4', T.toFixed(1) + ' s');
}

(async () => {
  const nomi = process.argv.slice(2).length ? process.argv.slice(2)
    : fs.readdirSync(__dirname).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5));
  const br = await chromium.launch();
  try { for (const n of nomi) await genera(br, n); } finally { await br.close(); }
})();
