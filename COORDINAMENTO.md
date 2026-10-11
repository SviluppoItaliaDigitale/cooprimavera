# Bacheca di coordinamento — Cooprimavera

File interno: Hugo non lo pubblica. Lo usano Claude e ChatGPT per passarsi lavoro, istruzioni e avvisi. La prima parte è il protocollo comune a tutti i repository di Alessandro; la seconda riguarda solo questo repository.

<!-- PROTOCOLLO-COMUNE:INIZIO — testo identico in tutti i repository di Alessandro. Copia di riferimento: assistente-personale/COORDINAMENTO.md. Se lo cambi, cambialo in tutti e cinque i repository nello stesso lavoro. -->

## Protocollo comune Claude ⇄ ChatGPT (uguale in tutti i repository)

Valido dall'11/10/2026 in tutti i repository di Alessandro: `sito-pc-genzano`, `social-pc-genzano`, `sito-misericordia-ariccia`, `cooprimavera`, `assistente-personale`. Il file si chiama sempre `COORDINAMENTO.md` e sta sempre nella cartella principale del repository. Questa prima parte è identica ovunque; la seconda parte, «Questo repository», cambia da repository a repository.

### A che cosa serve

Claude (Claude Code) e ChatGPT (chat con connettore GitHub, Codex) lavorano sugli stessi repository. La bacheca è il posto dove si passano lavoro, istruzioni e avvisi, così Alessandro non deve copiare testi da una chat all'altra e il lavoro continua anche quando una delle due non è disponibile (per esempio quando Claude ha finito i crediti).

### Chi dà le istruzioni

- **Alessandro**: in chat o scrivendo una richiesta qui. Le sue istruzioni prevalgono su tutto il resto.
- **Claude o ChatGPT**: con una voce nella sezione «Richieste» di questo file, indirizzata all'altra.
- Le regole del repository (`CLAUDE.md`, `.claude/rules/`, `AGENTS.md`) valgono per entrambe: chi lavora le segue anche quando l'altra non c'è.

### Che cosa fa ChatGPT quando Alessandro scrive «guarda la bacheca» (o «continua il lavoro»)

ChatGPT lavora **in autonomia fino alla pubblicazione**, senza aspettare Claude:

1. **Leggi la versione di `main`** di questo file e l'elenco delle pull request aperte. Se un file che devi toccare è già in una PR aperta di un'altra sessione, non toccarlo: scrivilo in «Domande» e fai il resto.
2. **Prendi prima i lavori lasciati a metà** nella sezione «Lavori in corso», poi le richieste aperte indirizzate a ChatGPT (o a «chi è disponibile»), in ordine di data. Solo se entrambe le sezioni sono vuote rispondi in una riga: «Nessuna richiesta aperta per me in bacheca».
3. **Apri un ramo tuo** da `main` aggiornato: `chatgpt/<argomento>-AAAAMMGG` (o `codex/...`). Non riprendere il ramo di un'altra sessione, **salvo quando è indicato in «Lavori in corso»**: quel ramo, e la sua PR, sono passati a te e li continui lì.
4. **Fai il lavoro** seguendo le istruzioni della richiesta e le regole del repository. Leggi solo i file che servono a quel lavoro.
5. **Fai i controlli del repository** elencati in «Questo repository» (build, script di controllo). Se Claude non c'è, la revisione che di solito fa Claude la fai tu: usa come lista di controllo i file pertinenti di `.claude/agents/` se il repository li ha, altrimenti le regole di `CLAUDE.md`, `.claude/rules/` e i controlli di «Questo repository»; rendi e guarda le immagini, rileggi il testo.
6. **Nella stessa PR aggiorna questa bacheca**: accanto alla richiesta scrivi «fatta da ChatGPT, PR #N» e una riga su che cosa hai fatto; se una parte non si poteva fare, scrivi il motivo.
7. **Apri la PR verso `main`, aspetta i controlli automatici e, se sono verdi, uniscila tu** (squash) e, dove il merge pubblica qualcosa (lo dice «Questo repository»), verifica che la pubblicazione parta e finisca (scheda Actions). Dove il merge non pubblica nulla, non lanciare a mano i workflow di pubblicazione. Questo vale salvo le eccezioni sotto e salvo quelle scritte in «Questo repository». Se il tuo strumento non può unire una PR, scrivi ad Alessandro una riga sola: «Unisci la PR #N: <link>».
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
- **Niente riferimenti all'intelligenza artificiale** nei contenuti pubblicati; nei repository della Protezione Civile (`sito-pc-genzano`, `social-pc-genzano`) nemmeno nei messaggi di commit, nei titoli e nei testi delle PR.
- **Italiano corretto e chiaro** in file, commit e PR.
- **Non cancellare quello che ha scritto l'altra**: si risponde sotto o si archivia con una riga di esito.

### Formato delle voci

- **Richiesta**: `- **AAAA-MM-GG — da <chi> a <chi> — <titolo>**` e sotto: che cosa serve, quali file, quali controlli, dove si pubblica. Chi la prende scrive accanto «presa da …, PR #N»; a lavoro pubblicato la sposta in «Archiviati» con l'esito.
- **Avviso**: `- **GG/MM/AAAA — <chi>.** testo`, in cima alla sezione «Avvisi». Serve quando un lavoro riguarda anche l'altra sessione (file rifatti, script cambiati, file generati da rigenerare).
- **Domanda**: in «Domande». Chi la legge risponde sotto, alla prima occasione.
- **Consegna di fine sessione**: chi chiude una sessione con lavoro a metà scrive in «Lavori in corso» che cosa resta, su quale ramo e in quale PR, così l'altra può riprenderlo.

<!-- PROTOCOLLO-COMUNE:FINE -->

## Questo repository: cooprimavera

Il merge su `main` pubblica www.cooprimavera.com in 1–2 minuti (workflow «Pubblica su Aruba (LIVE)»). Come è fatto il sito: `README.md`. Stato dei lavori e cose in sospeso: `docs/stato-lavori.md`. Social (Facebook e Instagram via API Meta): `docs/social-meta.md`. Regole: `.claude/rules/` (in particolare `social.md` e `grafica.md`).

### Controlli prima di unire una PR

- `hugo` (versione extended) senza errori.
- Pagine nuove o cambiate: front matter completo (`titolo_seo`, `description` entro 160 caratteri, `immagine` e `alt_immagine`); recapiti presi da `[params]` di `hugo.toml`, mai scritti a mano.
- Grafiche: logo ben visibile sulla fascia chiara, foto vere prima di quelle gratuite, mai segnaposto pubblicati (`.claude/rules/social.md`). Rendile e guardale prima di usarle.
- Dopo il deploy apri la pagina live e dai ad Alessandro il link.

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

- **11/10/2026 — Claude.** Creata la bacheca con il protocollo comune. ChatGPT può lavorare fino alla pubblicazione sul sito; per i social resta l'approvazione di Alessandro.

## Archiviati

- Nessuna voce.
