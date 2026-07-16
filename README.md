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

- `content/` — pagine in Markdown (servizi, chi siamo, preventivo, lavora con noi…)
- `layouts/` — template HTML (partial in `layouts/_partials/`)
- `assets/` — CSS e immagini elaborate da Hugo
- `static/` — file copiati così come sono (favicon, `.htaccess` con i redirect 301 dal vecchio sito)
- `hugo.toml` — configurazione: recapiti (telefono, WhatsApp, email), sedi, social e menu sono centralizzati nei `[params]`
