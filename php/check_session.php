<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    // Fetch user data from database
    include 'db_connect.php';
    
    $stmt = $conn->prepare("SELECT id, username, email FROM users WHERE id = ?");
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        echo json_encode([
            'logged_in' => true,
            'user' => [
                'id' => $row['id'],
                'username' => $row['username'],
                'email' => $row['email']
            ]
        ]);
    } else {
        // Session exists but user not found
        session_destroy();
        echo json_encode(['logged_in' => false]);
    }
} else {
    echo json_encode(['logged_in' => false]);
}
?>
