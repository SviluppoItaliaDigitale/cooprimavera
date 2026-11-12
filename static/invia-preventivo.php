<?php
// Riceve il modulo «Richiedi un preventivo» del sito e lo invia via email a info@cooprimavera.com,
// con le foto allegate. Risponde in JSON; il modulo, se l'invio non riesce, propone WhatsApp e telefono.
// Protezioni: campo trappola, invii troppo rapidi segnalati nell'oggetto, limite di invii per indirizzo e
// in tutto (prenotati sotto blocco prima dell'invio), controllo dell'origine e dei file.

// Un errore del server non deve mai mostrare percorsi o dettagli a chi visita.
ini_set('display_errors', '0');

date_default_timezone_set('Europe/Rome');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

const DESTINATARIO = 'info@cooprimavera.com';
const MITTENTE = 'info@cooprimavera.com';
const MAX_FILE = 3;
const MAX_BYTE_FILE = 5242880;   // 5 MB per foto
const MAX_BYTE_TOTALE = 12582912; // 12 MB in tutto
const MAX_INVII_ORA = 5;
const MAX_INVII_ORA_TUTTI = 40;  // tetto complessivo: oltre, la casella non si riempie
const ORIGINI = array('https://www.cooprimavera.com', 'https://cooprimavera.com');

// Prenota un invio nel registro, sotto blocco esclusivo: lettura, controllo e scrittura sono un'unica
// operazione, così molte richieste in parallelo non passano tutte insieme sotto il limite.
// Restituisce false se il limite dell'ultima ora è già raggiunto. Se il registro non si può aprire
// la richiesta passa: un cliente vero non va perso per un problema del server.
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
    rispondi(405, 'errore', 'Usa il modulo della pagina Preventivo.');
}

// Il modulo si invia solo dalle pagine del sito: una pagina di un altro sito non può farlo spedire
// al browser di un visitatore. Un programma senza intestazione Origin passa (ci sono gli altri limiti).
$origine = isset($_SERVER['HTTP_ORIGIN']) ? (string) $_SERVER['HTTP_ORIGIN'] : '';
if ($origine !== '' && !in_array($origine, ORIGINI, true)) {
    rispondi(403, 'errore', 'Usa il modulo della pagina Preventivo.');
}

// Campo trappola: le persone non lo vedono, i programmi automatici lo riempiono.
if (!empty($_POST['sito_web'])) {
    rispondi(200, 'ok', 'Richiesta ricevuta.');
}

// Tempo di compilazione: sotto i 2 secondi è quasi sempre un programma automatico. La richiesta
// non si scarta (un cliente vero non va mai perso): parte con «[da verificare]» nell'oggetto.
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
$registro = $cartella . '/cooprimavera-preventivi-' . hash('sha256', 'cooprimavera|' . $ip) . '.txt';
$ora = time();
// I registri più vecchi di un'ora si cancellano: non servono più.
foreach ((array) glob($cartella . '/cooprimavera-preventivi-*.txt') as $vecchio) {
    if (is_file($vecchio) && ($ora - (int) @filemtime($vecchio)) > 3600) { @unlink($vecchio); }
}
$nome = una_riga(pulisci(isset($_POST['nome']) ? $_POST['nome'] : '', 120));
$servizio = una_riga(pulisci(isset($_POST['servizio']) ? $_POST['servizio'] : '', 120));
$comune = una_riga(pulisci(isset($_POST['comune']) ? $_POST['comune'] : '', 120));
$telefono = una_riga(pulisci(isset($_POST['telefono']) ? $_POST['telefono'] : '', 40));
$email = una_riga(pulisci(isset($_POST['email']) ? $_POST['email'] : '', 160));
$messaggio = pulisci(isset($_POST['messaggio']) ? $_POST['messaggio'] : '', 5000);
$pagina = una_riga(pulisci(isset($_POST['pagina']) ? $_POST['pagina'] : '', 300));

if ($nome === '' || $servizio === '' || $comune === '' || $messaggio === '') {
    rispondi(422, 'errore', 'Compila i campi obbligatori.');
}
if ($telefono === '' && $email === '') {
    rispondi(422, 'errore', 'Lasciaci un telefono o un indirizzo email per risponderti.');
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    rispondi(422, 'errore', "L'indirizzo email non sembra corretto.");
}
if ($telefono !== '' && !preg_match('/^[0-9 +().\/-]{6,40}$/', $telefono)) {
    rispondi(422, 'errore', 'Il numero di telefono non sembra corretto.');
}

// Foto allegate (facoltative).
$allegati = array();
$totale = 0;
$tipi = array('image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/heic' => 'heic', 'image/heif' => 'heif', 'application/pdf' => 'pdf');
if (isset($_FILES['foto']) && is_array($_FILES['foto']['name'])) {
    $n = count($_FILES['foto']['name']);
    for ($i = 0; $i < $n; $i++) {
        $errore = $_FILES['foto']['error'][$i];
        if ($errore === UPLOAD_ERR_NO_FILE) { continue; }
        if ($errore !== UPLOAD_ERR_OK) {
            rispondi(422, 'errore', 'Una foto non si è caricata: prova con file più leggeri o mandale su WhatsApp.');
        }
        if (count($allegati) >= MAX_FILE) {
            rispondi(422, 'errore', 'Puoi allegare al massimo ' . MAX_FILE . ' file.');
        }
        $percorso = $_FILES['foto']['tmp_name'][$i];
        $peso = (int) $_FILES['foto']['size'][$i];
        $totale += $peso;
        if ($peso > MAX_BYTE_FILE || $totale > MAX_BYTE_TOTALE) {
            rispondi(422, 'errore', 'Le foto sono troppo pesanti (massimo 5 MB ciascuna): mandale su WhatsApp.');
        }
        $tipo = '';
        if (function_exists('finfo_open')) {
            $fi = finfo_open(FILEINFO_MIME_TYPE);
            $tipo = (string) finfo_file($fi, $percorso);
            finfo_close($fi);
        } else {
            // Senza il controllo sul contenuto non ci si fida del tipo dichiarato da chi invia.
            rispondi(422, 'errore', 'Qui non riusciamo a ricevere allegati: mandali su WhatsApp.');
        }
        if (!isset($tipi[$tipo])) {
            rispondi(422, 'errore', 'Puoi allegare foto (JPG, PNG, WEBP, HEIC) o PDF.');
        }
        $allegati[] = array(
            'nome' => 'allegato-' . (count($allegati) + 1) . '.' . $tipi[$tipo],
            'tipo' => $tipo,
            'dati' => (string) file_get_contents($percorso),
        );
    }
}

$oggetto = ($sospetta ? '[da verificare] ' : '') . 'Richiesta preventivo dal sito: ' . $servizio . ' a ' . $comune;
$testo = "Nuova richiesta di preventivo dal sito cooprimavera.com\n\n"
    . "Nome / azienda: $nome\n"
    . "Servizio: $servizio\n"
    . "Comune: $comune\n"
    . 'Telefono: ' . ($telefono !== '' ? $telefono : '—') . "\n"
    . 'Email: ' . ($email !== '' ? $email : '—') . "\n"
    . 'Foto allegate: ' . count($allegati) . "\n\n"
    . "Esigenza:\n$messaggio\n\n"
    . '— Inviata il ' . date('d/m/Y H:i') . ($pagina !== '' ? " dalla pagina $pagina" : '') . "\n";

$confine = 'cp-' . bin2hex(random_bytes(12));
$intestazioni = 'From: ' . intestazione_utf8('Sito Cooprimavera') . ' <' . MITTENTE . ">\r\n";
if ($email !== '') {
    $intestazioni .= 'Reply-To: ' . intestazione_utf8($nome) . ' <' . $email . ">\r\n";
}
$intestazioni .= "MIME-Version: 1.0\r\n";

if (count($allegati) === 0) {
    $intestazioni .= "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n";
    $corpo = chunk_split(base64_encode($testo));
} else {
    $intestazioni .= "Content-Type: multipart/mixed; boundary=\"$confine\"\r\n";
    $corpo = "--$confine\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($testo));
    foreach ($allegati as $a) {
        $corpo .= "--$confine\r\nContent-Type: {$a['tipo']}; name=\"{$a['nome']}\"\r\n"
            . "Content-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"{$a['nome']}\"\r\n\r\n"
            . chunk_split(base64_encode($a['dati']));
    }
    $corpo .= "--$confine--\r\n";
}

// Il posto si prenota prima di inviare, per indirizzo e in tutto.
$registro_tutti = $cartella . '/cooprimavera-preventivi-tutti.txt';
if (!prenota($registro, MAX_INVII_ORA, $ora)) {
    rispondi(429, 'errore', 'Hai già inviato diverse richieste: scrivici su WhatsApp o chiamaci.');
}
if (!prenota($registro_tutti, MAX_INVII_ORA_TUTTI, $ora)) {
    rispondi(429, 'errore', 'In questo momento riceviamo troppe richieste: scrivici su WhatsApp o chiamaci.');
}

$inviata = @mail(DESTINATARIO, intestazione_utf8($oggetto), $corpo, $intestazioni, '-f' . MITTENTE);
if (!$inviata) {
    rispondi(502, 'errore', 'Il server di posta non ha accettato la richiesta.');
}

rispondi(200, 'ok', 'Richiesta ricevuta.');
