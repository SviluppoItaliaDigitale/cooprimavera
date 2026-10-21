/* Cornice di microtesto per le grafiche di Cooprimavera Società Cooperativa (post, miniature, copertine dei video).

   Nasce il 21/10/2026: Alessandro, per le grafiche della Misericordia di Ariccia, ha chiesto «metti in ogni slide,
   documento grafico eccetera sempre [il nome]! Altrimenti ci rubano la grafica!! e se riesci anche un microtesto
   come filigrana ai bordi a mo' di cornice», e poi «fai tutto uniformato». Riprende il motore della Misericordia
   (scripts/grafica-brand/firma-e-cornice.js nel repository del suo sito), con il carattere e i colori di Cooprimavera.

   - corniceCooprimavera(sorgente, opzioni): disegna l'immagine (indirizzo data: di un PNG o di un JPEG) e incide lungo
     i quattro bordi, in caratteri di 9 px (Barlow 600), la provenienza della grafica: denominazione, sito, «grafica di»
     e anno. Il tono si adatta al fondo pixel per pixel (schiarisce dove è scuro, scurisce dove è chiaro) con opacità
     bassa: da lontano non si nota, ingrandendo si legge, e chi ritaglia i bordi lascia una grafica rifilata. Restituisce
     il JPEG con un commento (MARCATORE) che scripts/controlla-cornice.py cerca e, se richiesta, la miniatura.
   - stratoCornice(fondo, opzioni): la stessa cornice come livello trasparente per i video, che sta sotto le scene.
   - bordiOccupati(): nella pagina di una grafica elenca le scritte, il logo, le foto e i disegni che entrerebbero nella
     fascia della cornice. Deve restare vuoto: la cornice non tocca e non copre logo, testi e foto (lo controllano
     social/grafiche/genera.js e social/video/genera.js, che si fermano se l'elenco non è vuoto).
   - zonaLibera(sorgente): lo stesso controllo, fatto sui pixel, per i JPEG già fatti (genera.js --cornice).
   Nessuna libreria esterna. */
(() => {
  const MARCATORE = 'Cooprimavera Soc. Coop. - cornice di microtesto - www.cooprimavera.com';
  const CARATTERE = 'Barlow';
  const testoBase = (anno) => `COOPRIMAVERA SOCIETÀ COOPERATIVA · www.cooprimavera.com · grafica di Cooprimavera Società Cooperativa · © ${anno} · `;
  const luminanza = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
  // Toni verso cui si sposta la cornice: bianco sui fondi scuri, l'inchiostro delle grafiche (#232a1c) su quelli chiari.
  const CHIARO = [255, 255, 255], SCURO = [35, 42, 28];
  const tono = (r, g, b) => (luminanza(r, g, b) < 140 ? CHIARO : SCURO);
  const corpoPer = (W) => Math.max(7, Math.round(W * 9 / 1080));
  const LIBERO = 3;                           // pixel liberi fra la fascia della cornice e il primo contenuto

  // Testo di una striscia lunga `lunghezza` px: i pezzi del testo (separati da «·») interi, ripetuti finché entrano;
  // se in fondo resta posto, il nome o l'indirizzo del sito. Mai una frase tagliata a metà.
  const riga = (misura, testo, lunghezza) => {
    const pezzi = testo.split('·').map((p) => p.trim()).filter(Boolean), sep = ' · ';
    let r = '', ultimo = null;
    for (let i = 0; i < 1000; i++) {
      const p = pezzi[i % pezzi.length], prova = r ? r + sep + p : p;
      if (misura(prova) > lunghezza) break;
      r = prova; ultimo = p;
    }
    for (const p of pezzi.slice(0, 2)) {
      const prova = r ? r + sep + p : p;
      if (p !== ultimo && misura(prova) <= lunghezza) { r = prova; ultimo = p; }
    }
    if (!r) {
      const parole = pezzi[0].split(' ');
      while (parole.length && misura(parole.join(' ')) > lunghezza) parole.pop();
      r = parole.join(' ');
    }
    return r;
  };

  // Maschera del testo sui quattro bordi (angoli liberi): pixel bianchi con l'opacità dell'antialiasing.
  const maschera = (W, H, o) => {
    const corpo = o.corpo || corpoPer(W);
    const s = corpo + 4;                      // spessore della striscia: i primi corpo+4 pixel di ogni bordo
    const testo = o.testo || testoBase(o.anno || new Date().getFullYear());
    const m = document.createElement('canvas'); m.width = W; m.height = H;
    const c = m.getContext('2d');
    c.fillStyle = '#FFFFFF'; c.font = `600 ${corpo}px ${CARATTERE}`; c.textBaseline = 'middle';
    const misura = (t) => c.measureText(t).width;
    const lungO = W - 2 * s, lungV = H - 2 * s;
    const orizzontale = riga(misura, testo, lungO), verticale = riga(misura, testo, lungV);
    const dO = (lungO - misura(orizzontale)) / 2, dV = (lungV - misura(verticale)) / 2;   // righe centrate
    c.fillText(orizzontale, s + dO, s / 2);                                               // alto
    c.fillText(orizzontale, s + dO, H - s / 2);                                           // basso
    c.save(); c.translate(s / 2, H - s - dV); c.rotate(-Math.PI / 2); c.fillText(verticale, 0, 0); c.restore();  // sinistra, dal basso
    c.save(); c.translate(W - s / 2, s + dV); c.rotate(Math.PI / 2); c.fillText(verticale, 0, 0); c.restore();   // destra, dall'alto
    return { a: c.getImageData(0, 0, W, H).data, info: { corpo, striscia: s, intensita: o.intensita ?? 0.32, orizzontale, verticale } };
  };

  // Incide la cornice sull'immagine del contesto: ogni pixel del testo si sposta verso il tono adatto al suo fondo.
  const incidiCornice = (ctx, W, H, o) => {
    const { a, info } = maschera(W, H, o);
    const immagine = ctx.getImageData(0, 0, W, H), d = immagine.data;
    let incisi = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (!a[i + 3]) continue;
      const t = tono(d[i], d[i + 1], d[i + 2]), k = (a[i + 3] / 255) * info.intensita;
      d[i] += (t[0] - d[i]) * k; d[i + 1] += (t[1] - d[i + 1]) * k; d[i + 2] += (t[2] - d[i + 2]) * k;
      incisi++;
    }
    ctx.putImageData(immagine, 0, 0);
    return { ...info, pixel: incisi };
  };

  const immagine = async (sorgente) => { const im = new Image(); im.src = sorgente; await im.decode(); return im; };
  const caratterePronto = async (corpo) => {
    await document.fonts.ready;
    await document.fonts.load(`600 ${corpo}px ${CARATTERE}`, testoBase(2026));
    if (!document.fonts.check(`600 ${corpo}px ${CARATTERE}`, testoBase(2026))) throw new Error(`carattere ${CARATTERE} 600 non caricato: la cornice non si scrive con un carattere di ripiego`);
  };

  // Commento con MARCATORE subito dopo l'intestazione JFIF (prima dei dati dell'immagine).
  const conSegno = (datiURL) => {
    const [testa, b64] = datiURL.split(','), bin = atob(b64), b = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
    if (b[0] !== 0xFF || b[1] !== 0xD8) throw new Error('la cornice scrive il segno solo nei JPEG');
    const testo = new TextEncoder().encode(MARCATORE);
    const pos = (b[2] === 0xFF && b[3] === 0xE0) ? 4 + ((b[4] << 8) | b[5]) : 2;
    const seg = new Uint8Array(4 + testo.length);
    seg.set([0xFF, 0xFE, (testo.length + 2) >> 8, (testo.length + 2) & 255]); seg.set(testo, 4);
    const out = new Uint8Array(b.length + seg.length);
    out.set(b.subarray(0, pos)); out.set(seg, pos); out.set(b.subarray(pos), pos + seg.length);
    let s = '';
    for (let i = 0; i < out.length; i += 0x8000) s += String.fromCharCode.apply(null, out.subarray(i, i + 0x8000));
    return `${testa},${btoa(s)}`;
  };

  window.MARCATORE_CORNICE = MARCATORE;
  window.segnoCornice = conSegno;   // per i JPEG che hanno già la cornice dentro (copertine dei video)

  // opzioni: anno (della data del post), qualita del JPEG (0.86 come le grafiche di prima), mini [larghezza, altezza]
  // e qualitaMini per la miniatura ricavata dalla stessa grafica, intensita e corpo della cornice, testo.
  window.corniceCooprimavera = async (sorgente, o = {}) => {
    const im = await immagine(sorgente);
    const W = im.naturalWidth, H = im.naturalHeight;
    await caratterePronto(o.corpo || corpoPer(W));
    const tela = document.createElement('canvas'); tela.width = W; tela.height = H;
    const ctx = tela.getContext('2d'); ctx.drawImage(im, 0, 0);
    const esito = { larghezza: W, altezza: H, cornice: incidiCornice(ctx, W, H, o) };
    esito.dati = conSegno(tela.toDataURL('image/jpeg', o.qualita ?? 0.86));
    if (o.mini) {
      const m = document.createElement('canvas'); [m.width, m.height] = o.mini;
      const c = m.getContext('2d'); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
      c.drawImage(tela, 0, 0, m.width, m.height);
      esito.mini = conSegno(m.toDataURL('image/jpeg', o.qualitaMini ?? 0.82));
    }
    return esito;
  };

  // Per i video: la cornice come livello trasparente (PNG), calcolato sul fondo fisso del video (`sorgente`, il
  // fotogramma senza scene). Nella pagina del video sta sopra il fondo e la fascia del logo e sotto le scene: quello
  // che si muove (una foto che entra di lato) passa sopra la cornice, che così non copre mai foto e scritte.
  window.stratoCornice = async (sorgente, o = {}) => {
    const im = await immagine(sorgente);
    const W = im.naturalWidth, H = im.naturalHeight;
    await caratterePronto(o.corpo || corpoPer(W));
    const f = document.createElement('canvas'); f.width = W; f.height = H;
    const fc = f.getContext('2d'); fc.drawImage(im, 0, 0);
    const fondo = fc.getImageData(0, 0, W, H).data, { a, info } = maschera(W, H, o);
    const out = fc.createImageData(W, H), d = out.data;
    for (let i = 0; i < d.length; i += 4) {
      if (!a[i + 3]) continue;
      const t = tono(fondo[i], fondo[i + 1], fondo[i + 2]);
      d[i] = t[0]; d[i + 1] = t[1]; d[i + 2] = t[2]; d[i + 3] = Math.round(a[i + 3] * info.intensita);
    }
    fc.clearRect(0, 0, W, H); fc.putImageData(out, 0, 0);
    return { ...info, dati: f.toDataURL('image/png') };
  };

  // Per una grafica già fatta, senza la pagina da cui leggere le posizioni: la fascia della cornice (più LIBERO pixel)
  // deve essere un fondo senza disegni. Per ogni linea di traverso alla fascia misura quanto varia la luminanza: scritte,
  // foto e disegni la fanno variare, i fondi pieni e i bordi dritti che attraversano la fascia no. Restituisce i tratti
  // occupati (tre linee di fila oltre la soglia), al massimo cinque per lato.
  window.zonaLibera = async (sorgente, o = {}) => {
    const im = new Image(); im.src = sorgente; await im.decode();
    const W = im.naturalWidth, H = im.naturalHeight, z = (o.corpo || corpoPer(W)) + 4 + LIBERO, soglia = o.soglia ?? 10;
    const tela = document.createElement('canvas'); tela.width = W; tela.height = H;
    const ctx = tela.getContext('2d'); ctx.drawImage(im, 0, 0);
    const d = ctx.getImageData(0, 0, W, H).data, L = (x, y) => { const i = (y * W + x) * 4; return luminanza(d[i], d[i + 1], d[i + 2]); };
    const tratti = [];
    const lato = (nome, n, punto) => {
      let fila = 0, da = -1, trovati = 0;
      for (let t = 0; t <= n; t++) {
        let sd = 0;
        if (t < n) {
          let s = 0, q = 0;
          for (let k = 0; k < z; k++) { const l = L(...punto(t, k)); s += l; q += l * l; }
          sd = Math.sqrt(Math.max(0, q / z - (s / z) ** 2));
        }
        if (sd > soglia) { if (!fila++) da = t; continue; }
        if (fila >= 3 && trovati++ < 5) tratti.push(`${nome}, ${da}-${t - 1} px`);
        fila = 0;
      }
    };
    lato('alto', W, (t, k) => [t, k]); lato('basso', W, (t, k) => [t, H - 1 - k]);
    lato('sinistra', H, (t, k) => [k, t]); lato('destra', H, (t, k) => [W - 1 - k, t]);
    return tratti;
  };

  // Scritte, logo, foto e disegni visibili che entrano nella fascia della cornice più LIBERO pixel. Per le scritte
  // conta il rettangolo del testo (tagliato in altezza al riquadro del suo elemento: i caratteri grandi con interlinea
  // stretta hanno una «scatola» più alta delle lettere); per foto e disegni il riquadro dell'elemento, rotazioni comprese.
  window.bordiOccupati = (o = {}) => {
    const W = innerWidth, H = innerHeight, z = (o.corpo || corpoPer(W)) + 4 + LIBERO;
    const visibile = (el) => {
      for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
      }
      return el.getClientRects().length > 0;
    };
    const nome = (el) => (el.getAttribute('alt') || el.className?.baseVal || el.className || el.tagName).toString().trim().slice(0, 40)
      + (el.textContent?.trim() ? ` «${el.textContent.trim().replace(/\s+/g, ' ').slice(0, 40)}»` : '');
    const rettangoli = [];
    for (const el of document.querySelectorAll('body *')) {
      if (el.closest('script, style, [data-microtesto]') || (el instanceof SVGElement && el.ownerSVGElement)) continue;
      if (!visibile(el)) continue;
      const cs = getComputedStyle(el);
      if (['IMG', 'VIDEO', 'CANVAS'].includes(el.tagName) || el.tagName.toLowerCase() === 'svg' || cs.backgroundImage !== 'none' || el.hasAttribute('data-ostacolo'))
        rettangoli.push({ nome: nome(el), q: el.getBoundingClientRect() });
      const box = el.getBoundingClientRect();
      for (const n of el.childNodes) {
        if (n.nodeType !== 3 || !n.textContent.trim()) continue;
        const r = document.createRange(); r.selectNodeContents(n);
        for (const q of r.getClientRects()) {
          const top = Math.max(q.top, box.top), bottom = Math.min(q.bottom, box.bottom);
          if (q.width > 0 && bottom > top) rettangoli.push({ nome: nome(el), q: { left: q.left, right: q.right, top, bottom } });
        }
      }
    }
    const fuori = [];
    for (const { nome: n, q } of rettangoli) {
      const lati = [];
      if (q.left < z) lati.push('sinistra'); if (q.right > W - z) lati.push('destra');
      if (q.top < z) lati.push('alto'); if (q.bottom > H - z) lati.push('basso');
      if (lati.length) fuori.push({ nome: n, lati, q: [q.left, q.top, q.right, q.bottom].map(Math.round) });
    }
    return fuori;
  };
})();
