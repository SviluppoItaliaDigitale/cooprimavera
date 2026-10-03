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
  Campi: `azione`, `rete` (`fb`/`ig`), `id`, `testo`, `immagine_url`, `conferma`.

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

### Video (Reel)

Un post del calendario con il campo `video` (indirizzo di un `.mp4` in
`static/social/video/`) esce come **Reel su Instagram** e, se su Facebook non
era già programmato un post con la foto, come **video su Facebook**; sul sito la
notizia mostra il video. I video (1080×1920, 20-25 secondi, senza musica) si
generano con `node social/video/genera.js [nome]` da `social/video/<nome>.json`:
scene con le foto vere del registro lavori (`foto`) o con i disegni al tratto di
`social/disegni/` (`disegno`, si tracciano da soli), più apertura e chiusura.
Il logo sta sulla fascia chiara in basso, sopra l'area coperta dai pulsanti dei
Reel. Facebook non programma i video dalle API: li pubblica `pubblica-oggi` il
giorno stesso.

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
- **Cosa viene pubblicato**: solo quello che è in `social/calendario.json` su
  `main`, cioè passato da una PR approvata. Per aggiungere post: righe nuove nel
  calendario, grafiche con `node social/grafiche/genera.js`, PR.
- **Per fermare tutto**: GitHub → Actions → «🛠️ Gestione social» → ⋯ →
  Disable workflow (e lo stesso per l'avvio programmato di «Pubblica su Aruba»,
  togliendo `schedule` da `deploy.yml`).

