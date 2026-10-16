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
- **Lunedì 5/10/2026 ore 9:00, Facebook**: post «Vent'anni oggi» riprogrammato
  il 3/10 con la grafica col logo grande (il vecchio, ID 1803148191226650, è
  stato cancellato).
- **Reel**: 12/10 (topi), 29/10 (allestimenti) e 9/11 (fotovoltaico) su
  Instagram escono come video (`social/video/`); su Facebook il 12 e il 29
  restano le foto già programmate, il 9/11 esce il video.
- **Facebook, 8–29 ottobre**: i 7 post del calendario programmati con
  `programma-calendario` (3/10). Gli altri, fino al 31 dicembre compreso, li
  pubblica la pubblicazione automatica il giorno stesso: non serve rilanciare
  `programma-calendario`.
- **Dal 5/10/2026, Instagram, Facebook e sito**: pubblicazione automatica il
  lunedì e il giovedì alle 9 (workflow su `main`). Dal 13/10 la fa partire e la
  verifica ogni giorno alle 9:05 la routine di Claude «Cooprimavera:
  pubblicazione del giorno e verifica», perché gli avvii di GitHub arrivavano
  con ore di ritardo.

## Consigli da professionisti (dal 16/10/2026)
- Un consiglio al giorno alle 9:00 su Facebook, Instagram e sito, numerati: n. 1 il
  16/10 (pubblicato), n. 2-55 dal 17/10 al 30/12 (saltano 25 e 26/12 e i giorni con
  altri post). Ogni consiglio ha foto gratuita Pexels (`assets/img/consigli/`),
  fonti citate nel post e articolo per il sito con fonti linkate.
- Verifiche delle fonti fatte il 16/10 per materiali, metodi, stanze, DPI,
  disinfestazioni, verde, giardinaggio, progettazione, manutenzioni e servizi;
  per il 2027 restano argomenti di stagione: rose e olivo (febbraio), prato in
  primavera, irrigazione, blatte, rampicanti, giardino che beve poco, diserbo,
  ringhiere, tinteggiature esterne, pannelli, salvavita, idraulica.
- Sostituisce la rubrica «Il consiglio del martedì» (PR #40, chiusa).

## Da decidere / da fare
1. **Pubblicazione automatica**: decisa da Alessandro il 3/10 («trova te il
   sistema migliore, tutto automaticamente»): social e sito escono da soli il
   lunedì e il giovedì alle 9 (vedi `docs/social-meta.md`). Uscite verificate:
   5/10, 8/10 (Instagram in ritardo, alle 16:05), 12/10 (primo Reel).
2. Sostituire con foto vere le grafiche con foto di repertorio
   (`grafica.fonte_foto = "repertorio"` nel calendario): il 3/10 ne sono state
   cambiate tre con foto gratuite più adatte (2, 12 e 26 novembre).
3. Altri video dei servizi: ogni due settimane, con foto vere o disegni.
4. Instagram: verificare dall'app che i due vecchi video IGTV non ci siano più.

## Come si riprende
- Pubblicare o programmare: scrivere `.github/social/comando.json` su un ramo
  diverso da `main` e fare push (vedi `docs/social-meta.md`); l'esito arriva
  in `.github/social/esito.md` sullo stesso ramo.
- Rigenerare le grafiche dopo una modifica al calendario:
  `node social/grafiche/genera.js` (o con le date, es. `2026-12-24`).
