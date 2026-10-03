# Strumenti del progetto

Registro degli strumenti creati per questo repo (vedi `.claude/rules/strumenti.md`).

| Nome | Scopo | Data | Origine |
|---|---|---|---|
| `scripts/gestione_social.py` + `.github/workflows/gestione-social.yml` («🛠️ Gestione social») | Gestione completa di pagina Facebook e Instagram da qualsiasi dispositivo: elenco post, statistiche, pubblicare, modificare, eliminare, commenti (leggere, rispondere, nascondere, eliminare), messaggi (leggere, rispondere), prova invisibile. Si avvia da Actions → Run workflow (anche app GitHub) o con un push di `.github/social/comando.json` su un ramo ≠ main (esito in `.github/social/esito.md`). Eliminare richiede `ELIMINA` | 03/10/2026 | Su misura (richiesta di Alessandro), solo libreria standard Python, Graph API Meta v23.0 |
