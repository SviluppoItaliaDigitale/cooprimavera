#!/usr/bin/env python3
"""Controlla la cornice di microtesto e il testo alternativo dei post non ancora pubblicati.

Nasce il 21/10/2026, quando Alessandro ha chiesto di firmare ogni grafica con la cornice di microtesto («altrimenti
ci rubano la grafica»). Per ogni post di social/calendario.json dal 22/10/2026 in poi controlla:
  - il segno che social/grafiche/cornice.js scrive nel file (commento JPEG prima dei dati dell'immagine) nella
    grafica (static/social/<file>), nella miniatura (static/social/mini/<file>) e, se il post ha un video, nella
    copertina del video (static/social/video/<nome>.jpg);
  - il campo "alt" (testo alternativo dell'immagine): presente, non più di 1000 caratteri (limite di Instagram),
    che non comincia con «Immagine» (il lettore di schermo lo dice già) e che non nomina strumenti.

Uso, dalla radice del repository:
  python3 scripts/controlla-cornice.py               segno e testo alternativo
  python3 scripts/controlla-cornice.py --solo-segno  solo il segno (lo lancia social/grafiche/genera.js alla fine,
                                                     perché il testo alternativo si scrive dopo aver guardato la grafica)
  python3 scripts/controlla-cornice.py --prova       prova il controllo su file costruiti apposta
Esce con 1 se qualcosa manca o non va. Solo libreria standard.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

RADICE = Path(__file__).resolve().parent.parent
DAL = "2026-10-22"          # primo post con la cornice: quelli prima sono già usciti e restano come sono
LIMITE_ALT = 1000           # Instagram: «Alternative text, up to 1000 character, for an image»
# «AI» solo maiuscolo: in minuscolo «ai» è la preposizione articolata («ai bordi del prato»).
STRUMENTI = re.compile(r"\b(?:(?i:claude|chatgpt|codex|gemini|openai|anthropic|intelligenza artificiale)|AI)\b")


def segno() -> bytes:
    """Il segno si legge dal motore, così controllo e generatore non possono divergere."""
    testo = (RADICE / "social/grafiche/cornice.js").read_text(encoding="utf-8")
    m = re.search(r"const MARCATORE = '([^']+)'", testo)
    if not m:
        sys.exit("controlla-cornice: MARCATORE non trovato in social/grafiche/cornice.js")
    return m.group(1).encode()


def ha_segno(dati: bytes, s: bytes) -> bool:
    """Vero se un commento JPEG (FF FE) prima dei dati dell'immagine (FF DA) contiene il segno."""
    if dati[:2] != b"\xff\xd8":
        return False
    i = 2
    while i + 4 <= len(dati) and dati[i] == 0xFF:
        tipo = dati[i + 1]
        if tipo == 0xFF:            # byte di riempimento fra i segmenti
            i += 1
            continue
        if tipo == 0xDA:            # da qui in poi solo dati dell'immagine
            return False
        lung = int.from_bytes(dati[i + 2:i + 4], "big")
        if lung < 2:
            return False
        if tipo == 0xFE and s in dati[i + 4:i + 2 + lung]:
            return True
        i += 2 + lung
    return False


def problemi_alt(alt) -> list[str]:
    if not isinstance(alt, str) or not alt.strip():
        return ["manca il testo alternativo (campo \"alt\")"]
    p = []
    if len(alt) > LIMITE_ALT:
        p.append(f"testo alternativo di {len(alt)} caratteri, oltre il limite di {LIMITE_ALT}")
    if re.match(r"\s*immagine\b", alt, re.I):
        p.append("il testo alternativo comincia con «Immagine»: il lettore di schermo lo dice già")
    if STRUMENTI.search(alt):
        p.append(f"il testo alternativo nomina uno strumento («{STRUMENTI.search(alt).group(0)}»)")
    return p


def controlla(solo_segno: bool) -> int:
    s = segno()
    post = json.loads((RADICE / "social/calendario.json").read_text(encoding="utf-8"))["post"]
    errori, file_visti, post_visti = [], 0, 0
    for p in post:
        if p["data"] < DAL:
            continue
        post_visti += 1
        rifai = f"node social/grafiche/genera.js {p['data']}"
        da_vedere = [(RADICE / "static/social" / p["file"], rifai), (RADICE / "static/social/mini" / p["file"], rifai)]
        if p.get("video"):
            percorso = urlparse(p["video"]).path        # «https://www.cooprimavera.com/social/video/x.mp4» o «/social/…»
            copertina = RADICE / "static" / (percorso.lstrip("/")[:-4] + ".jpg")
            nome = Path(percorso).stem
            da_vedere.append((copertina, f"node social/video/genera.js {nome}, oppure solo la copertina con "
                                         f"node social/grafiche/genera.js --cornice {copertina.relative_to(RADICE)}"))
        for f, come in da_vedere:
            file_visti += 1
            if not f.exists():
                errori.append(f"{p['data']}: manca {f.relative_to(RADICE)}")
            elif not ha_segno(f.read_bytes(), s):
                errori.append(f"{p['data']}: {f.relative_to(RADICE)} non ha la cornice (rifalla con {come})")
        if not solo_segno:
            errori += [f"{p['data']}: {x}" for x in problemi_alt(p.get("alt"))]
    cosa = "segno della cornice" if solo_segno else "segno della cornice e testo alternativo"
    if errori:
        print(f"Controllo cornice: {len(errori)} problemi ({cosa}, post dal {DAL}):")
        for e in errori:
            print("  -", e)
        return 1
    print(f"Controllo cornice: tutto a posto ({cosa}; {post_visti} post dal {DAL}, {file_visti} file).")
    return 0


def prova() -> int:
    """Il controllo deve riconoscere il segno solo dove il generatore lo scrive, e rifiutare i casi sbagliati."""
    s = segno()
    app0 = b"\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
    com = lambda t: b"\xff\xfe" + (len(t) + 2).to_bytes(2, "big") + t  # noqa: E731
    sos = b"\xff\xda\x00\x08\x01\x01\x00\x00\x3f\x00" + b"\x12\x34\x56" + b"\xff\xd9"
    casi = [
        ("segno dopo l'intestazione JFIF", b"\xff\xd8" + app0 + com(s) + sos, True),
        ("segno senza intestazione JFIF", b"\xff\xd8" + com(s) + sos, True),
        ("segno con byte di riempimento", b"\xff\xd8" + app0 + b"\xff" + com(s) + sos, True),
        ("nessun commento", b"\xff\xd8" + app0 + sos, False),
        ("commento con un altro testo", b"\xff\xd8" + app0 + com(b"Misericordia di Ariccia") + sos, False),
        ("segno solo nei dati dell'immagine", b"\xff\xd8" + app0 + sos[:-2] + s + b"\xff\xd9", False),
        ("PNG con il segno", b"\x89PNG\r\n\x1a\n" + s, False),
        ("file troncato", b"\xff\xd8" + app0[:6], False),
    ]
    falliti = [n for n, dati, atteso in casi if ha_segno(dati, s) is not atteso]
    alt = [
        ("testo buono", "Foto di un prato rasato. Titolo: «Foglie: non lasciarle sul prato». In basso il logo di Cooprimavera.", 0),
        ("assente", None, 1),
        ("vuoto", "   ", 1),
        ("troppo lungo", "a" * 1001, 1),
        ("comincia con Immagine", "Immagine di un prato", 1),
        ("nomina uno strumento", "Grafica preparata con ChatGPT", 1),
        ("sigla AI", "Grafica fatta con l'AI", 1),
        ("parola che contiene «ai»", "Mani che raccolgono foglie ai bordi del prato", 0),
    ]
    falliti += [f"alt: {n}" for n, t, attesi in alt if len(problemi_alt(t)) != attesi]
    if falliti:
        print("Prova del controllo cornice: casi sbagliati:", "; ".join(falliti))
        return 1
    print(f"Prova del controllo cornice: {len(casi)} casi del segno e {len(alt)} del testo alternativo, tutti giusti.")
    return 0


if __name__ == "__main__":
    a = sys.argv[1:]
    sys.exit(prova() if "--prova" in a else controlla("--solo-segno" in a))
