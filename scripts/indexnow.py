#!/usr/bin/env python3
"""Segnala ai motori di ricerca che aderiscono a IndexNow (Bing, Yandex, Seznam, Naver)
le pagine del sito cambiate oggi, dopo ogni pubblicazione. Uso: python3 scripts/indexnow.py public/sitemap.xml
La chiave è il file static/<chiave>.txt; Google non usa IndexNow e legge la sitemap."""
import datetime, json, re, sys, urllib.request, zoneinfo

CHIAVE = "200c973717b574d8a14ccf44dc21d1b1"
SITO = "www.cooprimavera.com"

def main(sitemap):
    oggi = datetime.datetime.now(zoneinfo.ZoneInfo("Europe/Rome")).date().isoformat()
    xml = open(sitemap, encoding="utf-8").read()
    voci = re.findall(r"<url>\s*<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>", xml)
    pagine = [loc for loc, mod in voci if mod[:10] >= oggi]
    if not pagine:
        print("IndexNow: nessuna pagina cambiata oggi."); return
    corpo = json.dumps({"host": SITO, "key": CHIAVE, "keyLocation": f"https://{SITO}/{CHIAVE}.txt", "urlList": pagine}).encode()
    req = urllib.request.Request("https://api.indexnow.org/indexnow", data=corpo, headers={"Content-Type": "application/json; charset=utf-8"})
    with urllib.request.urlopen(req, timeout=30) as r:
        print(f"IndexNow: {len(pagine)} pagine segnalate, risposta {r.status}.")
    for p in pagine: print(" ", p)

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "public/sitemap.xml")
