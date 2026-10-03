# Strumenti del progetto

Registro degli strumenti creati per questo repo (vedi `.claude/rules/strumenti.md`).

| Nome | Scopo | Data | Origine |
|---|---|---|---|
| `scripts/gestione_social.py` + `.github/workflows/gestione-social.yml` («🛠️ Gestione social») | Gestione completa di pagina Facebook e Instagram da qualsiasi dispositivo: elenco post, statistiche, pubblicare, modificare, eliminare, commenti (leggere, rispondere, nascondere, eliminare), messaggi (leggere, rispondere), prova invisibile. Si avvia da Actions → Run workflow (anche app GitHub) o con un push di `.github/social/comando.json` su un ramo ≠ main (esito in `.github/social/esito.md`). Eliminare richiede `ELIMINA` | 03/10/2026 | Su misura (richiesta di Alessandro), solo libreria standard Python, Graph API Meta v23.0 |
| Azioni `esporta` ed `elimina-tutti` di «🛠️ Gestione social» | `esporta` salva testi, date, link, immagini e video di tutti i post FB e IG in `archivio-social/` (README.md + dati.json, anche come artifact); `elimina-tutti` cancella solo i post già archiviati, salta foto profilo/copertina, richiede `ELIMINA`. Per la ripartenza da zero dei social | 03/10/2026 | Su misura (richiesta di Alessandro), estende lo script esistente |
| Azioni `programma-calendario` e `pubblica-oggi` di «🛠️ Gestione social» | Pubblicano il calendario `social/calendario.json`: Facebook con la programmazione nativa (entro 74 giorni), Instagram il giorno stesso; niente doppioni | 03/10/2026 | Su misura (richiesta di Alessandro) |
| `social/grafiche/genera.js` | Genera le grafiche dei post (1080×1350) da `social/calendario.json` in `static/social/`; logo sempre sulla fascia chiara | 03/10/2026 | Su misura; Playwright già presente; caratteri Barlow (Google Fonts, licenza SIL OFL) |
