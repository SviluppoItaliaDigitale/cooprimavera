# Sito Cooprimavera

Sito web di **Cooprimavera Soc. Coop.** — multiservizi (pulizie professionali, sanificazioni, giardinaggio, portierato, allestimenti per eventi, disinfestazioni), Ariccia (RM).

- **Dominio:** https://www.cooprimavera.com
- **Hosting:** Aruba
- **Generatore:** [Hugo](https://gohugo.io/) (versione extended, serve per le immagini WebP)

## Come si pubblica

La pubblicazione è **automatica**: a ogni push su `main`, il workflow
[`deploy.yml`](.github/workflows/deploy.yml) («Pubblica su Aruba (LIVE)»)
compila il sito con Hugo e carica i file via FTPS alla radice di
www.cooprimavera.com. In 1–2 minuti il sito online è aggiornato.
Il sito è live dal go-live del 2026-07-13.

- Per rilanciare un deploy a mano: GitHub → **Actions** → «Pubblica su Aruba (LIVE)» → **Run workflow**.
- Le credenziali FTP sono nei secret del repository (`FTP_HOST`, `FTP_USERNAME`, `FTP_PASSWORD`).

### Altri workflow (una tantum, avvio solo manuale)

- `verifica-ftp.yml` — test di collegamento FTPS ad Aruba.
- `backup-vecchio-sito.yml` — backup del vecchio sito come artifact (90 giorni), usato prima del go-live.
- `pulizia-vecchi-file.yml` — rimozione dei file del vecchio sito rimasti sull'hosting dopo il go-live.

## Sviluppo in locale

```sh
hugo server   # anteprima su http://localhost:1313
hugo          # compila il sito nella cartella public/
```

## Struttura

- `content/` — pagine in Markdown (servizi, zone servite, chi siamo, preventivo, lavora con noi…)
- `layouts/` — template HTML (partial in `layouts/_partials/`)
- `assets/` — CSS e immagini elaborate da Hugo
- `static/` — file copiati così come sono (favicon, `.htaccess` con i redirect 301 dal vecchio sito)
- `hugo.toml` — configurazione: recapiti (telefono, WhatsApp, email), sedi, social e menu sono centralizzati nei `[params]`

## SEO: come sono fatte le pagine

Ogni pagina ha nel front matter alcuni campi che governano titolo, anteprima e dati strutturati:

- `titolo_seo` — il `<title>` della pagina (se manca: «Titolo | Cooprimavera»). Tenerlo sotto i 60–70 caratteri e con la parola chiave e la zona.
- `description` — la meta description, entro 160 caratteri.
- `immagine` / `alt_immagine` — foto di testata (usata anche come anteprima social in JPEG 1200×630) e suo testo alternativo.
- `faq` — elenco di `domanda`/`risposta`: rende l'accordion «Domande frequenti» e lo schema FAQPage.
- `secondaria: true` + `genitore` — pagine servizio di approfondimento (es. pulizie uffici, pulizie condomini): non compaiono nelle griglie e nel footer, ma sono collegate dalla pagina «genitore».
- `noindex_sitemap: true` — esclude la pagina dalla sitemap (privacy e cookie).

I dati strutturati (`layouts/_partials/schema.html`) sono un unico JSON-LD per pagina con LocalBusiness/Organization, WebSite, WebPage, BreadcrumbList e, dove serve, Service, FAQPage e JobPosting (posizioni di «Lavora con noi», leggibili da Google Lavoro).

### Pagine di zona (`content/zone/`)

Una pagina per comune servito (Roma, Ariccia, Albano, Genzano, Velletri, Frascati, Marino, Castel Gandolfo, Ciampino), con testo specifico e FAQ: servono a comparire nelle ricerche «impresa di pulizie + comune». Per aggiungerne una basta creare un nuovo file `.md` nella cartella: compare da sola nel menu «Dove operiamo», nel footer, nella home e nei dati strutturati.

### Da fare fuori dal codice

- Registrare il sito su **Google Search Console** e inviare `https://www.cooprimavera.com/sitemap.xml`.
- Creare/aggiornare la **scheda Google Business Profile** (Ariccia) con gli stessi recapiti del sito e chiedere recensioni ai clienti: per le ricerche locali conta più di tutto.
- Verificare con il **Rich Results Test** di Google le pagine servizio e «Lavora con noi».
