<?php
require_once 'config.php'; // Plik z konfiguracją (klucz API Firebase)
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Nieprawidłowa metoda żądania.']);
    exit;
}

if (!isset($_FILES['file']) || !isset($_POST['date'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Brak pliku lub daty!']);
    exit;
}

// Sprawdź format daty
$date = $_POST['date'];
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    http_response_code(400);
    echo json_encode(['error' => 'Nieprawidłowy format daty. Wymagany format: YYYY-MM-DD']);
    exit;
}

$idToken = $_POST['idToken'] ?? null;
if (!$idToken) {
    http_response_code(400);
    echo json_encode(['error' => 'Brak tokenu uwierzytelniającego.']);
    exit;
}

// Weryfikacja tokenu Firebase
$url = 'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' . FIREBASE_API_KEY;
$data = ['idToken' => $idToken];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
    ],
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
    http_response_code(500);
    echo json_encode(['error' => 'Błąd weryfikacji tokenu.']);
    exit;
}

$response = json_decode($result, true);
if (!isset($response['users']) || empty($response['users'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Nieprawidłowy token.']);
    exit;
}

// Sprawdź typ pliku (Excel)
$finfo = new finfo(FILEINFO_MIME_TYPE);
$fileType = $finfo->file($_FILES['file']['tmp_name']);
$allowedTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/octet-stream', // Czasami Excel jest wykrywany jako octet-stream
];

if (!in_array($fileType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Nieprawidłowy typ pliku. Dozwolone tylko pliki Excel (.xlsx, .xls).']);
    exit;
}

// Zapisz plik z bezpieczną ścieżką
$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Przygotuj katalog logów
$logsDir = __DIR__ . '/logs/';
if (!is_dir($logsDir)) {
    mkdir($logsDir, 0755, true);
}

$fileName = $date . '.xlsx'; // Używamy zweryfikowanej daty
$uploadFile = $uploadDir . $fileName;

if (move_uploaded_file($_FILES['file']['tmp_name'], $uploadFile)) {
    // Logowanie akcji
    $logMessage = date('Y-m-d H:i:s') . " - Przesłano plik: {$fileName} przez " . $response['users'][0]['email'] . "\n";
    file_put_contents($logsDir . 'file_operations.log', $logMessage, FILE_APPEND);
    
    echo json_encode(['message' => 'Plik przesłany jako ' . $fileName]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Błąd zapisu pliku.']);
}
?>