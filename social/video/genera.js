// Genera i video verticali (Reel 1080x1920, MP4) dei servizi da social/video/<nome>.json.
// Uso, dalla radice del repository: node social/video/genera.js [nome ...]  (senza nomi: tutti)
// Scrive static/social/video/<nome>.mp4 e <nome>.jpg (copertina). Servono ffmpeg e, per la voce,
// social/video/voce.py (Kokoro): VOCE_PY = python con kokoro-onnx, VOCE_MODELLI = cartella dei modelli.
// Scene: parole, foto (archivio), disegno (SVG di social/disegni/ che si traccia da solo), clip (video gratuito), fine.
// Ogni scena può avere "voce" (o voci sulle didascalie): la scena si allunga quanto serve alla voce.
// Con "voci": ["if_sara", "im_nicola"] le scene si alternano tra le due voci.
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
.clip{position:absolute;left:60px;top:450px;width:960px;height:800px;border:4px solid var(--inchiostro);box-shadow:12px 12px 0 var(--verde);overflow:hidden;background:#000}
.clip img{width:100%;height:100%;display:block}
.crediti{position:absolute;left:64px;right:64px;top:1490px;font:400 15px/1.2 Barlow;color:#5c6650}
.piede{position:absolute;left:0;right:0;top:1530px;height:230px;background:var(--fondo);border-top:6px solid var(--verde);padding:26px 56px 0;display:grid;grid-template-columns:auto 1fr;column-gap:40px;align-items:center}
.piede img{height:76px}
.piede .tel{font:600 30px/1.3 Barlow;color:var(--inchiostro)}.piede .tel b{font-weight:600;color:#3f5418}
.piede .web{grid-column:1/3;font:600 30px Barlow;color:var(--inchiostro);margin-top:16px;padding-top:12px;border-top:2px dashed #b9c79a}`;

function scena(s, i, c) {
  const h = s.titolo ? `<h1>${esc(s.titolo)}</h1>` : '';
  if (s.tipo === 'parole' || s.tipo === 'fine')
    return `<div class="sc ${s.tipo}" id="s${i}"><div class="big">${s.parole.map(w => `<span>${esc(w)}</span>`).join('')}</div>${s.testo ? `<div class="fine-t">${s.testo.map(esc).join('<br>')}</div>` : ''}${s.tipo === 'fine' && c.musica ? `<div class="crediti">Musica: «${esc(c.musica.titolo)}», Kevin MacLeod (incompetech.com), licenza CC BY 4.0</div>` : ''}</div>`;
  if (s.tipo === 'foto')
    return `<div class="sc foto" id="s${i}">${h}<div class="stampa"><div class="ph"><div style="background-image:url('file://${s.fotoMigliore}')"></div></div><em>${esc(s.dove)}</em></div><div class="anno">${esc(s.anno)}</div><div class="cosa">${esc(s.cosa)}</div></div>`;
  if (s.tipo === 'disegno')
    return `<div class="sc disegno" id="s${i}">${h}<div class="tavola">${fs.readFileSync(path.join(R, s.disegno), 'utf8')}</div><div class="didas">${s.didascalie.map(d => `<p data-t="${d.t}">${esc(d.testo)}</p>`).join('')}</div></div>`;
  if (s.tipo === 'clip')
    return `<div class="sc clip-sc" id="s${i}">${h}<div class="clip"><img data-cartella="${s.cartella}" data-n="${s.n}" alt=""></div><div class="didas">${(s.didascalie || []).map(d => `<p data-t="${d.t}">${esc(d.testo)}</p>`).join('')}</div></div>`;
  throw new Error('tipo di scena sconosciuto: ' + s.tipo);
}

// In pagina: frame(t) disegna lo stato esatto al tempo t (niente animazioni CSS, così ogni fotogramma è ripetibile).
function motore() {
  const cl = x => Math.max(0, Math.min(1, x)), ease = x => 1 - Math.pow(1 - cl(x), 3);
  const sc = [...document.querySelectorAll('.sc')];
  let t0 = 0; sc.forEach(e => { e.t0 = t0; t0 += +e.dataset.d; e.w = JSON.parse(e.dataset.w || '[[0,0]]'); });
  // tempo della scena (allungata per la voce) -> tempo originale delle animazioni
  const warp = (w, a) => { let k = 0; while (k + 1 < w.length && a >= w[k + 1][0]) k++;
    if (k + 1 < w.length) { const [x0, y0] = w[k], [x1, y1] = w[k + 1]; return y0 + (a - x0) * (y1 - y0) / (x1 - x0); }
    return w[k][1] + (a - w[k][0]); };
  window.T = t0;
  document.querySelectorAll('.disegno .d').forEach(p => { const L = p.getTotalLength(); p.L = L; p.style.strokeDasharray = L; });
  window.frame = t => Promise.all(sc.map((e, i) => {
    const r = t - e.t0, D = +e.dataset.d, primo = i === 0, ultimo = i === sc.length - 1, a = warp(e.w, r);
    e.style.opacity = r < 0 || r > D ? 0 : Math.min(primo ? 1 : cl(r / DISS), ultimo ? 1 : cl((D - r) / DISS));
    if (e.style.opacity == 0) return;
    const im = e.querySelector('.clip img');
    if (im) { const k = Math.min(+im.dataset.n, Math.max(1, Math.floor(r * 30) + 1));
      const src = `file://${im.dataset.cartella}/${String(k).padStart(5, '0')}.jpg`;
      if (im.getAttribute('src') !== src) { im.setAttribute('src', src); return im.decode().catch(() => {}); } }
    e.querySelectorAll('.big span').forEach((w, k) => { const p = ease((a - .2 - k * .42) / .5); w.style.opacity = p; w.style.transform = `translateY(${40 * (1 - p)}px)`; });
    const ft = e.querySelector('.fine-t'); if (ft) ft.style.opacity = ease((a - .9) / .6);
    const st = e.querySelector('.stampa');
    if (st) { const p = ease(a / .7), v = i % 2 ? -1 : 1; st.style.transform = `translateX(${v * 120 * (1 - p)}px) rotate(${v * 1.6 * p}deg)`;
      e.querySelector('.ph div').style.transform = `scale(${1.02 + .1 * cl(r / D)})`;
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
  }));
}

const sh = (cmd, args, opz) => execFileSync(cmd, args, { stdio: ['pipe', 'pipe', 'inherit'], ...opz }).toString();

function prepara(c, tmp) {
  // voci: una battuta per scena ("voce") o per didascalia ("voce" dentro la didascalia)
  const battute = [];
  c.scene.forEach((s, i) => {
    s.eventi = [];
    if (s.voce) s.eventi.push({ t: s.tipo === 'parole' || s.tipo === 'fine' ? .2 : .3, testo: s.voce });
    (s.didascalie || []).forEach(d => d.voce && s.eventi.push({ t: d.t, testo: d.voce }));
    const v = c.voci ? c.voci[i % c.voci.length] : c.voce;
    s.eventi.sort((x, y) => x.t - y.t).forEach((e, k) => { e.id = `v${i}_${k}`; battute.push({ id: e.id, testo: e.testo, voce: v }); });
  });
  let durate = {};
  if (battute.length)
    durate = JSON.parse(sh(process.env.VOCE_PY || 'python3', [path.join(__dirname, 'voce.py'), tmp, c.voce || 'im_nicola'],
      { input: JSON.stringify(battute), env: process.env }).trim().split('\n').pop());
  c.scene.forEach((s, i) => {
    // allunga i tempi dove la voce non ci sta: punti (nuovo, originale)
    const w = [[0, 0]]; let sp = 0, fine = 0;
    s.eventi.forEach((e, k) => {
      const prec = s.eventi[k - 1], nt = Math.max(e.t + sp, prec ? prec.nt + durate[prec.id] + .3 : 0);
      sp = nt - e.t; e.nt = nt; e.dur = durate[e.id]; if (nt > 0) w.push([nt, e.t]); fine = nt + e.dur;
    });
    s.w = w; s.durataVera = Math.max(s.durata + sp, fine + (i === c.scene.length - 1 ? 1.2 : .7));
    if (s.tipo === 'foto') { // foto d'archivio piccole: ingrandite con cura e un filo più nitide
      s.fotoMigliore = path.join(tmp, `foto${i}.jpg`);
      sh('convert', [path.join(R, s.foto), '-filter', 'Lanczos', '-resize', '1848x1280^', '-unsharp', '0x1.2+0.6+0.02', '-modulate', '102,107', '-quality', '92', s.fotoMigliore]);
    }
    if (s.tipo === 'clip') {
      s.cartella = path.join(tmp, 'clip' + i); fs.mkdirSync(s.cartella);
      sh('ffmpeg', ['-loglevel', 'error', '-ss', String(s.da || 0), '-t', String(s.durataVera + .2), '-i', path.join(R, s.clip),
        '-vf', `fps=${FPS},scale=952:792:force_original_aspect_ratio=increase,crop=952:792,eq=contrast=1.04:saturation=1.06`, '-q:v', '3', path.join(s.cartella, '%05d.jpg')]);
      s.n = fs.readdirSync(s.cartella).length;
    }
  });
  return durate;
}

function audio(c, tmp, T, out) {
  const ing = [], filtri = [], voci = [];
  let n = 0;
  if (c.musica) { ing.push('-stream_loop', '-1', '-i', path.join(R, c.musica.file)); n++; }
  let t0 = 0;
  c.scene.forEach(s => { s.eventi.forEach(e => { ing.push('-i', path.join(tmp, e.id + '.wav'));
    filtri.push(`[${n}:a]aresample=44100,aformat=channel_layouts=stereo,adelay=${Math.round((t0 + e.nt) * 1000)}:all=1[v${n}]`); voci.push(`[v${n}]`); n++; });
    t0 += s.durataVera; });
  const mus = c.musica ? `[0:a]atrim=0:${T},asetpts=N/SR/TB,aresample=44100,aformat=channel_layouts=stereo,volume=${c.musica.volume ?? .22},afade=t=in:d=0.6,afade=t=out:st=${(T - 2).toFixed(2)}:d=2[m]` : null;
  if (voci.length) {
    filtri.push(`${voci.join('')}amix=inputs=${voci.length}:normalize=0,apad[vv]`, '[vv]asplit[va][vb]');
    if (mus) filtri.push(mus, '[m][va]sidechaincompress=threshold=0.02:ratio=8:attack=15:release=350[md]', '[md][vb]amix=inputs=2:normalize=0,alimiter=limit=0.95,loudnorm=I=-14:TP=-1.5:LRA=11[a]');
    else filtri.push('[va]anull[a]', '[vb]anullsink');
  } else if (mus) filtri.push(mus.replace('[m]', '[a]'));
  else return null;
  sh('ffmpeg', ['-y', '-loglevel', 'error', ...ing, '-filter_complex', filtri.join(';'), '-map', '[a]', '-t', String(T), '-c:a', 'aac', '-b:a', '160k', out]);
  return out;
}

async function genera(br, nome) {
  const c = JSON.parse(fs.readFileSync(path.join(__dirname, nome + '.json'), 'utf8'));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'video-'));
  prepara(c, tmp);
  const html = `<!doctype html><meta charset=utf-8><style>${CSS}</style><body><div class="cart">${esc(c.tema)}</div>
${c.scene.map((s, i) => scena(s, i, c).replace('class="sc', `data-d="${s.durataVera}" data-w='${JSON.stringify(s.w)}' class="sc`)).join('\n')}
<div class="piede"><img src="${F('assets/img/logo.png')}" alt=""><div class="tel"><b>Tel. e WhatsApp</b> 06 63 46 70<br><b>Cellulare</b> 331 777 1888</div><div class="web">info@cooprimavera.com · cooprimavera.com</div></div>
<script>const DISS=${DISS};(${motore})()</script>`;
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
  // Audio: musica sotto, che si abbassa quando parla la voce; senza nessuno dei due, traccia muta.
  const a = audio(c, tmp, T, path.join(tmp, 'audio.m4a'));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, '%05d.jpg'),
    ...(a ? ['-i', a] : ['-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo']), '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-crf', '20', '-r', String(FPS), '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '160k', path.join(out, nome + '.mp4')]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('ok', nome + '.mp4', T.toFixed(1) + ' s');
}

(async () => {
  const nomi = process.argv.slice(2).length ? process.argv.slice(2)
    : fs.readdirSync(__dirname).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5));
  const br = await chromium.launch();
  try { for (const n of nomi) await genera(br, n); } finally { await br.close(); }
})();
