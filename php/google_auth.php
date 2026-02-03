<?php
require_once '../vendor/autoload.php';
session_start();

// Google Client Configuration
$clientID = '444647290132-pqv7gcbrqf5qadie72df1et302b8ak0h.apps.googleusercontent.com';
$clientSecret = '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';
$redirectUri = 'http://localhost/abel_project/php/google_auth.php';

// create Client Request to access Google API
$client = new Google_Client();
$client->setClientId($clientID);
$client->setClientSecret($clientSecret);
$client->setRedirectUri($redirectUri);
$client->addScope("email");
$client->addScope("profile");

// authenticate code from Google OAuth Flow
if (isset($_GET['code'])) {
  $token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
  $client->setAccessToken($token['access_token']);

  // get profile info
  $google_oauth = new Google_Service_Oauth2($client);
  $google_account_info = $google_oauth->userinfo->get();
  $email =  $google_account_info->email;
  $name =  $google_account_info->name;

  // Database Connection
  require 'db_connect.php';

  // Check if user exists
  $stmt = $conn->prepare("SELECT id, username FROM users WHERE email = ?");
  $stmt->bind_param("s", $email);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows > 0) {
      // User exists, log them in
      $user = $result->fetch_assoc();
      $_SESSION['user_id'] = $user['id'];
      $_SESSION['username'] = $user['username'];
      header("Location: ../index.html");
  } else {
      // New user, create account
      // Note: Google doesn't provide a password, so we might need a flag "is_google_auth" or set a random password
      $random_pass = bin2hex(random_bytes(10));
      $hashed_pass = password_hash($random_pass, PASSWORD_BCRYPT);
      $verification_code = 'VERIFIED'; 
      
      $stmt = $conn->prepare("INSERT INTO users (username, email, password, verification_code) VALUES (?, ?, ?, ?)");
      $stmt->bind_param("ssss", $name, $email, $hashed_pass, $verification_code);
      
      if ($stmt->execute()) {
          $_SESSION['user_id'] = $stmt->insert_id;
          $_SESSION['username'] = $name;
          header("Location: ../index.html");
      } else {
          echo "Error creating account: " . $conn->error;
      }
  }
  exit();
} else {
  // Create auth URL
  $authUrl = $client->createAuthUrl();
  header("Location: " . $authUrl);
  exit();
}
?>