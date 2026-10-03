#!/usr/bin/env python3
"""Gestione completa della pagina Facebook e dell'account Instagram collegato.

Gira nel workflow «Gestione social»: si avvia a mano da GitHub (anche dall'app
sul telefono) oppure con un push del file `.github/social/comando.json` su un
ramo diverso da main. Legge il token della pagina dai secret, non lo stampa mai.

Azioni (variabile AZIONE, o campo "azione" del file comando):
  prova               crea, modifica ed elimina un post FB NON pubblicato; prepara
                      un contenitore IG senza pubblicarlo. Nulla diventa visibile.
  elenco              ultimi post di Facebook e Instagram con identificativi
  statistiche         follower e copertura di pagina e account Instagram
  pubblica            pubblica su RETE (fb o ig): TESTO, e IMMAGINE_URL (obbligatoria su ig)
  modifica            riscrive il testo di un post Facebook (ID, TESTO)
  elimina             elimina un post (RETE, ID; su ig va bene anche il permalink) — CONFERMA=ELIMINA
  commenti            commenti di un post (RETE, ID)
  rispondi-commento   risponde a un commento (RETE, ID del commento, TESTO)
  nascondi-commento   nasconde un commento (RETE, ID); con TESTO=mostra lo rende di nuovo visibile
  elimina-commento    elimina un commento (RETE, ID) — CONFERMA=ELIMINA
  messaggi            ultime conversazioni Messenger (fb) o Direct (ig)
  rispondi-messaggio  risponde in una conversazione (RETE, ID della conversazione, TESTO)
  esporta             salva testi, date, link, immagini e video di TUTTI i post FB e IG in
                      archivio-social/ (README.md + dati.json)
  elimina-tutti       elimina i post di RETE già presenti in archivio-social/dati.json; salta
                      foto profilo/copertina e post non archiviati — CONFERMA=ELIMINA

Limiti della piattaforma, non dello strumento: su Instagram la didascalia di un
post pubblicato non si modifica (si elimina e si ripubblica); su Facebook si
riscrive il testo ma non le immagini; ai messaggi si risponde entro 7 giorni
dall'ultimo messaggio ricevuto.
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

G = "https://graph.facebook.com/" + (os.environ.get("META_GRAPH_VERSION") or "v23.0")
PAGE_ID = os.environ.get("PAGE_ID", "").strip()
TOKEN = os.environ.get("PAGE_TOKEN", "").strip()
righe: list[str] = []


def scrivi(testo: str = "") -> None:
    print(testo, flush=True)
    righe.append(testo)


def chiama(metodo: str, percorso: str, **param) -> dict:
    param = {k: (json.dumps(v) if isinstance(v, (dict, list)) else v)
             for k, v in param.items() if v is not None}
    param["access_token"] = TOKEN
    dati = urllib.parse.urlencode(param)
    url = f"{G}/{percorso}"
    if metodo == "GET":
        req = urllib.request.Request(url + "?" + dati)
    else:
        req = urllib.request.Request(url, data=dati.encode(), method=metodo)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        try:
            return {"errore": json.loads(e.read().decode()).get("error", {}).get("message", f"HTTP {e.code}")}
        except Exception:
            return {"errore": f"HTTP {e.code}"}
    except (urllib.error.URLError, TimeoutError) as e:
        return {"errore": f"rete: {e}"}


def esci(msg: str) -> None:
    scrivi(f"**ERRORE:** {msg}")
    salva_esito()
    sys.exit(1)


def ig_id() -> str:
    r = chiama("GET", PAGE_ID, fields="instagram_business_account")
    i = (r.get("instagram_business_account") or {}).get("id")
    if not i:
        esci(f"nessun account Instagram collegato alla pagina ({r.get('errore', '')})")
    return i


def corto(t: str | None, n: int = 90) -> str:
    t = " ".join((t or "").split())
    return t if len(t) <= n else t[: n - 1] + "…"


def risolvi_ig(ident: str) -> str:
    """Accetta id o permalink; il permalink si risolve dal lato Facebook (stesso spazio di id)."""
    m = re.search(r"instagram\.com/(?:p|reel|tv)/([^/?#]+)", ident)
    if not m:
        return ident
    codice, dopo = m.group(1), None
    for _ in range(10):
        r = chiama("GET", f"{ig_id()}/media", fields="id,permalink", limit=100, after=dopo)
        for x in r.get("data", []):
            if f"/{codice}/" in (x.get("permalink") or ""):
                return x["id"]
        dopo = (r.get("paging") or {}).get("cursors", {}).get("after")
        if not dopo or not (r.get("paging") or {}).get("next"):
            break
    esci(f"permalink non trovato tra i contenuti dell'account: {ident}")
    return ""


def richiedi(nome: str, valore: str) -> str:
    if not valore:
        esci(f"manca il campo «{nome}»")
    return valore


def conferma(c: str) -> None:
    if c != "ELIMINA":
        esci("per eliminare scrivi ELIMINA nel campo conferma")


def esito(r: dict, ok: str) -> None:
    if "errore" in r:
        esci(r["errore"])
    scrivi(ok)


# --- azioni -----------------------------------------------------------------

def a_prova(**_):
    passi = []
    r = chiama("POST", f"{PAGE_ID}/feed", message="Prova tecnica (non pubblicata)", published="false")
    pid = r.get("id")
    passi.append(("FB: crea post non pubblicato", bool(pid), r.get("errore")))
    if pid:
        r = chiama("POST", pid, message="Prova tecnica modificata (non pubblicata)")
        passi.append(("FB: modifica testo", r.get("success") is True, r.get("errore")))
        r = chiama("DELETE", pid)
        passi.append(("FB: elimina", r.get("success") is True, r.get("errore")))
    i = ig_id()
    r = chiama("POST", f"{i}/media", caption="Prova tecnica",
               image_url="https://www.misericordia-ariccia.it/img/og-default.jpg")
    passi.append(("IG: prepara contenitore senza pubblicare", bool(r.get("id")), r.get("errore")))
    tutto = True
    for nome, buono, err in passi:
        scrivi(f"- {'✅' if buono else '❌'} {nome}" + (f" — {err}" if err else ""))
        tutto &= buono
    if not tutto:
        salva_esito()
        sys.exit(1)


def a_elenco(**_):
    r = chiama("GET", f"{PAGE_ID}/posts", fields="id,created_time,message,permalink_url,is_published", limit=10)
    scrivi("### Facebook — ultimi post")
    for x in r.get("data", []):
        scrivi(f"- `{x['id']}` {x.get('created_time', '')[:10]} — {corto(x.get('message'))} {x.get('permalink_url', '')}")
    if "errore" in r:
        scrivi(f"errore: {r['errore']}")
    r = chiama("GET", f"{ig_id()}/media", fields="id,timestamp,caption,permalink,media_type", limit=10)
    scrivi("### Instagram — ultimi post")
    for x in r.get("data", []):
        scrivi(f"- `{x['id']}` {x.get('timestamp', '')[:10]} {x.get('media_type', '')} — {corto(x.get('caption'))} {x.get('permalink', '')}")
    if "errore" in r:
        scrivi(f"errore: {r['errore']}")


def a_statistiche(**_):
    p = chiama("GET", PAGE_ID, fields="name,followers_count,fan_count")
    scrivi(f"### Facebook — {p.get('name', '')}")
    scrivi(f"- follower: {p.get('followers_count', '?')} · mi piace: {p.get('fan_count', '?')}")
    for metrica in ("page_impressions_unique", "page_post_engagements", "page_views_total"):
        r = chiama("GET", f"{PAGE_ID}/insights", metric=metrica, period="days_28")
        v = (((r.get("data") or [{}])[0].get("values") or [{}])[-1]).get("value") if r.get("data") else None
        scrivi(f"- {metrica} (28 giorni): {v if v is not None else 'non disponibile'}")
    i = ig_id()
    a = chiama("GET", i, fields="username,followers_count,media_count")
    scrivi(f"### Instagram — @{a.get('username', '')}")
    scrivi(f"- follower: {a.get('followers_count', '?')} · post: {a.get('media_count', '?')}")
    fine = int(time.time())
    for metrica in ("reach", "views", "profile_views"):
        r = chiama("GET", f"{i}/insights", metric=metrica, period="day", metric_type="total_value",
                   since=fine - 28 * 86400, until=fine)
        v = ((r.get("data") or [{}])[0].get("total_value") or {}).get("value") if r.get("data") else None
        scrivi(f"- {metrica} (28 giorni): {v if v is not None else 'non disponibile'}")


def a_pubblica(rete, testo, immagine, **_):
    if rete == "fb":
        if immagine:
            r = chiama("POST", f"{PAGE_ID}/photos", url=immagine, caption=testo)
        else:
            r = chiama("POST", f"{PAGE_ID}/feed", message=richiedi("testo", testo))
        esito(r, f"Pubblicato su Facebook: `{r.get('post_id') or r.get('id')}`")
    elif rete == "ig":
        i = ig_id()
        c = chiama("POST", f"{i}/media", image_url=richiedi("immagine_url", immagine), caption=testo)
        if "errore" in c:
            esci(c["errore"])
        for _ in range(20):
            s = chiama("GET", c["id"], fields="status_code")
            if s.get("status_code") == "FINISHED":
                break
            time.sleep(3)
        r = chiama("POST", f"{i}/media_publish", creation_id=c["id"])
        if "errore" in r:
            esci(r["errore"])
        link = chiama("GET", r["id"], fields="permalink").get("permalink", "")
        scrivi(f"Pubblicato su Instagram: `{r['id']}` {link}")
    else:
        esci("rete deve essere fb o ig")


def a_modifica(rete, ident, testo, **_):
    if rete == "ig":
        esci("Instagram non permette di modificare la didascalia di un post pubblicato: va eliminato e ripubblicato")
    esito(chiama("POST", richiedi("id", ident), message=richiedi("testo", testo)), f"Testo del post `{ident}` aggiornato")


def a_elimina(rete, ident, conf, **_):
    conferma(conf)
    ident = richiedi("id", ident)
    if rete == "ig":
        ident = risolvi_ig(ident)
    esito(chiama("DELETE", ident), f"Eliminato `{ident}` ({rete})")


def a_commenti(rete, ident, **_):
    ident = richiedi("id", ident)
    if rete == "ig":
        r = chiama("GET", f"{risolvi_ig(ident)}/comments", fields="id,text,username,timestamp,hidden", limit=50)
        for x in r.get("data", []):
            scrivi(f"- `{x['id']}` @{x.get('username', '')} {x.get('timestamp', '')[:16]}{' (nascosto)' if x.get('hidden') else ''} — {corto(x.get('text'), 200)}")
    else:
        r = chiama("GET", f"{ident}/comments", fields="id,message,from,created_time,is_hidden", limit=50, filter="stream")
        for x in r.get("data", []):
            scrivi(f"- `{x['id']}` {(x.get('from') or {}).get('name', '')} {x.get('created_time', '')[:16]}{' (nascosto)' if x.get('is_hidden') else ''} — {corto(x.get('message'), 200)}")
    if "errore" in r:
        esci(r["errore"])
    if not r.get("data"):
        scrivi("Nessun commento.")


def a_rispondi_commento(rete, ident, testo, **_):
    ident, testo = richiedi("id", ident), richiedi("testo", testo)
    r = chiama("POST", f"{ident}/replies" if rete == "ig" else f"{ident}/comments", message=testo)
    esito(r, f"Risposta pubblicata: `{r.get('id')}`")


def a_nascondi_commento(rete, ident, testo, **_):
    mostra = (testo or "").strip().lower() == "mostra"
    campo = "hide" if rete == "ig" else "is_hidden"
    r = chiama("POST", richiedi("id", ident), **{campo: "false" if mostra else "true"})
    esito(r, f"Commento `{ident}` {'di nuovo visibile' if mostra else 'nascosto'}")


def a_elimina_commento(rete, ident, conf, **_):
    conferma(conf)
    esito(chiama("DELETE", richiedi("id", ident)), f"Commento `{ident}` eliminato")


def a_messaggi(rete, **_):
    piatt = "instagram" if rete == "ig" else "messenger"
    r = chiama("GET", f"{PAGE_ID}/conversations", platform=piatt, limit=10,
               fields="id,updated_time,participants,messages.limit(3){message,from,created_time}")
    if "errore" in r:
        esci(r["errore"])
    for c in r.get("data", []):
        nomi = ", ".join(p.get("name") or p.get("username") or p.get("id", "") for p in (c.get("participants") or {}).get("data", []))
        scrivi(f"#### `{c['id']}` — {nomi} ({c.get('updated_time', '')[:16]})")
        for m in reversed((c.get("messages") or {}).get("data", [])):
            chi = (m.get("from") or {}).get("name") or (m.get("from") or {}).get("username", "")
            scrivi(f"- {m.get('created_time', '')[:16]} {chi}: {corto(m.get('message'), 200)}")
    if not r.get("data"):
        scrivi("Nessuna conversazione.")


def a_rispondi_messaggio(rete, ident, testo, **_):
    ident, testo = richiedi("id", ident), richiedi("testo", testo)
    io = {PAGE_ID}
    if rete == "ig":
        io.add(ig_id())
    c = chiama("GET", ident, fields="participants")
    altri = [p["id"] for p in (c.get("participants") or {}).get("data", []) if p.get("id") not in io]
    if not altri:
        esci(f"conversazione non trovata o senza destinatario ({c.get('errore', '')})")
    r = chiama("POST", f"{PAGE_ID}/messages", recipient={"id": altri[0]},
               message={"text": testo}, messaging_type="RESPONSE")
    esito(r, f"Messaggio inviato: `{r.get('message_id')}`")


ARCHIVIO = Path(os.environ.get("ARCHIVIO") or "archivio-social")
# Post di Facebook che non si toccano: cancellarli toglierebbe foto profilo o copertina.
INTOCCABILI = ("profile picture", "cover photo", "immagine del profilo", "foto del profilo", "foto di copertina", "immagine di copertina")


def tutte(percorso: str, **param) -> list[dict]:
    """Tutte le pagine di un elenco della Graph API."""
    dati, dopo = [], None
    for _ in range(100):
        r = chiama("GET", percorso, limit=100, after=dopo, **param)
        if "errore" in r:
            esci(r["errore"])
        dati += r.get("data", [])
        dopo = (r.get("paging") or {}).get("cursors", {}).get("after")
        if not dopo or not (r.get("paging") or {}).get("next"):
            break
    return dati


def scarica(url: str, nome: str) -> str | None:
    try:
        with urllib.request.urlopen(url, timeout=120) as r:
            tipo = r.headers.get("Content-Type", "")
            est = ".mp4" if "video" in tipo else ".png" if "png" in tipo else ".jpg"
            f = ARCHIVIO / (nome + est)
            f.parent.mkdir(parents=True, exist_ok=True)
            f.write_bytes(r.read())
            return str(f.relative_to(ARCHIVIO))
    except Exception as e:  # noqa: BLE001
        scrivi(f"- ⚠️ non scaricato {nome}: {e}")
        return None


def post_fb() -> list[dict]:
    return tutte(f"{PAGE_ID}/posts", fields="id,created_time,message,story,permalink_url,status_type,"
                 "attachments{media_type,url,target{id},media{image{src},source},subattachments{media_type,target{id},media{image{src},source}}}")


def media_fb(p: dict) -> list[str]:
    urls = []
    for a in (p.get("attachments") or {}).get("data", []):
        for x in [a] + (a.get("subattachments") or {}).get("data", []):
            m = x.get("media") or {}
            u = m.get("source") or (m.get("image") or {}).get("src")
            if u and u not in urls:
                urls.append(u)
    return urls


_protette: set[str] | None = None


def foto_protette() -> set[str]:
    """Foto profilo e copertina attuali della pagina (copertina degli album «profile» e «cover»)."""
    global _protette
    if _protette is None:
        _protette = {(a.get("cover_photo") or {}).get("id") for a in tutte(f"{PAGE_ID}/albums", fields="type,cover_photo")
                     if a.get("type") in ("profile", "cover")} - {None}
        c = chiama("GET", PAGE_ID, fields="cover{id}").get("cover") or {}
        if c.get("id"):
            _protette.add(c["id"])
    return _protette


def intoccabile(p: dict) -> bool:
    if any(k in (p.get("story") or "").lower() for k in INTOCCABILI):
        return True
    obiettivi = {(x.get("target") or {}).get("id") for a in (p.get("attachments") or {}).get("data", [])
                 for x in [a] + (a.get("subattachments") or {}).get("data", [])}
    return bool(obiettivi & foto_protette())


def a_esporta(**_):
    """Salva testi, date, link e immagini/video di tutti i post FB e IG in ARCHIVIO."""
    indice = {"fb": [], "ig": []}
    for p in post_fb():
        data = p.get("created_time", "")[:10]
        file = [f for n, u in enumerate(media_fb(p)) if (f := scarica(u, f"fb/{data}_{p['id']}_{n + 1}"))]
        indice["fb"].append({"id": p["id"], "data": data, "testo": p.get("message") or p.get("story") or "",
                             "link": p.get("permalink_url", ""), "file": file, "intoccabile": intoccabile(p)})
    for m in tutte(f"{ig_id()}/media", fields="id,timestamp,caption,permalink,media_type,media_url,thumbnail_url,"
                   "children{media_type,media_url,thumbnail_url}"):
        data = m.get("timestamp", "")[:10]
        pezzi = (m.get("children") or {}).get("data") or [m]
        file = []
        for n, x in enumerate(pezzi):
            for u in (x.get("media_url"), x.get("thumbnail_url") if x.get("media_type") == "VIDEO" else None):
                if u and (f := scarica(u, f"ig/{data}_{m['id']}_{n + 1}{'_copertina' if u == x.get('thumbnail_url') else ''}")):
                    file.append(f)
        indice["ig"].append({"id": m["id"], "data": data, "testo": m.get("caption") or "",
                             "link": m.get("permalink", ""), "tipo": m.get("media_type", ""), "file": file})
    ARCHIVIO.mkdir(parents=True, exist_ok=True)
    (ARCHIVIO / "dati.json").write_text(json.dumps(indice, ensure_ascii=False, indent=1), encoding="utf-8")
    md = [f"# Archivio social Cooprimavera ({time.strftime('%d/%m/%Y')})", "",
          "Copia di testi, date, link e immagini dei post prima della ripartenza da zero.", ""]
    for rete, nome in (("fb", "Facebook"), ("ig", "Instagram")):
        md += [f"## {nome} — {len(indice[rete])} post", ""]
        for x in sorted(indice[rete], key=lambda x: x["data"]):
            md.append(f"### {x['data']} — [{x['id']}]({x['link']})" + (" (foto profilo/copertina: non si cancella)" if x.get("intoccabile") else ""))
            md += ["", x["testo"] or "_(senza testo)_", ""] + [f"![]({f})" if f.endswith((".jpg", ".png")) else f"[video]({f})" for f in x["file"]] + [""]
    (ARCHIVIO / "README.md").write_text("\n".join(md), encoding="utf-8")
    for rete, nome in (("fb", "Facebook"), ("ig", "Instagram")):
        n_file = sum(len(x["file"]) for x in indice[rete])
        senza = sum(1 for x in indice[rete] if not x["file"])
        intocc = sum(1 for x in indice[rete] if x.get("intoccabile"))
        scrivi(f"- {nome}: {len(indice[rete])} post, {n_file} file salvati, {senza} post senza immagini"
               + (f", {intocc} foto profilo/copertina (escluse dalla cancellazione)" if intocc else ""))
    scrivi(f"Archivio in `{ARCHIVIO}/` (README.md con l'elenco, dati.json con i dati).")


def a_elimina_tutti(rete, conf, **_):
    """Elimina i post di RETE già salvati in ARCHIVIO/dati.json (mai quelli non archiviati)."""
    conferma(conf)
    f = ARCHIVIO / "dati.json"
    if not f.exists():
        esci(f"manca {f}: prima esegui «esporta»")
    archiviati = {x["id"]: x for x in json.loads(f.read_text(encoding="utf-8")).get(rete, [])}
    attuali = post_fb() if rete == "fb" else tutte(f"{ig_id()}/media", fields="id")
    fatti, saltati, errori = 0, [], []
    scrivi(f"Post presenti su {rete}: {len(attuali)}")
    for p in attuali:
        x = archiviati.get(p["id"])
        if not x:
            saltati.append(f"`{p['id']}` non è nell'archivio")
        elif x.get("intoccabile") or (rete == "fb" and intoccabile(p)):
            saltati.append(f"`{p['id']}` foto profilo/copertina")
        else:
            r = chiama("DELETE", p["id"])
            if r.get("success") is True:
                fatti += 1
                print(f"eliminato {p['id']} ({fatti})", flush=True)
            else:
                errori.append(f"`{p['id']}`: {r.get('errore', r)}")
    scrivi(f"Eliminati {fatti} post ({rete}).")
    for s in saltati:
        scrivi(f"- saltato {s}")
    for e in errori:
        scrivi(f"- ❌ {e}")
    if errori:
        salva_esito()
        sys.exit(1)


AZIONI = {
    "esporta": a_esporta, "elimina-tutti": a_elimina_tutti,
    "prova": a_prova, "elenco": a_elenco, "statistiche": a_statistiche,
    "pubblica": a_pubblica, "modifica": a_modifica, "elimina": a_elimina,
    "commenti": a_commenti, "rispondi-commento": a_rispondi_commento,
    "nascondi-commento": a_nascondi_commento, "elimina-commento": a_elimina_commento,
    "messaggi": a_messaggi, "rispondi-messaggio": a_rispondi_messaggio,
}


def salva_esito() -> None:
    testo = "\n".join(righe) + "\n"
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as f:
            f.write(testo)
    if os.environ.get("ESITO_FILE"):
        Path(os.environ["ESITO_FILE"]).write_text(testo, encoding="utf-8")


def main() -> None:
    cmd = {}
    f = os.environ.get("COMANDO_FILE")
    if f and Path(f).exists():
        cmd = json.loads(Path(f).read_text(encoding="utf-8"))
    val = lambda k: str(cmd.get(k) or os.environ.get(k.upper()) or "").strip()  # noqa: E731
    azione = val("azione")
    scrivi(f"## Gestione social — {azione or '?'} ({time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime())})")
    if not PAGE_ID or not TOKEN:
        esci("PAGE_ID o PAGE_TOKEN mancanti nei secret")
    if azione not in AZIONI:
        esci(f"azione sconosciuta «{azione}». Possibili: {', '.join(AZIONI)}")
    AZIONI[azione](rete=(val("rete") or "fb").lower(), ident=val("id"), testo=val("testo"),
                   immagine=val("immagine_url"), conf=val("conferma"))
    salva_esito()


if __name__ == "__main__":
    main()
