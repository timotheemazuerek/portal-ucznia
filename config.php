<?php
// Plik konfiguracyjny - chroń ten plik przed dostępem z zewnątrz
// Umieść ten plik poza katalogiem publicznym lub zabezpiecz go w .htaccess

// Klucz API Firebase
define('FIREBASE_API_KEY', 'AIzaSyBvegeEvSxBlx-1UUhD_PIywpjW3TlL8So');

// Opcjonalnie: lista administratorów
$adminUsers = [
    // Lista email-i użytkowników z uprawnieniami administratora
    'admin@example.com',
    // Dodaj więcej email-i w razie potrzeby
];

// Konfiguracja katalogów
define('UPLOAD_DIR', __DIR__ . '/uploads/');
define('LOGS_DIR', __DIR__ . '/logs/');

// Tworzenie katalogów, jeśli nie istnieją
if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

if (!is_dir(LOGS_DIR)) {
    mkdir(LOGS_DIR, 0755, true);
}

// Funkcja do weryfikacji tokenu Firebase (można użyć w różnych miejscach)
function verifyFirebaseToken($idToken) {
    if (!$idToken) {
        return false;
    }
    
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
        return false;
    }
    
    $response = json_decode($result, true);
    if (!isset($response['users']) || empty($response['users'])) {
        return false;
    }
    
    return $response['users'][0];
}
?>