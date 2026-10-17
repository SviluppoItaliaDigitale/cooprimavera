#!/usr/bin/env python3
"""Salute del sito: trova le automazioni in errore e tiene aggiornata una sola issue.
Usato da .github/workflows/salute-sito.yml; si chiude da sola quando tutto è verde.

In errore sono: i workflow il cui ultimo run concluso su main è fallito, e i run falliti
nelle ultime 24 ore (su qualunque ramo) non ancora superati da un run riuscito dello stesso
workflow sullo stesso ramo. Il workflow che esegue questo script è escluso.
Istruzione di Alessandro del 17/10/2026: nessun guasto deve restare ignorato.

Variabili: GH_REPO (proprietario/nome), GH_TOKEN, ESCLUDI (percorso del workflow da saltare).
"""
import hashlib
import json
import os
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

REPO = os.environ["GH_REPO"]
ESCLUDI = os.environ.get("ESCLUDI", ".github/workflows/salute-sito.yml")
TITOLO = "Salute del sito: automazioni in errore"
FALLITO = {"failure", "timed_out", "startup_failure"}
NEUTRO = {"skipped", "cancelled", "neutral", "stale", "action_required"}


def gh(*argomenti, entrata=None):
    r = subprocess.run(["gh", *argomenti], capture_output=True, text=True, input=entrata)
    if r.returncode:
        sys.exit(f"gh {' '.join(argomenti[:2])}: {r.stderr.strip()}")
    return r.stdout


def api(percorso):
    return json.loads(gh("api", f"repos/{REPO}/{percorso}"))


def riga(run, perche):
    ora = run["created_at"].replace("T", " ")[:16]
    return (f"- **{run['name']}** — {perche} (ramo `{run['head_branch']}`, {run['event']}, "
            f"{ora} UTC): [log]({run['html_url']})")


def guasti():
    voci = {}
    for wf in api("actions/workflows?per_page=100")["workflows"]:
        if wf["path"] == ESCLUDI or wf["state"] != "active" or not Path(wf["path"]).exists():
            continue
        runs = api(f"actions/workflows/{wf['id']}/runs?branch=main&status=completed&per_page=30")
        ultimo = next((r for r in runs["workflow_runs"] if r["conclusion"] not in NEUTRO), None)
        if ultimo and ultimo["conclusion"] in FALLITO:
            voci[f"main:{wf['path']}"] = riga(ultimo, "l'ultimo run su main è fallito")

    da = (datetime.now(timezone.utc) - timedelta(hours=24)).strftime("%Y-%m-%dT%H:%M:%SZ")
    uscita = gh("api", "--paginate", "--jq", ".workflow_runs[] | tojson",
                f"repos/{REPO}/actions/runs?created=%3E%3D{da}&per_page=100")
    recenti = [json.loads(x) for x in uscita.splitlines() if x.strip()]
    for r in recenti:
        if r["path"] == ESCLUDI or r["conclusion"] not in FALLITO:
            continue
        superato = any(a["path"] == r["path"] and a["head_branch"] == r["head_branch"]
                       and a["created_at"] > r["created_at"] and a["conclusion"] == "success"
                       for a in recenti)
        chiave = f"main:{r['path']}" if r["head_branch"] == "main" else f"{r['head_branch']}:{r['path']}"
        if not superato and chiave not in voci:
            voci[chiave] = riga(r, "run fallito nelle ultime 24 ore")
    return dict(sorted(voci.items()))


def issue_aperta():
    trovate = json.loads(gh("issue", "list", "-R", REPO, "--state", "open", "--search",
                            f'"{TITOLO}" in:title', "--json", "number,title,body"))
    return next((i for i in trovate if i["title"] == TITOLO), None)


def main():
    voci = guasti()
    firma = hashlib.sha256("\n".join(voci).encode()).hexdigest()[:16]
    aperta = issue_aperta()
    if not voci:
        print("Tutte le automazioni sono verdi.")
        if aperta:
            gh("issue", "close", str(aperta["number"]), "-R", REPO, "--comment",
               "Tutte le automazioni sono tornate verdi: chiusa in automatico.")
        return 0

    corpo = "\n".join([
        f"Le automazioni qui sotto sono in errore ({len(voci)}). Ognuna va letta nel log e "
        "riparata nella causa, non solo rilanciata.", "", *voci.values(), "",
        "Questa issue si aggiorna ogni giorno e si chiude da sola quando tutto è verde.",
        f"<!-- firma: {firma} -->"])
    print(corpo)
    if not aperta:
        gh("issue", "create", "-R", REPO, "--title", TITOLO, "--label", "automazione",
           "--label", "fonte-rotta", "--body-file", "-", entrata=corpo)
    elif f"<!-- firma: {firma} -->" not in (aperta["body"] or ""):
        gh("issue", "edit", str(aperta["number"]), "-R", REPO, "--body-file", "-", entrata=corpo)
        gh("issue", "comment", str(aperta["number"]), "-R", REPO, "--body",
           f"L'elenco delle automazioni in errore è cambiato: ora sono {len(voci)}.")
    else:
        print("Elenco invariato: nessun aggiornamento della issue.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
