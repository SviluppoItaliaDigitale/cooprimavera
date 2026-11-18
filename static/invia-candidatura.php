<?php
// Riceve le risposte dell'assistente virtuale della pagina «Candidatura online» (layouts/candidatura.html)
// e le invia via email a info@cooprimavera.com. Risponde in JSON; la pagina, se l'invio non riesce,
// propone WhatsApp, email e telefono con le risposte già scritte. Nessuna decisione automatica:
// la candidatura la legge una persona, che poi fa il colloquio di persona.
// Protezioni: campo trappola, invii troppo rapidi segnalati nell'oggetto, limite di invii per indirizzo e
// in tutto (prenotati sotto blocco prima dell'invio), controllo dell'origine.

// Un errore del server non deve mai mostrare percorsi o dettagli a chi visita.
ini_set('display_errors', '0');

date_default_timezone_set('Europe/Rome');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

const DESTINATARIO = 'info@cooprimavera.com';
const MITTENTE = 'info@cooprimavera.com';
const MAX_INVII_ORA = 3;
const MAX_INVII_ORA_TUTTI = 30;  // tetto complessivo: oltre, la casella non si riempie
const ORIGINI = array('https://www.cooprimavera.com', 'https://cooprimavera.com');

// Prenota un invio nel registro, sotto blocco esclusivo: lettura, controllo e scrittura sono un'unica
// operazione, così molte richieste in parallelo non passano tutte insieme sotto il limite.
// Restituisce false se il limite dell'ultima ora è già raggiunto. Se il registro non si può aprire
// la richiesta passa: una candidatura vera non va persa per un problema del server.
function prenota($registro, $massimo, $ora) {
    $fh = @fopen($registro, 'c+');
    if (!$fh) { return true; }
    @chmod($registro, 0600);
    if (!flock($fh, LOCK_EX)) { fclose($fh); return true; }
    $invii = array();
    foreach (explode("\n", (string) stream_get_contents($fh)) as $t) {
        if ($t !== '' && ($ora - (int) $t) < 3600) { $invii[] = (int) $t; }
    }
    $libero = count($invii) < $massimo;
    if ($libero) {
        $invii[] = $ora;
        ftruncate($fh, 0);
        rewind($fh);
        fwrite($fh, implode("\n", $invii));
        fflush($fh);
    }
    flock($fh, LOCK_UN);
    fclose($fh);
    return $libero;
}

function rispondi($codice, $esito, $messaggio) {
    http_response_code($codice);
    echo json_encode(array('esito' => $esito, 'messaggio' => $messaggio), JSON_UNESCAPED_UNICODE);
    exit;
}

function pulisci($valore, $lunghezza) {
    $v = is_string($valore) ? trim($valore) : '';
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v);
    if (function_exists('mb_substr')) { return mb_substr($v, 0, $lunghezza, 'UTF-8'); }
    return substr($v, 0, $lunghezza);
}

function una_riga($valore) {
    return trim(preg_replace('/[\r\n]+/', ' ', $valore));
}

function intestazione_utf8($testo) {
    return '=?UTF-8?B?' . base64_encode($testo) . '?=';
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    rispondi(405, 'errore', 'Usa la pagina Candidatura online del sito.');
}

// Il modulo si invia solo dalle pagine del sito: una pagina di un altro sito non può farlo spedire
// al browser di un visitatore. Un programma senza intestazione Origin passa (ci sono gli altri limiti).
$origine = isset($_SERVER['HTTP_ORIGIN']) ? (string) $_SERVER['HTTP_ORIGIN'] : '';
if ($origine !== '' && !in_array($origine, ORIGINI, true)) {
    rispondi(403, 'errore', 'Usa la pagina Candidatura online del sito.');
}

// Campo trappola: le persone non lo vedono, i programmi automatici lo riempiono.
if (!empty($_POST['sito_web'])) {
    rispondi(200, 'ok', 'Candidatura ricevuta.');
}

// Tempo di compilazione: sotto i 2 secondi è quasi sempre un programma automatico. La richiesta
// non si scarta (una candidatura vera non va mai persa): parte con «[da verificare]» nell'oggetto.
$inizio = isset($_POST['inizio']) ? (float) $_POST['inizio'] : 0;
$sospetta = $inizio > 0 && (microtime(true) * 1000 - $inizio) < 2000;

// Limite di invii per indirizzo IP nell'ultima ora.
// Il sito sta dietro il proxy di Aruba, che aggiunge in fondo a X-Forwarded-For l'indirizzo da cui
// arriva la richiesta: vale l'ultimo elemento, non il primo, che chi invia può scrivere a piacere.
$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $catena = array_map('trim', explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']));
    $ultimo = end($catena);
    if (filter_var($ultimo, FILTER_VALIDATE_IP)) { $ip = $ultimo; }
}
$cartella = rtrim(sys_get_temp_dir(), '/');
$registro = $cartella . '/cooprimavera-candidature-' . hash('sha256', 'cooprimavera|' . $ip) . '.txt';
$ora = time();
// I registri più vecchi di un'ora si cancellano: non servono più.
foreach ((array) glob($cartella . '/cooprimavera-candidature-*.txt') as $vecchio) {
    if (is_file($vecchio) && ($ora - (int) @filemtime($vecchio)) > 3600) { @unlink($vecchio); }
}
// Risposte ammesse, nell'ordine della pagina: chiave => etichetta e lunghezza massima.
$campi = array(
    'nome' => array('Nome', 120),
    'lavoro' => array('Lavoro', 80),
    'esperienza' => array('Esperienza', 80),
    'ambienti' => array('Ambienti pulizie', 300),
    'macchine' => array('Macchine', 300),
    'sanificazione' => array('Sanificazione', 80),
    'manutenzione' => array('Lavori di manutenzione', 300),
    'attestati' => array('Attestati e corsi', 600),
    'patente' => array('Patente', 80),
    'comune' => array('Comune', 120),
    'disponibilita' => array('Disponibilità', 300),
    'orario' => array('Orario', 80),
    'avvio' => array('Inizio', 80),
    'telefono' => array('Telefono', 40),
    'email' => array('Email', 160),
    'note' => array('Note', 2000),
);
$r = array();
foreach ($campi as $k => $c) {
    // Una risposta più lunga del previsto si rifiuta: tagliarla in silenzio farebbe perdere parte della candidatura.
    $grezzo = isset($_POST[$k]) && is_string($_POST[$k]) ? trim($_POST[$k]) : '';
    $lunghezza = function_exists('mb_strlen') ? mb_strlen($grezzo, 'UTF-8') : strlen($grezzo);
    if ($lunghezza > $c[1]) {
        rispondi(422, 'errore', 'La risposta «' . $c[0] . '» è troppo lunga (massimo ' . $c[1] . ' caratteri).');
    }
    $v = pulisci($grezzo, $c[1]);
    $r[$k] = $k === 'note' ? $v : una_riga($v);
}
$pagina = una_riga(pulisci(isset($_POST['pagina']) ? $_POST['pagina'] : '', 300));

if ($r['nome'] === '' || $r['lavoro'] === '' || $r['comune'] === '' || $r['telefono'] === '') {
    rispondi(422, 'errore', 'Mancano alcune risposte obbligatorie.');
}
if (!preg_match('/^[0-9 +().\/-]{6,40}$/', $r['telefono'])) {
    rispondi(422, 'errore', 'Il numero di telefono non sembra corretto.');
}
if ($r['email'] !== '' && !filter_var($r['email'], FILTER_VALIDATE_EMAIL)) {
    rispondi(422, 'errore', "L'indirizzo email non sembra corretto.");
}

$oggetto = ($sospetta ? '[da verificare] ' : '') . 'Candidatura dal sito: ' . $r['lavoro'] . ' – ' . $r['nome'];
$testo = "Nuova candidatura dal sito cooprimavera.com (prima selezione con l'assistente virtuale)\n\n";
foreach ($campi as $k => $c) {
    if ($k === 'note') { continue; }
    if ($r[$k] !== '') { $testo .= $c[0] . ': ' . $r[$k] . "\n"; }
}
if ($r['note'] !== '') { $testo .= "\nNote del candidato:\n" . $r['note'] . "\n"; }
$testo .= "\nIl candidato è stato informato che le risposte le legge una persona e che, se il profilo è in linea, "
    . "verrà chiamato per un colloquio di persona.\n"
    . '— Inviata il ' . date('d/m/Y H:i') . ($pagina !== '' ? " dalla pagina $pagina" : '') . "\n";

$intestazioni = 'From: ' . intestazione_utf8('Sito Cooprimavera') . ' <' . MITTENTE . ">\r\n";
if ($r['email'] !== '') {
    $intestazioni .= 'Reply-To: ' . intestazione_utf8($r['nome']) . ' <' . $r['email'] . ">\r\n";
}
$intestazioni .= "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n";
$corpo = chunk_split(base64_encode($testo));

// Il posto si prenota prima di inviare, per indirizzo e in tutto.
$registro_tutti = $cartella . '/cooprimavera-candidature-tutti.txt';
if (!prenota($registro, MAX_INVII_ORA, $ora)) {
    rispondi(429, 'errore', 'Hai già inviato una candidatura: se devi correggere qualcosa scrivici su WhatsApp o chiamaci.');
}
if (!prenota($registro_tutti, MAX_INVII_ORA_TUTTI, $ora)) {
    rispondi(429, 'errore', 'In questo momento riceviamo troppe candidature: scrivici su WhatsApp o chiamaci.');
}

$inviata = @mail(DESTINATARIO, intestazione_utf8($oggetto), $corpo, $intestazioni, '-f' . MITTENTE);
if (!$inviata) {
    rispondi(502, 'errore', 'Il server di posta non ha accettato la candidatura.');
}

rispondi(200, 'ok', 'Candidatura ricevuta.');
