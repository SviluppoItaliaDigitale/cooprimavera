#!/usr/bin/env python3
"""Prova del testo alternativo in scripts/gestione_social.py, senza inviare nulla a Meta.

La rete è finta: ogni richiesta viene registrata (metodo, percorso, parametri) e riceve una risposta preparata,
così si controlla che cosa lo script manderebbe a Facebook e Instagram. Nessuna chiave, nessun accesso a Internet.

Uso, dalla radice del repository:  python3 scripts/prova_gestione_social.py
Solo libreria standard. Nasce il 21/10/2026 con il campo "alt" del calendario.
"""

from __future__ import annotations

import importlib.util
import io
import json
import os
import sys
import tempfile
import unittest
import urllib.error
import urllib.parse
from datetime import datetime, timedelta
from pathlib import Path
from unittest import mock
from zoneinfo import ZoneInfo

QUI = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("gestione_social", QUI / "gestione_social.py")
gs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gs)

PAGINA, IG, ROMA = "111", "999", ZoneInfo("Europe/Rome")
FOTO, VIDEO = "https://www.cooprimavera.com/social/prova.jpg", "https://www.cooprimavera.com/social/video/prova.mp4"


class Risposta:
    def __init__(self, corpo: dict, tipo: str = "application/json"):
        self.status, self.headers, self._corpo = 200, {"Content-Type": tipo}, json.dumps(corpo).encode()

    def read(self):
        return self._corpo

    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


class Rete:
    """Finta urlopen: registra le richieste alla Graph API e risponde con `regole` (o con un esito positivo)."""

    def __init__(self, regole=None):
        self.chiamate: list[tuple[str, str, dict]] = []
        self.regole = regole or (lambda metodo, percorso, param, n: None)

    def __call__(self, req, timeout=None):
        url = req.full_url
        if not url.startswith(gs.G):                      # attendi_media: HEAD sul file del sito
            return Risposta({}, "video/mp4" if url.endswith(".mp4") else "image/jpeg")
        parti = urllib.parse.urlsplit(url)
        percorso = parti.path.split("/", 2)[2]            # /v23.0/<percorso>
        dati = req.data.decode() if req.data else parti.query
        param = {k: v[0] for k, v in urllib.parse.parse_qs(dati, keep_blank_values=True).items()}
        metodo = req.get_method()
        n = sum(1 for m, p, _ in self.chiamate if (m, p) == (metodo, percorso))
        self.chiamate.append((metodo, percorso, param))
        esito = self.regole(metodo, percorso, param, n)
        if isinstance(esito, Exception):
            raise esito
        if isinstance(esito, tuple):   # (codice HTTP, messaggio[, codice di Meta[, messaggio per l'utente]])
            codice, msg, *meta = esito
            errore = {"message": msg}
            if meta:
                errore["code"] = meta[0]
            if len(meta) > 1:
                errore["error_user_msg"] = meta[1]
            raise urllib.error.HTTPError(url, codice, msg, {}, io.BytesIO(json.dumps({"error": errore}).encode()))
        if esito is not None:
            return Risposta(esito)
        return Risposta(self.predefinita(metodo, percorso, param))

    @staticmethod
    def predefinita(metodo, percorso, param):
        if metodo == "GET" and percorso == PAGINA:
            return {"instagram_business_account": {"id": IG}}
        if metodo == "GET" and percorso.endswith("/scheduled_posts"):
            return {"data": []}
        if metodo == "GET" and percorso in (f"{IG}/media", f"{PAGINA}/posts"):
            return {"data": []}
        if metodo == "GET" and "status_code" in param.get("fields", ""):
            return {"status_code": "FINISHED"}
        if metodo == "GET" and "permalink" in param.get("fields", ""):
            return {"permalink": "https://www.instagram.com/p/prova/"}
        if metodo == "DELETE" or (metodo == "POST" and "/" not in percorso):  # elimina o modifica un oggetto
            return {"success": True}
        if percorso == f"{IG}/media_publish":
            return {"id": "17800000000000001"}
        return {"id": "5550001", "post_id": f"{PAGINA}_5550001"}

    def post(self, percorso: str) -> list[dict]:
        return [p for m, pp, p in self.chiamate if m == "POST" and pp == percorso]


class Prova(unittest.TestCase):
    def setUp(self):
        gs.PAGE_ID, gs.TOKEN = PAGINA, "token-finto"
        gs.righe.clear()
        for k in ("GITHUB_STEP_SUMMARY", "ESITO_FILE"):
            os.environ.pop(k, None)
        self.addCleanup(mock.patch.stopall)
        mock.patch.object(gs.time, "sleep", lambda s: None).start()
        mock.patch.object(gs, "print", lambda *a, **k: None, create=True).start()   # l'esito resta in gs.righe

    def rete(self, regole=None) -> Rete:
        r = Rete(regole)
        mock.patch.object(gs.urllib.request, "urlopen", r).start()
        return r

    def log(self) -> str:
        return "\n".join(gs.righe)

    # --- immagini -----------------------------------------------------------

    def test_instagram_immagine_con_alt(self):
        r = self.rete()
        gs.a_pubblica(rete="ig", testo="Didascalia", immagine=FOTO, alt="Foto: guanti gialli.")
        (c,) = r.post(f"{IG}/media")
        self.assertEqual(c["alt_text"], "Foto: guanti gialli.")
        self.assertEqual((c["image_url"], c["caption"]), (FOTO, "Didascalia"))
        self.assertNotIn("alt_text_custom", c)
        self.assertEqual(len(r.post(f"{IG}/media_publish")), 1)

    def test_facebook_foto_con_alt(self):
        r = self.rete()
        gs.a_pubblica(rete="fb", testo="Testo", immagine=FOTO, alt="Foto: un prato.")
        (c,) = r.post(f"{PAGINA}/photos")
        self.assertEqual(c["alt_text_custom"], "Foto: un prato.")
        self.assertEqual((c["url"], c["caption"]), (FOTO, "Testo"))
        self.assertNotIn("alt_text", c)

    def test_facebook_programmato_con_alt(self):
        r = self.rete()
        quando = (datetime.now(ROMA) + timedelta(days=2)).replace(microsecond=0).isoformat()
        gs.a_pubblica(rete="fb", testo="Testo", immagine=FOTO, quando=quando, alt="Foto: un prato.")
        (c,) = r.post(f"{PAGINA}/photos")
        self.assertEqual(c["alt_text_custom"], "Foto: un prato.")
        self.assertEqual(c["published"], "false")
        self.assertEqual(int(c["scheduled_publish_time"]), int(datetime.fromisoformat(quando).timestamp()))

    def test_senza_alt_come_prima(self):
        r = self.rete()
        gs.a_pubblica(rete="fb", testo="Testo", immagine=FOTO)
        gs.a_pubblica(rete="ig", testo="Testo", immagine=FOTO)
        self.assertEqual(r.post(f"{PAGINA}/photos"), [{"url": FOTO, "caption": "Testo", "access_token": "token-finto"}])
        self.assertEqual(r.post(f"{IG}/media"), [{"image_url": FOTO, "caption": "Testo", "access_token": "token-finto"}])
        self.assertNotIn("alternativo", self.log())

    def test_post_senza_immagine_ignora_alt(self):
        r = self.rete()
        gs.a_pubblica(rete="fb", testo="Solo testo", immagine="", alt="Foto: niente.")
        (c,) = r.post(f"{PAGINA}/feed")
        self.assertNotIn("alt_text_custom", c)
        self.assertIn("non si invia", self.log())

    # --- video ---------------------------------------------------------------

    def test_video_e_reel_senza_alt(self):
        r = self.rete()
        gs.a_pubblica(rete="fb", testo="Testo", immagine=VIDEO, alt="Foto: un palco.")
        gs.a_pubblica(rete="ig", testo="Testo", immagine=VIDEO, alt="Foto: un palco.")
        (v,) = r.post(f"{PAGINA}/videos")
        (c,) = r.post(f"{IG}/media")
        self.assertEqual(c["media_type"], "REELS")
        self.assertEqual(c["cover_url"], VIDEO[:-4] + ".jpg")
        for p in (v, c):
            self.assertFalse({"alt_text", "alt_text_custom"} & set(p))
        self.assertEqual(self.log().count("per i video e i Reel non si invia"), 2)

    # --- rifiuti e guasti ----------------------------------------------------

    def test_alt_rifiutato_si_riprova_senza(self):
        def regole(metodo, percorso, param, n):
            if metodo == "POST" and "alt_text_custom" in param:
                return (400, "(#100) Invalid parameter")
        r = self.rete(regole)
        gs.a_pubblica(rete="fb", testo="Testo", immagine=FOTO, alt="Foto: un prato.")
        prima, dopo = r.post(f"{PAGINA}/photos")
        self.assertIn("alt_text_custom", prima)
        self.assertNotIn("alt_text_custom", dopo)
        self.assertEqual(dopo["url"], FOTO)
        self.assertIn("Meta ha rifiutato la richiesta con il testo alternativo "
                      "(alt_text_custom: (#100) Invalid parameter): riprovo una volta senza.", self.log())
        self.assertIn("Senza testo alternativo la richiesta è passata.", self.log())
        self.assertIn("Pubblicato su Facebook", self.log())

    def test_alt_rifiutato_da_instagram_si_riprova_senza(self):
        def regole(metodo, percorso, param, n):
            if metodo == "POST" and "alt_text" in param:
                return (400, "Param alt_text is not valid")
        r = self.rete(regole)
        gs.a_pubblica(rete="ig", testo="Testo", immagine=FOTO, alt="Foto: un prato.")
        prima, dopo = r.post(f"{IG}/media")
        self.assertIn("alt_text", prima)
        self.assertNotIn("alt_text", dopo)
        self.assertEqual(len(r.post(f"{IG}/media_publish")), 1)

    def test_errore_di_rete_non_si_riprova(self):
        def regole(metodo, percorso, param, n):
            if metodo == "POST":
                return urllib.error.URLError("connessione interrotta")
        r = self.rete(regole)
        with self.assertRaises(SystemExit):
            gs.a_pubblica(rete="fb", testo="Testo", immagine=FOTO, alt="Foto: un prato.")
        self.assertEqual(len(r.post(f"{PAGINA}/photos")), 1)
        self.assertNotIn("riprovo", self.log())

    def test_errore_del_server_non_si_riprova(self):
        def regole(metodo, percorso, param, n):
            if metodo == "POST":
                return (500, "An unexpected error has occurred")
        r = self.rete(regole)
        with self.assertRaises(SystemExit):
            gs.a_pubblica(rete="fb", testo="Testo", immagine=FOTO, alt="Foto: un prato.")
        self.assertEqual(len(r.post(f"{PAGINA}/photos")), 1)

    def test_rifiuto_anche_senza_alt_si_ferma(self):
        def regole(metodo, percorso, param, n):
            if metodo == "POST":
                return (400, "(#100) Invalid parameter", 100)
        r = self.rete(regole)
        with self.assertRaises(SystemExit):
            gs.a_pubblica(rete="fb", testo="Testo", immagine=FOTO, alt="Foto: un prato.")
        self.assertEqual(len(r.post(f"{PAGINA}/photos")), 2)  # uno con, uno senza; poi basta
        self.assertIn("Anche senza testo alternativo la richiesta non passa: il problema è un altro.", self.log())
        self.assertIn("**ERRORE:** (#100) Invalid parameter", self.log())

    def test_codice_100_senza_messaggio_si_riprova_senza(self):
        def regole(metodo, percorso, param, n):
            if metodo == "POST" and "alt_text" in param:
                return (400, "Invalid parameter", 100)
        r = self.rete(regole)
        gs.a_pubblica(rete="ig", testo="Testo", immagine=FOTO, alt="Foto: un prato.")
        prima, dopo = r.post(f"{IG}/media")
        self.assertIn("alt_text", prima)
        self.assertNotIn("alt_text", dopo)
        self.assertEqual(len(r.post(f"{IG}/media_publish")), 1)

    def test_codice_100_che_nomina_il_testo_alternativo_nel_dettaglio_si_riprova(self):
        # titolo e messaggio per l'utente Meta li scrive nella lingua della richiesta: anche in italiano
        for dettaglio in ("Alt text is too long.", "Il testo alternativo dell'immagine è troppo lungo."):
            with self.subTest(dettaglio=dettaglio):
                gs.righe.clear()

                def regole(metodo, percorso, param, n, dettaglio=dettaglio):
                    if metodo == "POST" and "alt_text_custom" in param:
                        return (400, "Invalid parameter", 100, dettaglio)
                r = self.rete(regole)
                gs.a_pubblica(rete="fb", testo="Testo", immagine=FOTO, alt="Foto: un prato.")
                prima, dopo = r.post(f"{PAGINA}/photos")
                self.assertIn("alt_text_custom", prima)
                self.assertNotIn("alt_text_custom", dopo)
                self.assertIn("Pubblicato su Facebook", self.log())

    def test_codice_100_che_nomina_un_altro_parametro_non_si_riprova(self):
        # il codice 100 è generico: se Meta nomina l'immagine, l'indirizzo o il luogo, il testo alternativo non c'entra
        for esito in ((400, "Invalid image URL", 100),
                      (400, "(#100) url should represent a valid URL", 100),
                      (400, "Invalid parameter", 100, "The image could not be downloaded."),
                      (400, "Invalid parameter", 100, "Non è stato possibile scaricare l'immagine."),
                      (400, "(#100) Invalid parameter location_id", 100),
                      (400, "Invalid image URL")):
            with self.subTest(esito=esito):
                gs.righe.clear()
                r = self.rete(lambda metodo, percorso, param, n, esito=esito: esito if metodo == "POST" else None)
                with self.assertRaises(SystemExit):
                    gs.a_pubblica(rete="fb", testo="Testo", immagine=FOTO, alt="Foto: un prato.")
                self.assertEqual(len(r.post(f"{PAGINA}/photos")), 1)  # una sola chiamata: l'alt non c'entra
                self.assertNotIn("riprovo", self.log())
                self.assertIn(f"**ERRORE:** {esito[1]}", self.log())

    def test_token_scaduto_non_si_riprova(self):
        def regole(metodo, percorso, param, n):
            if metodo == "POST":
                return (400, "Error validating access token: Session has expired", 190)
        r = self.rete(regole)
        with self.assertRaises(SystemExit):
            gs.a_pubblica(rete="ig", testo="Testo", immagine=FOTO, alt="Foto: un prato.")
        self.assertEqual(len(r.post(f"{IG}/media")), 1)
        self.assertNotIn("riprovo", self.log())

    def test_instagram_alt_troppo_lungo_non_si_invia(self):
        r = self.rete()
        gs.a_pubblica(rete="ig", testo="Testo", immagine=FOTO, alt="a" * 1001)
        (c,) = r.post(f"{IG}/media")
        self.assertNotIn("alt_text", c)
        self.assertIn("1001 caratteri, oltre il limite di 1000", self.log())

    def test_instagram_alt_di_1000_caratteri_si_invia(self):
        r = self.rete()
        gs.a_pubblica(rete="ig", testo="Testo", immagine=FOTO, alt="a" * 1000)
        (c,) = r.post(f"{IG}/media")
        self.assertEqual(len(c["alt_text"]), 1000)

    # --- calendario ----------------------------------------------------------

    def calendario(self, post: list[dict]) -> None:
        f = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8")
        json.dump({"post": post}, f, ensure_ascii=False)
        f.close()
        self.addCleanup(os.unlink, f.name)
        mock.patch.object(gs, "CALENDARIO", Path(f.name)).start()

    def test_programma_calendario(self):
        fra_due = (datetime.now(ROMA) + timedelta(days=2)).strftime("%Y-%m-%d")
        fra_tre = (datetime.now(ROMA) + timedelta(days=3)).strftime("%Y-%m-%d")
        self.calendario([
            {"data": fra_due, "ora": "09:00", "titolo": "Con alt", "immagine": FOTO, "fb": "Testo 1", "alt": "Foto: un prato."},
            {"data": fra_tre, "ora": "09:00", "titolo": "Senza alt", "immagine": FOTO, "fb": "Testo 2"},
        ])
        r = self.rete()
        gs.a_programma_calendario()
        primo, secondo = r.post(f"{PAGINA}/photos")
        self.assertEqual(primo["alt_text_custom"], "Foto: un prato.")
        self.assertEqual(primo["published"], "false")
        self.assertNotIn("alt_text_custom", secondo)
        self.assertEqual(self.log().count("programmato"), 2)

    def test_pubblica_oggi(self):
        oggi = datetime.now(ROMA).strftime("%Y-%m-%d")
        self.calendario([{"data": oggi, "ora": "00:00", "titolo": "Oggi", "immagine": FOTO,
                          "ig": "Didascalia IG", "fb": "Testo FB", "alt": "Foto: un prato."}])
        r = self.rete()
        gs.a_pubblica_oggi()
        (ig,) = r.post(f"{IG}/media")
        (fb,) = r.post(f"{PAGINA}/photos")
        self.assertEqual((ig["alt_text"], ig["caption"]), ("Foto: un prato.", "Didascalia IG"))
        self.assertEqual((fb["alt_text_custom"], fb["caption"]), ("Foto: un prato.", "Testo FB"))

    def test_pubblica_oggi_video(self):
        oggi = datetime.now(ROMA).strftime("%Y-%m-%d")
        self.calendario([{"data": oggi, "ora": "00:00", "titolo": "Oggi", "immagine": FOTO, "video": VIDEO,
                          "ig": "Didascalia IG", "fb": "Testo FB", "alt": "Foto: un palco."}])
        r = self.rete()
        gs.a_pubblica_oggi()
        (ig,) = r.post(f"{IG}/media")
        self.assertEqual(ig["media_type"], "REELS")
        self.assertNotIn("alt_text", ig)
        self.assertEqual(len(r.post(f"{PAGINA}/videos")), 1)

    # --- avvio dal workflow e azione «prova» --------------------------------

    def test_main_legge_alt(self):
        r = self.rete()
        amb = {"AZIONE": "pubblica", "RETE": "fb", "TESTO": "Testo", "IMMAGINE_URL": FOTO, "ALT": "Foto: un prato.",
               "COMANDO_FILE": ""}
        with mock.patch.dict(os.environ, amb):
            gs.main()
        (c,) = r.post(f"{PAGINA}/photos")
        self.assertEqual(c["alt_text_custom"], "Foto: un prato.")

    def test_azione_prova_controlla_il_testo_alternativo(self):
        r = self.rete()
        gs.a_prova()
        (foto,) = r.post(f"{PAGINA}/photos")
        self.assertEqual(foto["published"], "false")
        self.assertIn("alt_text_custom", foto)
        (ig,) = r.post(f"{IG}/media")
        self.assertIn("alt_text", ig)
        self.assertEqual(r.post(f"{IG}/media_publish"), [])          # niente pubblicato
        self.assertEqual(sum(1 for m, *_ in r.chiamate if m == "DELETE"), 2)  # post e foto di prova eliminati


if __name__ == "__main__":
    esito = unittest.main(exit=False, verbosity=1).result
    sys.exit(0 if esito.wasSuccessful() else 1)
