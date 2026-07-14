<?php
/**
 * Server-side proxy for Gemini note generation.
 *
 * Runs on the Assignments4U web host (PHP). The Gemini API key lives
 * in config.php next to this file — config.php is git-ignored and
 * uploaded only via SFTP, so the key never appears in the repo or
 * in anything served to the browser.
 */

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Server is not configured (missing API key).']);
    exit;
}
$apiKey = trim((string) require $configPath);
if ($apiKey === '') {
    http_response_code(500);
    echo json_encode(['error' => 'Server is not configured (missing API key).']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$text  = isset($input['text']) && is_string($input['text']) ? $input['text'] : '';
$style = isset($input['style']) && is_string($input['style']) ? $input['style'] : 'bullets';

if (mb_strlen(trim($text)) < 100) {
    http_response_code(400);
    echo json_encode(['error' => 'Please provide at least 100 characters of material.']);
    exit;
}

$maxChars = 100000;
if (mb_strlen($text) > $maxChars) {
    $text = mb_substr($text, 0, $maxChars);
}

$styleInstructions = [
    'outline'  => 'Create a hierarchical outline with numbered main topics, lettered subtopics, and short supporting points. Keep entries concise.',
    'bullets'  => 'Create clean bullet-point notes grouped under short bold section headings. Each bullet must capture one idea in one line where possible.',
    'detailed' => 'Create detailed study notes with section headings, short explanatory paragraphs, bullet lists for key facts, and a "Key Takeaways" section at the end.',
    'qa'       => 'Create question-and-answer flashcard notes. Write each as "**Q:** ..." followed by "**A:** ...". Cover every important concept in the material.',
];
$styleRule = isset($styleInstructions[$style]) ? $styleInstructions[$style] : $styleInstructions['bullets'];

$prompt = <<<PROMPT
You are an expert study-notes writer for a student learning platform.

Convert the material below into clear, well-organized study notes.

Formatting rules:
- {$styleRule}
- Use Markdown formatting (headings, bold key terms, bullet lists).
- Start with a single H2 title summarizing the topic.
- Highlight definitions, dates, formulas, and names in **bold**.
- Do not add information that is not in the material.
- Do not include any preamble or closing remarks — output only the notes.

MATERIAL:
"""
{$text}
"""
PROMPT;

$payload = json_encode([
    'contents' => [['parts' => [['text' => $prompt]]]],
    'generationConfig' => [
        'temperature'     => 0.3,
        'maxOutputTokens' => 8192,
    ],
]);

$ch = curl_init('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 90,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'x-goog-api-key: ' . $apiKey,
    ],
]);
$response = curl_exec($ch);
$status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

if ($response === false) {
    error_log('Gemini request failed: ' . $curlErr);
    http_response_code(502);
    echo json_encode(['error' => 'Could not reach the AI service. Please try again.']);
    exit;
}

if ($status === 429) {
    http_response_code(429);
    echo json_encode(['error' => 'Too many requests right now. Please wait a moment and try again.']);
    exit;
}

if ($status < 200 || $status >= 300) {
    error_log('Gemini API error ' . $status . ': ' . substr($response, 0, 500));
    http_response_code(502);
    echo json_encode(['error' => 'The AI service returned an error. Please try again.']);
    exit;
}

$data  = json_decode($response, true);
$notes = '';
if (isset($data['candidates'][0]['content']['parts']) && is_array($data['candidates'][0]['content']['parts'])) {
    foreach ($data['candidates'][0]['content']['parts'] as $part) {
        if (isset($part['text'])) {
            $notes .= $part['text'];
        }
    }
}
$notes = trim($notes);

if ($notes === '') {
    http_response_code(502);
    echo json_encode(['error' => 'The AI returned an empty response. Please try again.']);
    exit;
}

echo json_encode(['notes' => $notes]);
