<?php
require_once 'config.php'; // Plik z konfiguracją (klucz API Firebase)
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$idToken = $data['idToken'] ?? null;

if (!$idToken) {
    http_response_code(400);
    echo json_encode(['error' => 'Brak tokenu uwierzytelniającego.']);
    exit;
}

// Weryfikacja tokenu Firebase
$url = 'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' . FIREBASE_API_KEY;
$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode(['idToken' => $idToken]),
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

// Pobierz listę plików z bezpiecznego katalogu
$uploadDir = __DIR__ . '/uploads/';
$files = [];

if (is_dir($uploadDir)) {
    $allFiles = scandir($uploadDir);
    foreach ($allFiles as $file) {
        // Sprawdź czy plik ma poprawną nazwę (data.xlsx)
        if ($file !== '.' && $file !== '..' && preg_match('/^\d{4}-\d{2}-\d{2}\.xlsx$/', $file)) {
            $files[] = $file;
        }
    }
}

// Sortuj pliki według daty (najnowsze pierwsze)
usort($files, function($a, $b) {
    $dateA = substr($a, 0, 10);
    $dateB = substr($b, 0, 10);
    return strcmp($dateB, $dateA);
});

echo json_encode($files);
?>