<?php
include 'db_connect.php';

// 1. Create conversations table
$sql1 = "CREATE TABLE IF NOT EXISTS conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) DEFAULT 'New Chat',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";

if ($conn->query($sql1) === TRUE) {
    echo "Table conversations created/checked.<br>";
} else {
    echo "Error creating conversations: " . $conn->error . "<br>";
}

// 2. Create messages table (new structure)
$sql2 = "CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender ENUM('user', 'bot') NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
)";

if ($conn->query($sql2) === TRUE) {
    echo "Table messages created/checked.<br>";
} else {
    echo "Error creating messages: " . $conn->error . "<br>";
}

echo "Database migration complete.";
?>