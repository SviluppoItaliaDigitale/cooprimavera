# Facebook e Instagram: accesso tramite API Meta

Configurato il 03/10/2026. Serve a gestire la pagina Facebook
[Cooprimavera](https://www.facebook.com/Cooprimavera) e l'account Instagram
[@cooprimaverasoccoop](https://www.instagram.com/cooprimaverasoccoop) senza
entrare a mano nelle app. I post rimandano alle schede del [registro dei lavori](https://www.cooprimavera.com/lavori/)
del sito (`content/lavori/`).

## Configurazione

- Portfolio Meta «Cooprimavera Soc. Coop.» (ID 1069171093648181).
- Pagina Cooprimavera (ID 192102847559438), collegata a Instagram
  @cooprimaverasoccoop (ID 17841450942594163).
- App Meta «Sito Cooprimavera» (ID 1755372812353047), casi d'uso: Pagina,
  Instagram, Messenger. Non pubblicata (non serve per gestire i propri asset).
- Utente di sistema **sito-web** (ID 61594884729022, Admin): pagina in accesso
  completo, app con ruolo «Sviluppa l'app». Instagram risulta senza
  assegnazione diretta (nel portfolio c'è «Accesso richiesto»), ma funziona
  attraverso la pagina collegata.

## Secret GitHub del repository

| Secret | Contenuto |
|---|---|
| `META_PAGE_ID` | ID della pagina |
| `META_PAGE_TOKEN` | token della pagina, **non scade** |
| `META_IG_USER_ID` | ID dell'account Instagram collegato |

Il token non va mai scritto nei file né incollato in chat.

## Permessi del token

`pages_show_list`, `pages_read_engagement`, `pages_read_user_content`,
`pages_manage_posts`, `pages_manage_engagement`, `pages_manage_metadata`,
`pages_messaging`, `read_insights`, `instagram_basic`,
`instagram_content_publish`, `instagram_manage_contents`,
`instagram_manage_comments`, `instagram_manage_insights`,
`instagram_manage_messages`.

Abilita: pubblicare, modificare ed eliminare post su Facebook; pubblicare ed
eliminare post su Instagram; commenti, messaggi e statistiche su entrambi.

Esclusi di proposito: `business_management` (aggiungere o togliere
amministratori, persone e risorse del portfolio resta solo ad Alessandro),
permessi pubblicitari e di negozio.

Limiti della piattaforma: su Instagram un post pubblicato non si modifica (si
elimina e si ripubblica); su Facebook si riscrive il testo ma non le immagini.

## Gestione da qualsiasi dispositivo («🛠️ Gestione social»)

Il workflow `.github/workflows/gestione-social.yml` (script
`scripts/gestione_social.py`) gestisce pagina Facebook e Instagram anche col PC
spento: elenco dei post, statistiche, pubblicare, modificare il testo (solo
Facebook), eliminare, commenti (leggere, rispondere, nascondere, eliminare),
messaggi Messenger/Direct (leggere, rispondere), prova invisibile, `esporta`
(archivio completo di testi e immagini in `archivio-social/`) ed `elimina-tutti`
(cancella solo i post già archiviati, mai foto profilo e copertina).

- **Dal telefono**: app GitHub → repository → *Actions* → *🛠️ Gestione social*
  → *Run workflow*, scegliere azione e rete e compilare i campi. Per eliminare
  scrivere `ELIMINA` nel campo conferma. Il risultato compare nel riepilogo del run.
- **Tramite Claude, anche da sessione cloud**: su un ramo diverso da `main` si
  scrive `.github/social/comando.json`, ad esempio
  `{"azione": "commenti", "rete": "ig", "id": "https://www.instagram.com/p/…"}`,
  e si fa push: il workflow parte da solo e scrive il risultato in
  `.github/social/esito.md` sullo stesso ramo (poi il ramo si cancella).
  Campi: `azione`, `rete` (`fb`/`ig`), `id`, `testo`, `immagine_url`, `quando`,
  `alt` (testo alternativo dell'immagine), `conferma`.

## Rigenerare il token

business.facebook.com → portfolio Cooprimavera → Impostazioni → Utenti →
Utenti di sistema → sito-web → *Genera token* → app Sito Cooprimavera →
scadenza «Mai» → i permessi elencati sopra → Genera → Copia. Poi ricavare il
token della pagina con
`GET https://graph.facebook.com/v23.0/192102847559438?fields=access_token`
e aggiornare il secret `META_PAGE_TOKEN`.

## Archivio e ripartenza da zero (03/10/2026)

Prima della ripartenza tutti i post sono stati salvati con `esporta` e poi
cancellati con `elimina-tutti`: 314 su Facebook (dal 2012) e 16 su 18 su
Instagram. L'archivio completo (testi, date, link, foto e video, link YouTube
dei video condivisi) sta sul ramo **`archivio-social`**, cartella
`archivio-social/`: `README.md` per sfogliarlo, `dati.json` per i dati. Non va
unito a `main` (pesa circa 130 MB).

Limiti trovati:
- l'elenco dei post di Facebook non restituisce sempre tutto: dopo una
  cancellazione possono comparire post vecchi mai elencati prima. `elimina-tutti`
  non li tocca finché non sono nell'archivio: basta rilanciare `esporta`, che
  aggiunge all'archivio esistente, e poi `elimina-tutti`;
- i vecchi video **IGTV** di Instagram non si cancellano dalle API (errore
  «Fatal»): vanno tolti a mano dall'app.

## Calendario

Il calendario dei post sta in `social/calendario.json` (data, ora italiana,
testi, grafica); le grafiche si generano con `node social/grafiche/genera.js`
e finiscono in `static/social/`, online su `https://www.cooprimavera.com/social/…`
perché Instagram vuole un indirizzo pubblico.

- `programma-calendario`: programma su Facebook i post entro 28 giorni (per i post
  con foto Facebook accetta al massimo circa 30 giorni: si rilancia ogni 2-3 settimane); si vedono in Meta Business Suite → Programmati.
- `pubblica-oggi`: pubblica il post del giorno su Instagram e, se non era già
  programmato, su Facebook; non pubblica due volte lo stesso giorno.

### Cornice di microtesto e testo alternativo (dal 21/10/2026)

Ogni grafica e ogni copertina dei video escono con la **cornice di microtesto**:
lungo i quattro bordi, in piccolo, «COOPRIMAVERA SOCIETÀ COOPERATIVA ·
www.cooprimavera.com · grafica di Cooprimavera Società Cooperativa · © anno»,
invisibile da lontano e leggibile ingrandendo, con il tono adattato al fondo
(chiaro sullo scuro, scuro sul chiaro). La scrive `social/grafiche/cornice.js`,
che mette anche un segno nel file JPEG. Foto e riquadri stanno a 20 px dai bordi,
e `genera.js` si ferma se una scritta, il logo o una foto entrano nella fascia
della cornice. Nei video la cornice è uno strato sotto le scene: si legge anche
dopo la compressione, non tocca la fascia del logo e si vede attraverso le foto
solo durante le dissolvenze (0,35 s). Per una grafica fatta in altro modo:
`node social/grafiche/genera.js --cornice FILE.jpg` (si ferma se ai bordi c'è un
disegno o una scritta). Le grafiche dei post già usciti restano come sono.

Ogni post del calendario ha il campo **`alt`**, il testo alternativo della
grafica: che cosa mostra la foto, scritto guardandola, e che cosa c'è scritto,
preso dagli stessi campi con cui `genera.js` la disegna; al massimo 1000
caratteri, mai «Immagine di…», mai nomi di strumenti. `gestione_social.py` lo
manda a Instagram in `alt_text` (solo immagini, fino a 1000 caratteri) e a
Facebook in `alt_text_custom` sulle foto, anche programmate; per i video e i
Reel non si manda. Senza il campo si pubblica come prima. Se Meta rifiuta la
richiesta e il rifiuto può dipendere dal testo alternativo, si ritenta una
volta senza e l'esito lo scrive: succede quando il messaggio di Meta nomina il
testo alternativo, oppure quando è un «parametro non valido» (codice 100) che
non nomina né un altro parametro della stessa richiesta né un'altra causa
(immagine, indirizzo, luogo, didascalia, programmazione, carosello, tag). È una
regola prudente nostra, non un comportamento descritto da Meta: il
[riferimento dei codici di errore della Graph API di Instagram](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/error-codes)
usa il codice 100 per problemi diversi (tipo di contenuto, carosello con meno di
2 o più di 10 elementi, tag), ciascuno con un messaggio che lo nomina, e nessuno
riguarda il testo alternativo. Le prove usano risposte simulate, non risposte
vere di Meta. Il controllo legge anche il titolo e il messaggio per l'utente,
che Meta scrive nella lingua della richiesta
([guida «Handling Errors»](https://developers.facebook.com/docs/graph-api/guides/error-handling)),
quindi riconosce le parole sia in inglese sia in italiano. Gli altri rifiuti non
dipendono dal testo alternativo e non si ritentano: il token scaduto, il limite
di chiamate, un codice 100 che nomina l'immagine, l'indirizzo o il luogo,
un'immagine che non si scarica. Sul sito il testo diventa l'`alt` della grafica
nella pagina della notizia.

Controlli:
- `python3 scripts/controlla-cornice.py`: per ogni post dal 22/10/2026 controlla
  il segno della cornice in grafica, miniatura e copertina del video e il campo
  `alt`; esce con 1 se qualcosa manca. `genera.js` lo lancia da solo alla fine
  (`--solo-segno`, perché il testo alternativo si scrive dopo aver guardato la
  grafica); `--prova` lo prova su casi costruiti apposta.
- `python3 scripts/prova_gestione_social.py`: prova i parametri che lo script
  manderebbe a Facebook e Instagram con una rete finta, senza inviare nulla.
- L'azione `prova` del workflow (che invece chiama Meta, senza rendere visibile
  nulla) carica ed elimina una foto Facebook non pubblicata con il testo
  alternativo e prepara un contenitore Instagram con il testo alternativo.
- Su ogni pull request il workflow «🖼️ Controllo cornice e testo alternativo»
  (`.github/workflows/controllo-cornice.yml`) esegue i primi due controlli, con
  la prova di `controlla-cornice.py`: se diventa rosso, la pull request non si
  unisce.

Grafiche «anno»: sulla stampa va il periodo della foto, di norma uguale al
campo `anno` (il numero grande). Con `anno_stampa` sulla stampa si scrive altro;
vuoto, la stampa resta senza scritta. Serve quando la foto non è del periodo
del numero grande, come il 31/12/2026: «2026» in grande, foto del concerto del
2020 a Palazzo Farnese, nessuna data sulla stampa.

### Video (Reel)

Un post del calendario con il campo `video` (indirizzo di un `.mp4` in
`static/social/video/`) esce come **Reel su Instagram** e, se su Facebook non
era già programmato un post con la foto, come **video su Facebook**; sul sito la
notizia mostra il video. Facebook non programma i video dalle API: li pubblica
`pubblica-oggi` il giorno stesso.

I video (1080×1920, 25-40 secondi) si generano con
`node social/video/genera.js [nome]` da `social/video/<nome>.json`. Scene:
`parole` (apertura), `foto` (foto vere del registro lavori, ingrandite e rese più
nitide), `disegno` (disegni al tratto di `social/disegni/` che si tracciano da
soli), `clip` (video gratuiti Pexels in `social/video/clip/`), `fine`. Ogni scena
o didascalia può avere una `voce`: la scena si allunga quanto serve. La musica
(`musica`) si abbassa da sola quando parla la voce; volume finale -14 LUFS, come
chiedono i social. Il logo sta sulla fascia chiara in basso, sopra l'area
coperta dai pulsanti dei Reel.

**Voce sintetica** (scelta di Alessandro il 3/10/2026): `social/video/voce.py`
con Kokoro. Per rigenerare i video serve, una volta sola, fuori dal repository:

```sh
python3 -m venv ~/kokoro-venv && ~/kokoro-venv/bin/pip install kokoro-onnx==0.6.1 soundfile
mkdir -p ~/kokoro && cd ~/kokoro && for f in kokoro-v1.0.onnx voices-v1.0.bin; do
  curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/$f; done
VOCE_PY=~/kokoro-venv/bin/python VOCE_MODELLI=~/kokoro node social/video/genera.js
```

Voce: `"voce": "im_nicola"` (Nicola, maschile: Alessandro la trova migliore
nella lettura). Con `"voci": [...]` le scene alternano più voci. In basso, fascia chiara con logo, telefono e WhatsApp
06 63 46 70, cellulare 331 777 1888, email e sito.
Numeri di telefono e anni nella voce vanno scritti in lettere.

**Fonti e licenze**
- Musica: Kevin MacLeod (incompetech.com), licenza CC BY 4.0: «Sneaky Snitch»
  (topi), «Life of Riley» (allestimenti), «Carefree» (fotovoltaico). La licenza
  chiede la citazione: è nel cartello finale del video, in piccolo e poco
  visibile come chiesto da Alessandro, e in fondo al testo del post («Musica «…» Kevin MacLeod, …»).
- Clip: Pexels (licenza Pexels, uso libero): 12281161 (topo), 9788591 (pannello
  da vicino), 12646455 (lavaggio pannelli con spazzola).
- Voce: Kokoro-82M (Apache 2.0) con kokoro-onnx 0.6.1 (MIT); la pronuncia passa
  da espeak-ng (GPL-3.0, tramite espeakng-loader), usato solo come strumento e
  non incluso nel repository.

## Pubblicazione automatica (attivata il 3/10/2026 su richiesta di Alessandro)

- **Social**: il workflow «🛠️ Gestione social» parte da solo il lunedì e il
  giovedì (07:00 e 08:00 UTC, cioè le 9:00 italiane con l'ora legale e con
  quella solare) con `pubblica-oggi`: pubblica su Instagram e su Facebook il post
  di quel giorno preso da `social/calendario.json`. Salta Facebook se il post è
  già programmato o pubblicato, salta Instagram se oggi c'è già un post.
- **Sito**: ogni post del calendario è anche una pagina in `/notizie/`, creata da
  `content/notizie/_content.gotmpl` (content adapter di Hugo). Le pagine con data
  futura non vengono pubblicate (`buildFuture = false`); il workflow «Pubblica su
  Aruba» ricompila il sito il lunedì e il giovedì alle 07:20 e 08:20 UTC, così la
  notizia esce insieme al post. In home il riquadro «Dalla nostra pagina» mostra
  le ultime tre.
- **Consigli con articolo (dal 16/10/2026)**: un post può avere `articolo`
  (Markdown più lungo del testo social, con titoli, collegamenti ai servizi e
  «Fonti»: sul sito vale quello), `titolo_seo` (il `<title>` della pagina) e
  `descrizione` (meta description, massimo 155 caratteri). La pagina riceve i
  dati strutturati `BlogPosting` e il testo alternativo della grafica dal campo
  `alt` del calendario (per i post più vecchi, dal titolo e dai punti); ogni pagina servizio elenca i consigli e le notizie con lo stesso
  `pagina_sito`. Le grafiche `consiglio` possono avere una foto in alto
  (`grafica.foto` in `assets/img/consigli/`, `grafica.fuoco` per la posizione):
  da `assets/` la foto diventa anche l'anteprima social della pagina.
- **SEO dei consigli (dal 16/10/2026)**: pagina `/consigli/` (menu «Consigli») con
  tutti i consigli divisi per servizio; in ogni articolo il riquadro «Sullo
  stesso argomento» con altri tre post dello stesso servizio; nella sitemap la
  grafica di ogni notizia come immagine (Google Immagini); nel `BlogPosting`, oltre
  alla grafica, la foto in 16:9, 4:3 e 1:1 a 1200 px come raccomanda Google;
  negli elenchi le miniature 432x540 di `static/social/mini/` (circa 36 KB invece
  di 190), create da `genera.js`; feed RSS delle notizie collegato nella testa.
- **Routine di Claude (dal 13/10/2026)**: gli avvii programmati di GitHub sono
  arrivati con ore di ritardo (5/10 alle 17:20, 8/10 alle 16:05) o non sono
  partiti. Ogni giorno alle 9:05 una routine di Claude («Cooprimavera:
  pubblicazione del giorno e verifica», claude.ai → Routines) avvia
  `pubblica-oggi` e «Pubblica su Aruba», controlla che il post sia online su
  Instagram, Facebook e sito, riprova se serve e manda l'esito ad Alessandro.
  Gli avvii di GitHub restano come riserva: niente doppioni.
- **Cosa viene pubblicato**: solo quello che è in `social/calendario.json` su
  `main`, cioè passato da una PR approvata. Per aggiungere post: righe nuove nel
  calendario, grafiche con `node social/grafiche/genera.js`, PR.
- **Per fermare tutto**: GitHub → Actions → «🛠️ Gestione social» → ⋯ →
  Disable workflow (e lo stesso per l'avvio programmato di «Pubblica su Aruba»,
  togliendo `schedule` da `deploy.yml`).

