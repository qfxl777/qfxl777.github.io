<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$allowedHosts = [
    'ssrcat.bar',
    'ssrcat.top',
    'ssrcat.life',
];

$host = strtolower(trim((string)($_GET['host'] ?? '')));
if (!in_array($host, $allowedHosts, true)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'status' => 0, 'latencyMs' => 0, 'error' => 'invalid_host']);
    exit;
}

$url = 'https://' . $host . '/';
$startedAt = microtime(true);
$curl = curl_init($url);
curl_setopt_array($curl, [
    CURLOPT_NOBODY => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 4,
    CURLOPT_CONNECTTIMEOUT_MS => 3000,
    CURLOPT_TIMEOUT_MS => 5500,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_USERAGENT => 'SsrCat-HealthCheck/1.0',
    CURLOPT_RETURNTRANSFER => true,
]);

curl_exec($curl);
$status = (int)curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
$error = curl_error($curl);
$errorNumber = curl_errno($curl);
curl_close($curl);

$latencyMs = max(1, (int)round((microtime(true) - $startedAt) * 1000));
$ok = $errorNumber === 0 && $status >= 200 && $status < 400;

echo json_encode([
    'ok' => $ok,
    'status' => $status,
    'latencyMs' => $latencyMs,
    'error' => $errorNumber === 0 ? null : $error,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
