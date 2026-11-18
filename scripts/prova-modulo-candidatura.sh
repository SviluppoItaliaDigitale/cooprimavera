#!/usr/bin/env bash
# Prova static/invia-candidatura.php (pagina «Candidatura online») con un server PHP locale e un finto
# programma di posta: candidatura valida, risposte obbligatorie mancanti, telefono ed email errati, campo
# trappola, invio rapido segnalato, limiti di invii, origine. Non spedisce nulla. Uso: bash scripts/prova-modulo-candidatura.sh
set -euo pipefail
cd "$(dirname "$0")/.."
T=$(mktemp -d)
trap 'kill $SRV 2>/dev/null || true; rm -rf "$T"' EXIT
mkdir -p "$T/www" "$T/posta"
cp static/invia-candidatura.php "$T/www/"
printf '#!/bin/sh\ncat > "%s/posta/$(date +%%s%%N).eml"\n' "$T" > "$T/sendmail"
chmod +x "$T/sendmail"
php -d sendmail_path="$T/sendmail" -d sys_temp_dir="$T" -S 127.0.0.1:8798 -t "$T/www" > "$T/server.log" 2>&1 &
SRV=$!
sleep 1
U=http://127.0.0.1:8798/invia-candidatura.php
CAMPI=(-F nome="Maria Prova" -F lavoro="Pulizie e sanificazione" -F comune=Ariccia -F telefono="333 1234567")
errori=0
prova() { # nome, codice atteso, testo atteso, argomenti curl…
  local nome=$1 codice=$2 testo=$3; shift 3
  local out; out=$(curl -s -w '\n%{http_code}' -X POST "$@" "$U")
  if [[ "$(tail -n1 <<<"$out")" == "$codice" && "$out" == *"$testo"* ]]; then echo "ok   $nome"; else echo "ERRORE $nome: $out"; errori=$((errori+1)); fi
}
lettere() { ls "$T/posta" | wc -l | tr -d ' '; }
testo_lettera() { python3 - "$1" <<'PY'
import sys, email
m = email.message_from_binary_file(open(sys.argv[1], 'rb'))
print(m.get_payload(decode=True).decode('utf-8'))
PY
}
prova "candidatura valida" 200 '"ok"' "${CAMPI[@]}" -F email=maria@example.com -F macchine="Lavasciuga, Monospazzola" -F avvio=Subito -F note="Riga uno
riga due" -F inizio=1 -F campo_ignoto=xyz
[[ $(lettere) == 1 ]] || { echo "ERRORE: la candidatura valida non ha prodotto l'email"; errori=$((errori+1)); }
L=$(ls "$T"/posta/* | head -1)
grep -q '^Reply-To: .*<maria@example.com>' "$L" || { echo "ERRORE: manca Reply-To"; errori=$((errori+1)); }
CORPO=$(testo_lettera "$L")
for atteso in "Nome: Maria Prova" "Lavoro: Pulizie e sanificazione" "Macchine: Lavasciuga, Monospazzola" "Inizio: Subito" "Telefono: 333 1234567" "riga due" "colloquio di persona"; do
  [[ "$CORPO" == *"$atteso"* ]] || { echo "ERRORE: nell'email manca «$atteso»"; errori=$((errori+1)); }
done
[[ "$CORPO" != *"xyz"* ]] || { echo "ERRORE: un campo non previsto è finito nell'email"; errori=$((errori+1)); }
prova "telefono mancante" 422 'obbligatorie' -F nome=Maria -F lavoro=Pulizie -F comune=Ariccia -H "X-Forwarded-For: 198.51.100.1"
prova "comune mancante" 422 'obbligatorie' -F nome=Maria -F lavoro=Pulizie -F telefono=3331234567 -H "X-Forwarded-For: 198.51.100.1"
prova "telefono errato" 422 'telefono non sembra' -F nome=Maria -F lavoro=Pulizie -F comune=Ariccia -F telefono=abc -H "X-Forwarded-For: 198.51.100.1"
prova "email errata" 422 'email non sembra' "${CAMPI[@]}" -F email=sbagliata -H "X-Forwarded-For: 198.51.100.1"
if [[ "$(curl -s -o /dev/null -w '%{http_code}' "$U")" == 405 ]]; then echo "ok   metodo GET"; else echo "ERRORE metodo GET"; errori=$((errori+1)); fi
prova "campo trappola" 200 '"ok"' "${CAMPI[@]}" -F sito_web=spam -H "X-Forwarded-For: 198.51.100.2"
[[ $(lettere) == 1 ]] || { echo "ERRORE: il campo trappola ha prodotto un'email"; errori=$((errori+1)); }
ADESSO=$(python3 -c 'import time;print(int(time.time()*1000)-500)')
prova "invio rapido: arriva comunque" 200 '"ok"' "${CAMPI[@]}" -F inizio="$ADESSO" -H "X-Forwarded-For: 198.51.100.3"
[[ $(lettere) == 2 ]] || { echo "ERRORE: l'invio rapido è stato perso"; errori=$((errori+1)); }
grep -l 'W2RhIHZlcmlmaWNhcmVd' "$T"/posta/* >/dev/null || { echo "ERRORE: l'invio rapido non è segnato [da verificare]"; errori=$((errori+1)); }
# Limite per indirizzo: 3 l'ora; il primo elemento di X-Forwarded-For lo sceglie chi invia, conta l'ultimo
for i in 1 2 3; do curl -s -o /dev/null -X POST "${CAMPI[@]}" -H "X-Forwarded-For: 10.0.0.$i, 203.0.113.9" "$U"; done
prova "limite di invii non aggirabile" 429 'già inviato' "${CAMPI[@]}" -H "X-Forwarded-For: 10.0.0.99, 203.0.113.9"
prova "origine estranea rifiutata" 403 'Candidatura online' "${CAMPI[@]}" -H "Origin: https://esempio.invalid" -H "X-Forwarded-For: 198.51.100.8"
prova "origine del sito accettata" 200 '"ok"' "${CAMPI[@]}" -H "Origin: https://www.cooprimavera.com" -H "X-Forwarded-For: 198.51.100.8"
# Tetto complessivo: 30 invii l'ora da indirizzi diversi, poi basta
for i in $(seq 1 32); do curl -s -o /dev/null -X POST "${CAMPI[@]}" -H "X-Forwarded-For: 192.0.2.$i" "$U"; done
prova "tetto complessivo di invii" 429 'troppe candidature' "${CAMPI[@]}" -H "X-Forwarded-For: 192.0.2.200"
if (( errori )); then echo "$errori prove fallite"; exit 1; fi
echo "Modulo candidatura: tutte le prove passate."
