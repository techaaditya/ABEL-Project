<?php
session_start();
include 'db_connect.php';

$input = json_decode(file_get_contents('php://input'), true);
$user_msg = $input['message'];
$user_id = $_SESSION['user_id'] ?? 1; // Default to 1 if testing

// 1. Call Python API (FastAPI)
$url = 'http://127.0.0.1:8000/chat';
$data = json_encode(['message' => $user_msg, 'user_id' => $user_id]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type:application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$ai_data = json_decode($response, true);
$bot_msg = $ai_data['reply'] ?? "Error connecting to AI service.";

// 2. Save to MySQL History
$stmt = $conn->prepare("INSERT INTO chat_history (user_id, user_msg, bot_msg) VALUES (?, ?, ?)");
$stmt->bind_param("iss", $user_id, $user_msg, $bot_msg);
$stmt->execute();

// 3. Return to Frontend
echo json_encode(['reply' => $bot_msg]);
?>
