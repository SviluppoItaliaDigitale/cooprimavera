#!/usr/bin/env bash
# Prova static/invia-preventivo.php (modulo «Richiedi un preventivo») con un server PHP locale e un
# finto programma di posta: richiesta valida con foto, campi mancanti, email errata, file non ammesso,
# campo trappola, invio rapido segnalato. Non spedisce nulla. Uso: bash scripts/prova-modulo-preventivo.sh
set -euo pipefail
cd "$(dirname "$0")/.."
T=$(mktemp -d)
trap 'kill $SRV 2>/dev/null || true; rm -rf "$T"' EXIT
mkdir -p "$T/www" "$T/posta"
cp static/invia-preventivo.php "$T/www/"
printf '#!/bin/sh\ncat > "%s/posta/$(date +%%s%%N).eml"\n' "$T" > "$T/sendmail"
chmod +x "$T/sendmail"
php -d sendmail_path="$T/sendmail" -d sys_temp_dir="$T" -S 127.0.0.1:8799 -t "$T/www" > "$T/server.log" 2>&1 &
SRV=$!
sleep 1
U=http://127.0.0.1:8799/invia-preventivo.php
printf '\xff\xd8\xff\xe0prova' > "$T/foto.jpg"
python3 -c "import struct,zlib;open('$T/foto.png','wb').write(b'\x89PNG\r\n\x1a\n'+struct.pack('>I',13)+b'IHDR'+struct.pack('>IIBBBBB',1,1,8,2,0,0,0)+struct.pack('>I',zlib.crc32(b'IHDR'+struct.pack('>IIBBBBB',1,1,8,2,0,0,0)))+struct.pack('>I',12)+b'IDAT'+zlib.compress(b'\x00\x00\x00\x00')+struct.pack('>I',zlib.crc32(b'IDAT'+zlib.compress(b'\x00\x00\x00\x00')))+struct.pack('>I',0)+b'IEND'+struct.pack('>I',zlib.crc32(b'IEND')))"
echo 'non sono una foto' > "$T/finta.jpg"
CAMPI=(-F nome="Mario Prova" -F servizio=Giardinaggio -F comune=Ariccia -F messaggio="Siepe di 30 metri")
errori=0
prova() { # nome, codice atteso, testo atteso, argomenti curl…
  local nome=$1 codice=$2 testo=$3; shift 3
  local out; out=$(curl -s -w '\n%{http_code}' -X POST "$@" "$U")
  if [[ "$(tail -n1 <<<"$out")" == "$codice" && "$out" == *"$testo"* ]]; then echo "ok   $nome"; else echo "ERRORE $nome: $out"; errori=$((errori+1)); fi
}
lettere() { ls "$T/posta" | wc -l | tr -d ' '; }
prova "richiesta valida con foto" 200 '"ok"' "${CAMPI[@]}" -F telefono="06 1234567" -F email=mario@example.com -F inizio=1 -F 'foto[]=@'"$T/foto.png"
[[ $(lettere) == 1 ]] || { echo "ERRORE: la richiesta valida non ha prodotto l'email"; errori=$((errori+1)); }
grep -q 'Content-Disposition: attachment; filename="allegato-1.png"' "$T"/posta/* || { echo "ERRORE: foto non allegata"; errori=$((errori+1)); }
grep -q '^Reply-To: .*<mario@example.com>' "$T"/posta/* || { echo "ERRORE: manca Reply-To"; errori=$((errori+1)); }
prova "senza recapito" 422 'telefono o un indirizzo email' "${CAMPI[@]}"
prova "email errata" 422 'email non sembra' "${CAMPI[@]}" -F email=sbagliata
prova "campo obbligatorio mancante" 422 'campi obbligatori' -F nome=Mario -F telefono=061234567
prova "file non ammesso" 422 'Puoi allegare' "${CAMPI[@]}" -F telefono=061234567 -F 'foto[]=@'"$T/finta.jpg"
if [[ "$(curl -s -o /dev/null -w '%{http_code}' "$U")" == 405 ]]; then echo "ok   metodo GET"; else echo "ERRORE metodo GET"; errori=$((errori+1)); fi
prova "campo trappola" 200 '"ok"' "${CAMPI[@]}" -F telefono=061234567 -F sito_web=spam
[[ $(lettere) == 1 ]] || { echo "ERRORE: il campo trappola ha prodotto un'email"; errori=$((errori+1)); }
ADESSO=$(python3 -c 'import time;print(int(time.time()*1000)-500)')
prova "invio rapido: arriva comunque" 200 '"ok"' "${CAMPI[@]}" -F telefono=061234567 -F inizio="$ADESSO"
[[ $(lettere) == 2 ]] || { echo "ERRORE: l'invio rapido è stato perso"; errori=$((errori+1)); }
grep -l 'W2RhIHZlcmlmaWNhcmVd' "$T"/posta/* >/dev/null || { echo "ERRORE: l'invio rapido non è segnato [da verificare]"; errori=$((errori+1)); }
# Limite di invii: il primo elemento di X-Forwarded-For lo sceglie chi invia, conta l'ultimo (proxy)
for i in 1 2 3 4 5; do curl -s -o /dev/null -X POST "${CAMPI[@]}" -F telefono=061234567 -H "X-Forwarded-For: 10.0.0.$i, 203.0.113.9" "$U"; done
prova "limite di invii non aggirabile" 429 'diverse richieste' "${CAMPI[@]}" -F telefono=061234567 -H "X-Forwarded-For: 10.0.0.99, 203.0.113.9"
if (( errori )); then echo "$errori prove fallite"; exit 1; fi
echo "Modulo preventivo: tutte le prove passate."
