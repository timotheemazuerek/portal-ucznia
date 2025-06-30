<?php
require_once 'config.php'; // Plik z konfiguracją (klucz API Firebase)
header('Content-Type: application/json');

// Sprawdź token uwierzytelniający Firebase
$data = json_decode(file_get_contents('php://input'), true);
$idToken = $data['idToken'] ?? null;
$fileName = $data['fileName'] ?? null;

if (!$idToken || !$fileName) {
    http_response_code(400);
    echo json_encode(['error' => 'Brak tokenu lub nazwy pliku.']);
    exit;
}

// Sprawdź poprawność nazwy pliku (tylko data + .xlsx)
if (!preg_match('/^\d{4}-\d{2}-\d{2}\.xlsx$/', $fileName)) {
    http_response_code(400);
    echo json_encode(['error' => 'Nieprawidłowa nazwa pliku.']);
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

// Sprawdź uprawnienia administratora (opcjonalnie)
// $userEmail = $response['users'][0]['email'];
// if (!in_array($userEmail, $adminUsers)) {
//     http_response_code(403);
//     echo json_encode(['error' => 'Brak uprawnień.']);
//     exit;
// }

// Usuń plik z bezpieczną ścieżką
$uploadDir = __DIR__ . '/uploads/';
$filePath = $uploadDir . $fileName; // Nazwa jest już zweryfikowana przez regex

if (file_exists($filePath) && is_file($filePath)) {
    if (unlink($filePath)) {
        // Logowanie akcji (opcjonalnie)
        $logMessage = date('Y-m-d H:i:s') . " - Usunięto plik: {$fileName} przez " . $response['users'][0]['email'] . "\n";
        file_put_contents(__DIR__ . '/logs/file_operations.log', $logMessage, FILE_APPEND);
        
        echo json_encode(['message' => 'Plik usunięty pomyślnie.']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Nie można usunąć pliku.']);
    }
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Plik nie istnieje.']);
}
?>