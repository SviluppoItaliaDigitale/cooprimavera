# Sito Cooprimavera

Nuovo sito web di **Cooprimavera Soc. Coop.** — multiservizi (pulizie professionali, sanificazioni, giardinaggio, portierato, allestimenti per eventi, disinfestazioni), Ariccia (RM).

- **Dominio:** https://www.cooprimavera.com
- **Hosting:** Aruba (pubblicazione via FTPS con GitHub Actions)
- **Generatore:** da definire (stesso modello dei siti Misericordia di Ariccia e Protezione Civile Genzano: Hugo)

## Struttura prevista

Il sito viene compilato da GitHub Actions e pubblicato su Aruba a ogni push su `main` (workflow `deploy.yml`, da attivare quando saranno configurati i secret `FTP_HOST`, `FTP_USERNAME`, `FTP_PASSWORD`).
