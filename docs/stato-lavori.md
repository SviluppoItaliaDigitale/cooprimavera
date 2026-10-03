# Stato dei lavori (aggiornato al 3 ottobre 2026)

Nota di consegna: serve a riprendere il lavoro da una sessione nuova.

## Fatto
- **Sito** (tutto su `main`, online): registro dei lavori `/lavori/`, pagina
  `/chi-siamo/vent-anni/`, Chi siamo riscritto, servizi nuovi (piccole
  manutenzioni, servizi per comuni ed enti, servizi ausiliari).
- **Social ripartiti da zero**: 320 post Facebook e 18 Instagram cancellati
  dopo averli archiviati sul ramo `archivio-social` (testi, foto, video, 69
  foto degli album). Gli album Facebook li ha tolti Alessandro a mano.
- **Strumento «🛠️ Gestione social»** (`scripts/gestione_social.py`,
  `docs/social-meta.md`): elenco, statistiche, pubblica (anche programmata su
  Facebook con `quando`), esporta, elimina-tutti, programma-calendario,
  pubblica-oggi.
- **Calendario ottobre–dicembre 2026**: `social/calendario.json` (24 post,
  testi Facebook e Instagram approvati), grafiche in `static/social/`,
  generatore `social/grafiche/genera.js`. Anteprima con i testi da copiare:
  https://claude.ai/artifact/8DGf18RvQA9KQwPL3wpecJ (privata, di Alessandro).

## Programmato
- **Lunedì 5/10/2026 ore 9:00, Facebook**: post «Vent'anni oggi» programmato
  in Meta Business Suite (ID 1803148191226650), con la grafica precedente
  (logo più piccolo).
- **Lunedì 5/10/2026 ore 9:00, Instagram**: lo pubblica una routine che apre
  una sessione nuova (azione `pubblica-oggi`).

## Da decidere / da fare
1. **Resto del calendario**: Alessandro deve scegliere tra
   - A) pubblicazione automatica lunedì e giovedì alle 9:00 (cron nel workflow
     con `pubblica-oggi`; serve la sua conferma esplicita, il controllo
     permessi l'ha bloccata senza);
   - B) `programma-calendario` per Facebook (fino a 74 giorni avanti) e
     Instagram pubblicato a mano o su richiesta.
2. Se vuole il logo grande anche sul post del 5/10 su Facebook: cancellare il
   post programmato e riprogrammarlo con la grafica nuova.
3. Sostituire con foto vere le 10 grafiche con foto di repertorio
   (`grafica.fonte_foto = "repertorio"` nel calendario), a partire dalla foto
   del decoro urbano, che sembra americana.
4. Instagram: verificare dall'app che i due vecchi video IGTV non ci siano più.

## Come si riprende
- Pubblicare o programmare: scrivere `.github/social/comando.json` su un ramo
  diverso da `main` e fare push (vedi `docs/social-meta.md`); l'esito arriva
  in `.github/social/esito.md` sullo stesso ramo.
- Rigenerare le grafiche dopo una modifica al calendario:
  `node social/grafiche/genera.js` (o con le date, es. `2026-12-24`).
