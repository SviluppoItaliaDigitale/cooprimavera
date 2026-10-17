#!/usr/bin/env python3
"""Legge il rapporto di lychee e fa fallire il controllo su OGNI link rotto: 404 e 410 verso
qualunque sito, e file interni mancanti. Usato da .github/workflows/controllo-link.yml.

Istruzione di Alessandro del 17/10/2026: «gli errori 404 e simili non devono mai essere
ignorati e devono essere risolti... vale per tutti i link del sito». Timeout, errori 5xx e
blocchi anti-bot restano fuori: sono passeggeri e stanno comunque nel rapporto completo.
Adattato da scripts/check-404-istituzionali.py del sito della Protezione Civile di Genzano.

Uso:  python3 scripts/controlla-link-rotti.py lychee-report.md [corpo-issue.md]
Exit: 0 se nessun link rotto, 1 altrimenti. Con il secondo argomento scrive il testo
della issue «Link rotti sul sito» (solo se ci sono link rotti).
"""
import re
import sys

ESTERNO = re.compile(r"^\* \[(404|410)\] <(https?://[^>]+)>")
INTERNO = re.compile(r"^\* \[ERROR\] <file://[^>]*?/(?:public|pub)(/[^>]*)> .*File not found")
PAGINA = re.compile(r"^### Errors in (\S+)")


def leggi(percorso):
    """Restituisce {link: (codice, [pagine])} dei soli link rotti davvero."""
    rotti = {}
    pagina = "?"
    for riga in open(percorso, encoding="utf-8"):
        m = PAGINA.match(riga)
        if m:
            pagina = re.sub(r"^(?:.*?/)?(?:public|pub)/", "/", m.group(1)).removesuffix("index.html")
            continue
        m = ESTERNO.match(riga)
        if m:
            codice, link = m.groups()
        else:
            m = INTERNO.match(riga)
            if not m:
                continue
            codice, link = "file mancante", m.group(1)
        voce = rotti.setdefault(link, (codice, []))
        if pagina not in voce[1]:
            voce[1].append(pagina)
    return rotti


def main(rapporto, corpo=None):
    try:
        rotti = leggi(rapporto)
    except FileNotFoundError:
        print(f"Rapporto {rapporto} assente: il controllo non è stato eseguito.")
        return 1
    if not rotti:
        print("Nessun link rotto.")
        return 0
    righe = [f"Il controllo settimanale dei link ha trovato **{len(rotti)} link rotti** "
             "(404, 410 o file del sito mancante). Vanno corretti tutti: un link rotto è una "
             "promessa non mantenuta a chi legge.", "",
             "| Link | Esito | Pagine che lo contengono |", "|---|---|---|"]
    for link, (codice, pagine) in sorted(rotti.items()):
        righe.append(f"| {link} | {codice} | {', '.join(sorted(pagine))} |")
    righe += ["", "**Come si ripara.** Si cerca la pagina attuale sul sito di destinazione e la si "
              "verifica con una richiesta reale; poi si sostituisce l'indirizzo in tutti i file "
              "sorgente (`content/`, `layouts/`, `static/`, `assets/`, `hugo.toml`). Se la pagina "
              "non esiste più si punta alla sezione che la conteneva, oppure si toglie il link "
              "lasciando il testo. Mai un indirizzo costruito a indovinare.", "",
              "Questa issue si aggiorna a ogni controllo e si chiude da sola quando i link "
              "rotti sono zero."]
    testo = "\n".join(righe)
    print(testo)
    if corpo:
        with open(corpo, "w", encoding="utf-8") as f:
            f.write(testo + "\n")
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "lychee-report.md",
                  sys.argv[2] if len(sys.argv) > 2 else None))
