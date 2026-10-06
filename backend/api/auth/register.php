<?php
/**
 * Customer Registration API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/validation.php';
require_once __DIR__ . '/../../services/email.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', [], 405);
}

$data = Response::getRequestData();

$errors = Validator::required($data, ['name', 'email', 'password', 'confirm_password']);
if (!empty($errors)) {
    Response::error('Validation failed', $errors, 422);
}

$name     = Validator::sanitize($data['name']);
$email    = trim(strtolower($data['email']));
$password = $data['password'];
$confirm  = $data['confirm_password'];
$phone    = isset($data['phone']) ? Validator::sanitize($data['phone']) : null;
$address  = isset($data['address']) ? Validator::sanitize($data['address']) : null;

if (!Validator::isEmail($email)) {
    Response::error('Please provide a valid email address.', ['email' => 'Invalid email format'], 422);
}

if (!Validator::isPasswordValid($password, 8)) {
    Response::error('Password must be at least 8 characters long.', ['password' => 'Minimum 8 characters required'], 422);
}

if ($password !== $confirm) {
    Response::error('Password confirmation does not match.', ['confirm_password' => 'Passwords do not match'], 422);
}

if ($phone && !Validator::isPhone($phone)) {
    Response::error('Invalid phone number format.', ['phone' => 'Invalid phone number'], 422);
}

$db = Database::getConnection();

// Check duplicate email
$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    Response::error('An account with this email already exists.', ['email' => 'Email already registered'], 409);
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

try {
    $insertStmt = $db->prepare("
        INSERT INTO users (name, email, password, phone, address, role, status)
        VALUES (?, ?, ?, ?, ?, 'customer', 1)
    ");
    $insertStmt->execute([$name, $email, $hashedPassword, $phone, $address]);
    $userId = (int)$db->lastInsertId();

    // Auto-login session upon registration
    session_regenerate_id(true);
    $_SESSION['user_id'] = $userId;
    $_SESSION['role']    = 'customer';
    $_SESSION['name']    = $name;

    // Trigger welcome email
    EmailService::sendWelcomeEmail($email, $name, $userId);

    Response::success([
        'user' => [
            'id'      => $userId,
            'name'    => $name,
            'email'   => $email,
            'phone'   => $phone,
            'address' => $address,
            'role'    => 'customer'
        ]
    ], 'Account registered successfully!', 201);
} catch (PDOException $e) {
    error_log("Registration error: " . $e->getMessage());
    Response::error('Registration could not be completed. Please try again.', [], 500);
}
