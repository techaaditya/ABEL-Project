<?php
session_start();
include 'db_connect.php';

header('Content-Type: application/json');

// SIGNUP
if (isset($_POST['signup'])) {
    $email = $_POST['email'] ?? '';
    $username = $_POST['username'] ?? '';
    $pass = password_hash($_POST['password'] ?? '', PASSWORD_BCRYPT);
    
    // Check if email already exists
    $check = $conn->prepare("SELECT id FROM users WHERE email=?");
    $check->bind_param("s", $email);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        echo json_encode(['success' => false, 'error' => 'Email already registered']);
        exit();
    }
    
    // Auto-verify user (is_verified = 1)
    $stmt = $conn->prepare("INSERT INTO users (username, email, password, is_verified) VALUES (?, ?, ?, 1)");
    $stmt->bind_param("sss", $username, $email, $pass);
    
    if ($stmt->execute()) {
        $_SESSION['user_id'] = $stmt->insert_id;
        $_SESSION['username'] = $username;
        $_SESSION['email'] = $email;
        echo json_encode([
            'success' => true, 
            'user' => [
                'id' => $stmt->insert_id,
                'username' => $username,
                'email' => $email
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Registration failed']);
    }
    exit();
}

// LOGIN
if (isset($_POST['login'])) {
    $email = $_POST['email'] ?? '';
    $pass = $_POST['password'] ?? '';
    
    $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE email=?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        if (password_verify($pass, $row['password'])) {
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['username'] = $row['username'];
            $_SESSION['email'] = $email;
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $row['id'],
                    'username' => $row['username'],
                    'email' => $email
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Invalid password']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'User not found']);
    }
    exit();
}

echo json_encode(['success' => false, 'error' => 'Invalid request']);
?>
