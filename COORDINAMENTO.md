# Bacheca di coordinamento — Cooprimavera

File interno: Hugo non lo pubblica. Lo usano Claude e ChatGPT per passarsi lavoro, istruzioni e avvisi. La prima parte è il protocollo comune a tutti i repository di Alessandro; la seconda riguarda solo questo repository.

<!-- PROTOCOLLO-COMUNE:INIZIO — testo identico in tutti i repository di Alessandro. Copia di riferimento: assistente-personale/COORDINAMENTO.md. Se lo cambi, cambialo in tutti e cinque i repository nello stesso lavoro. -->

## Protocollo comune Claude ⇄ ChatGPT ⇄ Gemini (uguale in tutti i repository)

Valido dall'11/10/2026 in tutti i repository di Alessandro: `sito-pc-genzano`, `social-pc-genzano`, `sito-misericordia-ariccia`, `cooprimavera`, `assistente-personale`. Il file si chiama sempre `COORDINAMENTO.md` e sta sempre nella cartella principale del repository. Questa prima parte è identica ovunque; la seconda parte, «Questo repository», cambia da repository a repository.

### A che cosa serve

Claude (Claude Code) e ChatGPT (chat con connettore GitHub, Codex) lavorano sugli stessi repository. La bacheca è il posto dove si passano lavoro, istruzioni e avvisi, così Alessandro non deve copiare testi da una chat all'altra e il lavoro continua anche quando una delle due non è disponibile (per esempio quando Claude ha finito i crediti).

**Anche Gemini (dall'11/10/2026).** Gemini lavora sui repository con **Jules** (jules.google, legge da solo `AGENTS.md`) o con Gemini CLI. Dove questo protocollo dice «ChatGPT», vale allo stesso modo per Gemini: stesse regole, stessa autonomia, stesse eccezioni. Differenze: i suoi rami si chiamano `gemini/<argomento>-AAAAMMGG`; una richiesta indirizzata a «ChatGPT» la prende solo ChatGPT, una indirizzata a «Gemini» solo Gemini, una indirizzata a «chi è disponibile» la prende la prima che apre la bacheca, che scrive subito accanto «presa da …» con una PR in bozza, così l'altra non la riprende. Le revisioni automatiche fatte da Codex o da Gemini sulle PR sono pareri da verificare, non ordini.

### Chi dà le istruzioni

- **Alessandro**: in chat o scrivendo una richiesta qui. Le sue istruzioni prevalgono su tutto il resto.
- **Claude o ChatGPT**: con una voce nella sezione «Richieste» di questo file, indirizzata all'altra.
- Le regole del repository (`CLAUDE.md`, `.claude/rules/`, `AGENTS.md`) valgono per entrambe: chi lavora le segue anche quando l'altra non c'è.
- **Dubbi → domande** (istruzione di Alessandro del 13/10/2026: «se hai dubbi sei obbligato a fare domande a me per chiarimenti»). Quando una scelta cambia davvero l'esito e la risposta non è nei file, nelle regole o nelle fonti, non si indovina: si chiede ad Alessandro — in chat se c'è, altrimenti in «Domande» qui sotto — e intanto si fa il resto. Per le scelte ordinarie coperte dalle regole si procede e si riporta (regola `.claude/rules/autonomia.md`).

### Che cosa fa ChatGPT quando Alessandro scrive «guarda la bacheca» (o «continua il lavoro»)

ChatGPT lavora **in autonomia fino alla pubblicazione**, senza aspettare Claude:

1. **Leggi la versione di `main`** di questo file e l'elenco delle pull request aperte. Se un file che devi toccare è già in una PR aperta di un'altra sessione, non toccarlo: scrivilo in «Domande» e fai il resto.
2. **Prendi prima i lavori lasciati a metà** nella sezione «Lavori in corso», poi le richieste aperte indirizzate a ChatGPT (o a «chi è disponibile»), in ordine di data. Solo se entrambe le sezioni sono vuote rispondi in una riga: «Nessuna richiesta aperta per me in bacheca».
3. **Apri un ramo tuo** da `main` aggiornato: `chatgpt/<argomento>-AAAAMMGG` (o `codex/...`). Non riprendere il ramo di un'altra sessione, **salvo quando è indicato in «Lavori in corso»** o quando il lavoro ti arriva con un passaggio preparato da Claude (§ «Passaggio a ChatGPT»): in quei casi il ramo, e la sua PR, sono passati a te e li continui lì.
4. **Fai il lavoro** seguendo le istruzioni della richiesta e le regole del repository. Leggi solo i file che servono a quel lavoro.
5. **Fai i controlli del repository** elencati in «Questo repository» (build, script di controllo). Se Claude non c'è, la revisione che di solito fa Claude la fai tu: usa come lista di controllo i file pertinenti di `.claude/agents/` se il repository li ha, altrimenti le regole di `CLAUDE.md`, `.claude/rules/` e i controlli di «Questo repository»; rendi e guarda le immagini, rileggi il testo.
6. **Apri la PR verso `main`** (anche in bozza), poi, **sullo stesso ramo**, aggiorna questa bacheca: accanto alla richiesta scrivi «fatta da ChatGPT, PR #N» con il numero appena assegnato e una riga su che cosa hai fatto; se una parte non si poteva fare, scrivi il motivo. Fai push: la PR si aggiorna da sola.
7. **Aspetta i controlli automatici e, se sono verdi, unisci tu la PR** (squash; se era in bozza, prima segnala che è pronta) e, dove il merge pubblica qualcosa (lo dice «Questo repository»), verifica che la pubblicazione parta e finisca (scheda Actions). Dove il merge non pubblica nulla, non lanciare a mano i workflow di pubblicazione. Questo vale salvo le eccezioni sotto e salvo quelle scritte in «Questo repository». Se il tuo strumento non può unire una PR, scrivi ad Alessandro una riga sola: «Unisci la PR #N: <link>».
8. **Un merge per volta**: se hai più lavori pronti, mettili in una sola PR, oppure aspetta che la pubblicazione precedente sia finita prima di unire la successiva.
9. **Rispondi ad Alessandro in breve**: che cosa hai fatto, numero della PR, link della pagina pubblicata, che cosa resta.

### Quando ChatGPT non unisce e si ferma

- I controlli automatici sono rossi e non sai correggerli: lascia la PR aperta e scrivi il problema in «Domande».
- Il lavoro richiede credenziali, spese, invii a persone o enti (email, messaggi), cancellazioni definitive o post sui social fuori dalle automazioni già previste.
- L'istruzione è ambigua su un fatto (dato, data, nome, norma): non indovinare, scrivi la domanda e fai il resto.
- Lo dice una regola di «Questo repository».

### Regole che valgono sempre

- **Mai commit diretti su `main`**: sempre ramo + PR, salvo che Alessandro lo chieda espressamente per quella modifica.
- **Mai dati inventati**: nomi, numeri, date, norme, recapiti si scrivono solo se verificati su una fonte. Se mancano, resta un campo «[da compilare]» o una domanda in bacheca.
- **Mai segreti nel repository** (password, token, chiavi).
- **Ogni lavoro è a firma di Alessandro Cuollo** — o del suo nominativo radioamatoriale **IU0QVW**, dove è d'uso — e in nessun caso deve apparire che sia stato fatto da un'intelligenza artificiale, «mai e poi mai» (istruzione del 13/10/2026, che estende a tutti i repository la regola nata in `sito-pc-genzano`). In pratica: identità git `Alessandro Cuollo <65465537+SviluppoItaliaDigitale@users.noreply.github.com>` su ogni commit (`bash scripts/imposta-identita-git.sh`, presente in ogni repository, la imposta e attiva l'hook `.githooks/commit-msg`, che toglie dal messaggio le righe `Co-authored-by` e quelle di sessione); nessun nome di strumenti nei messaggi di commit, nei titoli, nei testi e nei commenti delle PR, nei file pubblicati, nei metadati e nelle immagini; i commit arrivati su un ramo con un altro autore si riscrivono a nome di Alessandro prima di unire (`passa-a.py chiudi` lo fa da sé e toglie dalla PR gli eventuali commenti dello strumento); il merge è sempre squash con messaggio scritto a mano, così su `main` l'autore è Alessandro. Unica eccezione: i file di governo interni, non pubblicati (`CLAUDE.md`, `AGENTS.md`, `.claude/`, questa bacheca), che parlano necessariamente degli strumenti. Regola completa in `.claude/rules/firma-dei-lavori.md`, uguale in tutti i repository.
- **Italiano corretto e chiaro** in file, commit e PR.
- **Non cancellare quello che ha scritto l'altra**: si risponde sotto o si archivia con una riga di esito.

### Formato delle voci

- **Richiesta**: `- **AAAA-MM-GG — da <chi> a <chi> — <titolo>**` e sotto: che cosa serve, quali file, quali controlli, dove si pubblica. Chi la prende scrive accanto «presa da …, PR #N»; a lavoro pubblicato la sposta in «Archiviati» con l'esito (per i passaggi preparati da Claude lo fa `passa-a.py chiudi`).
- **Avviso**: `- **GG/MM/AAAA — <chi>.** testo`, in cima alla sezione «Avvisi». Serve quando un lavoro riguarda anche l'altra sessione (file rifatti, script cambiati, file generati da rigenerare).
- **Domanda**: in «Domande». Chi la legge risponde sotto, alla prima occasione.
- **Consegna di fine sessione**: chi chiude una sessione con lavoro a metà scrive in «Lavori in corso» che cosa resta, su quale ramo e in quale PR, così l'altra può riprenderlo: da quel momento il ramo passa all'altra sessione, e chi l'ha consegnato non ci fa più push finché non lo riceve indietro con una nuova consegna.

### Passaggio a ChatGPT — preparato da Claude, avviato da Alessandro, chiuso da Claude (dal 13/10/2026)

Claude non aspetta che Alessandro scriva «guarda la bacheca»: quando decide che un lavoro va a ChatGPT, lo prepara da sola e lo richiude da sola. Istruzioni di Alessandro del 13/10/2026: «devi essere te in automatico a creare le istruzioni, aprire l'intelligenza artificiale idonea, fargli fare le cose e andare a pubblicare»; «valuta te i casi in cui deve essere utilizzato»; «considera che hai un amico a disposizione a darti una mano, e tu gli devi dire esattamente cosa deve fare».

**Perché ci sono due gesti a mano, e solo quelli.** Il canale automatico — il commento `@codex esegui la richiesta nella descrizione` sulla pull request in bozza — per l'account di Alessandro non funziona: con gli ambienti cloud pubblicati per tutti e cinque i repository, Codex risponde comunque «To use Codex here, create an environment for this repo» (difetto aperto di OpenAI sul canale delle pull request, openai/codex #20093, verificato il 13/10/2026 su pull request nuove in tre repository; la documentazione di Codex descrive ormai quel comando come avvio di una chat cloud «legacy»). Le vie a pagamento (azione GitHub con chiave API) sono escluse: decisione di Alessandro dello stesso giorno, «zero spese». Resta Codex Cloud, dove il lavoro lo avvia chi lo chiede e, a lavoro finito, chi lo ha avviato apre la pull request («Review changes and test results before committing or opening a pull request», documentazione ufficiale). Quindi i gesti a mano sono due, entrambi di Alessandro: **l'avvio** (un copia-incolla) e **la consegna** (il pulsante «Create PR» del task). Sono l'eccezione dichiarata alla regola `.claude/rules/autonomia.md` («io non devo fare nulla»); tutto il resto — richiesta, ramo, pull request, testo di avvio, controllo del risultato, firma, merge, deploy, bacheca — resta a Claude. Quando il canale automatico tornerà a funzionare si torna all'avvio dal commento senza cambiare nient'altro: `passa-a.py nuovo --con-codex` lascia anche il commento di avvio, e serve a riprovarlo senza spendere nulla.

**Che cosa fa Claude, prima.** Decide che il lavoro va a ChatGPT (criteri sotto), scrive la richiesta completa (sette parti, sotto) e lancia `python3 scripts/passa-a.py nuovo --argomento <slug> --titolo "…" --brief <file>` (script uguale in tutti i repository; `modello` stampa lo schema): apre il ramo `chatgpt/<argomento>-AAAAMMGG` da `main` aggiornato, scrive la voce in «Richieste» (nota «preparata da Claude, da avviare a mano in Codex Cloud», numero della pull request, ramo, la nota sull'avvio a mano e la richiesta), apre la **pull request in bozza** con la stessa richiesta nella descrizione (senza nomi di strumenti: lo script si rifiuta di aprirla se ne trova uno) e stampa il **testo di avvio**: un'intestazione di poche righe (repository, pull request, ramo, «non toccare la bacheca, non unire, riassumi alla fine») seguita dalla richiesta intera. Claude lo riporta ad Alessandro in chat, pronto da copiare; se la sessione finisce, `passa-a.py riavvia --pr N` lo ristampa quando serve. Intanto Claude fa il resto del lavoro.

**Che cosa fa Alessandro: due gesti.** (1) **Avvio**: apre chatgpt.com/codex, sceglie l'ambiente del repository e, se il selettore lo offre, il ramo `chatgpt/…` della pull request (altrimenti va bene il principale: il testo di avvio contiene già tutta la richiesta); incolla il testo di avvio e avvia. (2) **Consegna**: quando Codex ha finito, preme «Create PR» nel task. Niente altro: non scrive istruzioni, non controlla, non unisce.

**Che cosa fa Codex, durante.** Lavora sul ramo da cui è partito il task, esegue la richiesta punto per punto, fa i controlli indicati e alla fine riassume che cosa ha fatto, che cosa resta e perché. Non tocca `COORDINAMENTO.md` (l'esito in bacheca lo scrive chi chiude, così il lavoro non entra in conflitto con la voce) e non unisce nulla. Il suo contenitore non legge la pull request e la sua rete può essere limitata: per questo il testo di avvio porta la richiesta intera e non rimanda né alla bacheca né a pagine esterne.

**Che cosa fa Claude, dopo.** `passa-a.py stato` dice che cosa è arrivato: «CONSEGNA NELLA PR #M» (la pull request aperta dal task dopo la preparazione, riconosciuta dal ramo di base, dal nome del ramo preparato o dal numero della pull request), «POSSIBILE CONSEGNA NELLA PR #M» (aperta dopo la preparazione con il solo titolo della richiesta, che può coincidere per caso, o da un ramo `codex/…` senza altri segni: si riconosce guardandola) oppure «HA FATTO PUSH» se il lavoro arriva direttamente sul ramo. Claude controlla il risultato (immagini rese e guardate, controlli del repository, niente dati inventati né riferimenti allo strumento); se non va bene **continua direttamente** sul ramo e corregge o rifà, senza rimandare indietro (ogni giro costa crediti): per correggere il lavoro arrivato in una pull request di consegna, prima lo porta nel ramo con `passa-a.py chiudi --pr N --consegna M --senza-merge`, che non unisce, lascia la pull request in bozza e la voce in «Richieste», aggiorna la copia locale del ramo e stampa i passi per correggere. Poi `passa-a.py chiudi --pr N --consegna M`: porta il lavoro della pull request #M nel ramo preparato e la chiude come assorbita con un titolo neutro; riscrive a nome di Alessandro i commit con un altro autore e toglie i trailer; porta nel ramo le novità di `main` con un commit di merge (mai rebase; un conflitto ferma lo script e si risolve a mano); sposta la voce di bacheca in «Archiviati» con la riga di esito; segna la pull request pronta, aspetta i controlli verdi, unisce (squash con messaggio scritto, un merge per volta), toglie dalle due pull request gli eventuali commenti dello strumento (i rapporti di `github-actions[bot]` restano; dalle sessioni cloud, dove il canale di GitHub non lascia cancellare, commenti e ramo li toglie il workflow `rimuovi-firma-strumento.yml` alla chiusura della pull request) e, dove il repository ha `deploy.yml`, aspetta che il deploy del merge finisca bene: un deploy fallito ferma lo script, perché il sito non è aggiornato. Se la sessione è finita, chiude la routine giornaliera. Se dopo un giorno dalla preparazione non è arrivato nulla, Claude chiede ad Alessandro se l'ha avviata o se manca solo «Create PR»; se l'ha avviata e Codex non ha consegnato, o se ha risposto che i crediti sono finiti, Claude fa il lavoro da sola e lo scrive in bacheca.

**Ambienti cloud.** Gli ambienti di Codex Cloud (chatgpt.com/codex/cloud/settings/environments: uno per repository, creati e pubblicati da Alessandro dal PC, visibili «Solo io», l'unica scelta che l'account personale offre) esistono per tutti e cinque i repository dal 13/10/2026: Codex Cloud ci lavora dentro. Non serve altro; `passa-a.py stato` segnala comunque come «CANALE AUTOMATICO MUTO» la risposta «create an environment», se arriva a un commento di avvio.

**Che cosa contiene la richiesta, sempre.** ChatGPT lavora bene solo con istruzioni esatte, e in Codex Cloud non può fare domande: tutto ciò che gli serve sta nella richiesta, verificato prima da Claude. Sette parti, nell'ordine (`passa-a.py modello` le stampa): (1) **obiettivo** in una frase, e a che cosa serve; (2) **file** da creare o modificare, con il percorso esatto; (3) **che cosa fare**, passo per passo, con i dati già verificati (numeri, nomi, date, misure, testi): niente da cercare, niente da indovinare; (4) **vincoli** del repository che valgono per quel lavoro (regole, licenze, misure, accessibilità, niente riferimenti allo strumento nei file e nei commit); (5) **controlli** da eseguire prima di consegnare, con i comandi esatti; (6) **consegna**: solo le modifiche ai file del punto 2, messaggi di commit in italiano senza nomi di strumenti, un riassunto finale con fatto / non fatto / perché, `COORDINAMENTO.md` non si tocca; (7) **che cosa non fare**: non unire, non segnare pronta nessuna pull request, non toccare altri file, non inventare dati mancanti. Una richiesta a cui manca una parte non si manda.

**Quando si passa un lavoro a ChatGPT.** Lo decide Claude caso per caso, con parsimonia: il piano ChatGPT ha crediti a consumo e ogni passaggio li usa (li usa anche la revisione automatica che Codex fa sulle pull request non in bozza, quindi la pull request preparata resta in bozza finché il lavoro non è finito, e più lavori piccoli si mettono in una richiesta sola). Si passa un lavoro quando:

- **serve andare live prima su più fronti**, soprattutto in emergenza o quando lo stesso contenuto esce su più siti: Claude tiene per sé la parte che richiede i gate editoriali e la comunicazione di allerta ed emergenza, e passa a ChatGPT le parti autonome che si possono specificare per iscritto (script e dati, controlli, audit, materiali di supporto, adattamenti di cose già fatte), così lavorano in parallelo invece che in fila;
- **è un lavoro che ChatGPT sa fare bene e che non ha bisogno del giudizio della sessione**: l'aggiornamento degli interventi dall'export del gestionale, gli audit del sito, i controlli ripetitivi;
- **una sessione finisce con un lavoro urgente a metà** (emergenza, uscita programmata entro un giorno, Alessandro ha chiesto di andare live): oltre alla consegna in «Lavori in corso», Claude passa il ramo a ChatGPT con lo stesso meccanismo. Se non è urgente, scrive solo la consegna.

Se un lavoro non si può passare (sotto, «Che cosa non si passa»), o non si può fare in Codex Cloud (sotto, «Immagini»), lo fa Claude, se serve con più agenti in parallelo (regola `.claude/rules/autonomia.md`, uguale in tutti i repository: autonomia, lavoro diviso, agenti e skill creati quando servono, domande ad Alessandro nei dubbi).

**Immagini.** Le illustrazioni **SVG** le fa Claude (istruzione di Alessandro del 13/10/2026): sono codice, le rende e le guarda prima di pubblicarle; le passa a ChatGPT solo per lavorare in parallelo, con la richiesta completa (misure, contenuto riquadro per riquadro, testi, vincoli). Le **immagini raster** (foto, locandine, grafiche PNG o JPG) non si passano a ChatGPT, perché Codex non ha il generatore di immagini: le fa Claude con i propri strumenti — i generatori del repository (cover, immagini social, fascia blu), gli SVG resi in PNG, i connettori grafici disponibili nella sessione quando ci sono, le foto con licenza libera — e le controlla prima del commit come ogni immagine. Se un'immagine non si può fare in nessuno di questi modi, Claude sceglie l'alternativa migliore (per esempio un'illustrazione al posto di una foto) e lo scrive nella pull request. Nessun passaggio a mano per Alessandro.

**Che cosa non si passa.** Allerte ed emergenze vere, articoli nuovi che devono passare dai gate editoriali, pagine legali, lavori che richiedono credenziali, spese o invii a persone: restano a Claude o ad Alessandro, come in «Quando ChatGPT non unisce e si ferma».

**Gemini.** Lo stesso schema varrà per Jules (etichetta `jules` su una issue) quando Alessandro avrà autorizzato l'app sui repository; fino ad allora i lavori che sarebbero andati a Gemini li fa Claude o passano a ChatGPT.

<!-- PROTOCOLLO-COMUNE:FINE -->

## Questo repository: cooprimavera

Il merge su `main` pubblica www.cooprimavera.com in 1–2 minuti (workflow «Pubblica su Aruba (LIVE)»). Come è fatto il sito: `README.md`. Stato dei lavori e cose in sospeso: `docs/stato-lavori.md`. Social (Facebook e Instagram via API Meta): `docs/social-meta.md`. Regole: `.claude/rules/` (in particolare `social.md` e `grafica.md`).

### Controlli prima di unire una PR

- `hugo` (versione extended) senza errori.
- Pagine nuove o cambiate: front matter completo (`titolo_seo`, `description` entro 160 caratteri, `immagine` e `alt_immagine`); recapiti presi da `[params]` di `hugo.toml`, mai scritti a mano.
- Grafiche: logo ben visibile sulla fascia chiara, foto vere prima di quelle gratuite, mai segnaposto pubblicati (`.claude/rules/social.md`). Rendile e guardale prima di usarle.
- Dopo il deploy apri la pagina live e dai ad Alessandro il link.

### Passaggi a ChatGPT in questo repository

- Li prepara Claude con `python3 scripts/passa-a.py nuovo` (ramo `chatgpt/…`, voce in bacheca, PR in bozza, testo di avvio con la richiesta intera); li avvia Alessandro in Codex Cloud incollando il testo di avvio e, a lavoro finito, premendo «Create PR» nel task (i soli due gesti a mano); li controlla Claude con `passa-a.py stato` e li chiude con `passa-a.py chiudi --pr N --consegna M` (pull request di consegna portata nel ramo e chiusa con titolo neutro, commit riscritti a nome di Alessandro se serve, voce di bacheca archiviata con l'esito, PR pronta, controlli verdi, squash merge). Dettagli e criteri nel protocollo comune, § «Passaggio a ChatGPT».
- Titolo e descrizione della PR descrivono il lavoro senza nomi di strumenti (lo script si rifiuta di aprirla se ne trova uno); la richiesta per esteso sta in questa bacheca e nel testo di avvio. Codex non tocca la bacheca: l'esito lo scrive `chiudi`. Il commento `@codex …` resta solo per riprovare il canale automatico (`nuovo --con-codex`, `riavvia --con-codex`): `chiudi` lo toglie insieme alle risposte dello strumento. Le revisioni automatiche di Codex sulle PR pronte restano visibili (una revisione del bot non si può cancellare, a differenza dei commenti): dipendono da un'impostazione di Codex che solo Alessandro può cambiare, e per ora ha scelto di lasciarle (13/10/2026).
- Il merge su `main` pubblica il sito (`deploy.yml`): dopo `chiudi` si verifica che il deploy parta e finisca. Per grafiche e testi dei social resta la regola di `.claude/rules/social.md`: si fanno vedere ad Alessandro prima di pubblicare. Se la sessione che ha preparato il passaggio non lo chiude, lo chiude la prima sessione di Claude che apre questo repository, oppure la routine quotidiana di allineamento dei repository (`passa-a.py stato` → controllo del risultato → `chiudi`).

### Quando qui ChatGPT non unisce

- **Grafiche e testi per i social**: per regola di Alessandro si fanno vedere a lui prima di programmarli o pubblicarli. Prepara tutto sul ramo, mostragli il risultato e unisci solo dopo il suo «approvo» (vale anche se il lavoro l'ha chiesto Claude).
- Pubblicazioni o cancellazioni sui social fuori dal calendario già approvato (`social/calendario.json`).
- Dati della cooperativa (visura, statuto, bilanci): solo date e fatti pubblici, mai codici fiscali, nomi dei soci, cifre di bilancio.

## Domande

- Nessuna domanda aperta.

## Lavori in corso

- Vedi `docs/stato-lavori.md` § «Da decidere / da fare» (aggiornato al 3/10/2026). Nessun ramo a metà al 11/10/2026.

## Richieste

- Nessuna richiesta aperta.

## Avvisi

- **14/10/2026 — Claude.** Protocollo aggiornato in tutti e cinque i repository (§ «Passaggio a ChatGPT» del protocollo comune): il passaggio è «preparato da Claude, avviato da Alessandro, chiuso da Claude», perché il canale `@codex` sulle pull request resta muto per il suo account. `passa-a.py nuovo` non manda più il commento di avvio (resta con `--con-codex`, per riprovare il canale senza spese) e stampa il testo di avvio, con la richiesta intera, da incollare in Codex Cloud; a lavoro finito Alessandro preme «Create PR» nel task; `stato` riconosce la pull request di consegna, `chiudi --consegna M` la porta nel ramo e la chiude, e `chiudi` archivia da sé la voce di bacheca con l'esito. Codex non tocca più la bacheca.
- **13/10/2026 — ambienti cloud pubblicati, canale `@codex` muto.** Gli ambienti cloud per i passaggi automatici esistono per tutti e cinque i repository (uno per repository, creati e pubblicati da Alessandro dal PC), ma il comando `@codex` sulle pull request risponde comunque «create an environment for this repo»: è un difetto aperto di OpenAI sul canale delle PR (openai/codex #20093), verificato anche su PR nuove in tre repository, e sulla pagina dell'ambiente l'unica visibilità possibile con l'account personale è «Solo io». Decisione di Alessandro: nessuna spesa (niente azione GitHub con chiave API); i lavori di prova di oggi li chiude Claude da sola; in seguito, quando serve, Codex lo avvia Alessandro a mano in Codex Cloud sulla PR preparata da Claude, e il protocollo si aggiorna di conseguenza.
- **11/10/2026 — Claude.** Creata la bacheca con il protocollo comune. ChatGPT può lavorare fino alla pubblicazione sul sito; per i social resta l'approvazione di Alessandro.

## Archiviati

- **2026-10-13 — da Claude a ChatGPT — Bacheca: avviso sugli ambienti cloud pubblicati** (passata in automatico; PR #30; ramo `chatgpt/avviso-ambienti-cloud-20261013`) — **fatta, PR #30**
  - **Esito (14/10/2026).** Unita il 13/10/2026 con la PR #30: l'avviso l'ha scritto Claude sul ramo preparato, perché il canale automatico non partiva. Voce archiviata il 14/10/2026, con il passaggio al protocollo «preparato da Claude, avviato da Alessandro, chiuso da Claude».
  - **Esito (13/10/2026, Claude).** Codex non ha risposto («create an environment for this repo», con gli ambienti già pubblicati: difetto aperto di OpenAI, openai/codex #20093). L'avviso l'ha scritto Claude sullo stesso ramo, con il testo aggiornato ai fatti (ambienti pubblicati ma canale muto), e la PR si chiude con `passa-a.py chiudi`.
  - **1. Obiettivo.**
    Lasciare in bacheca l'avviso che da oggi i passaggi automatici possono partire in tutti e cinque i repository, perché gli ambienti cloud sono stati pubblicati; serve a chi apre la bacheca nei prossimi giorni.
  - **2. File.**
    COORDINAMENTO.md
  - **3. Che cosa fare.**
    1. In `COORDINAMENTO.md`, nella sezione `## Avvisi`, aggiungi **in cima all'elenco** (prima delle voci già presenti, dopo l'eventuale riga introduttiva) questa riga esatta:

    `- **13/10/2026 — ambienti cloud pubblicati.** Da oggi gli ambienti cloud per i passaggi automatici esistono per tutti e cinque i repository (uno per repository, creati e pubblicati da Alessandro dal PC): il commento di avvio sulle pull request in bozza fa partire il lavoro. Prima di questa data i passaggi restavano fermi con la risposta «create an environment for this repo».`

    Non toccare altro nel file.
  - **4. Vincoli.**
    - Nessun riferimento a strumenti automatici nel messaggio di commit e nel commento sulla pull request.
    - Identità dei commit: `Alessandro Cuollo <65465537+SviluppoItaliaDigitale@users.noreply.github.com>` (eseguire `bash scripts/imposta-identita-git.sh` prima del commit).
    - Messaggio di commit in italiano.
  - **5. Controlli.**
    Prima del push, con esito atteso:
    - `grep -c "ambienti cloud pubblicati" COORDINAMENTO.md` → `1`.
    - `git diff --stat` → solo `COORDINAMENTO.md`.
  - **6. Consegna.**
    - Un commit sul ramo di questa pull request, messaggio: `Bacheca: avviso sugli ambienti cloud pubblicati`.
    - Nella stessa `COORDINAMENTO.md`, § «Richieste», sotto la voce con questo stesso titolo, aggiungi la riga `  - **Esito (13/10/2026).** Fatto: avviso aggiunto.` (oppure che cosa non è riuscito e perché).
    - Un commento breve sulla pull request: fatto / non fatto / perché.
  - **7. Che cosa non fare.**
    - Non unire la pull request, non segnarla pronta, non aprirne altre.
    - Non modificare altre sezioni della bacheca né altri file.
    - Se qualcosa non torna, scriverlo nel commento sulla pull request invece di inventare.

