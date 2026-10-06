<?php
/**
 * User Login API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/validation.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', [], 405);
}

$data = Response::getRequestData();

$errors = Validator::required($data, ['email', 'password']);
if (!empty($errors)) {
    Response::error('Email and password are required.', $errors, 422);
}

$email    = trim(strtolower($data['email']));
$password = $data['password'];

if (!Validator::isEmail($email)) {
    Response::error('Please provide a valid email address.', [], 422);
}

$db = Database::getConnection();
$stmt = $db->prepare("SELECT id, name, email, password, phone, address, role, status FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    Response::error('Invalid email or password credentials.', [], 401);
}

if ((int)$user['status'] !== 1) {
    Response::error('Your account is inactive. Please contact support.', [], 403);
}

// Secure session regeneration
session_regenerate_id(true);
$_SESSION['user_id'] = (int)$user['id'];
$_SESSION['role']    = $user['role'];
$_SESSION['name']    = $user['name'];

unset($user['password']); // Never leak password hash

Response::success([
    'user' => [
        'id'      => (int)$user['id'],
        'name'    => $user['name'],
        'email'   => $user['email'],
        'phone'   => $user['phone'],
        'address' => $user['address'],
        'role'    => $user['role']
    ]
], 'Logged in successfully!');
