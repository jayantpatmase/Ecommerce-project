<?php
/**
 * Update Profile Endpoint
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/validation.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', [], 405);
}

$user = requireAuth();
$data = Response::getRequestData();

$errors = Validator::required($data, ['name']);
if (!empty($errors)) {
    Response::error('Name is required', $errors, 422);
}

$name    = Validator::sanitize($data['name']);
$phone   = isset($data['phone']) ? Validator::sanitize($data['phone']) : null;
$address = isset($data['address']) ? Validator::sanitize($data['address']) : null;

if ($phone && !Validator::isPhone($phone)) {
    Response::error('Invalid phone number format.', ['phone' => 'Invalid format'], 422);
}

$db = Database::getConnection();
$stmt = $db->prepare("UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?");
$stmt->execute([$name, $phone, $address, $user['id']]);

$_SESSION['name'] = $name;

Response::success([
    'user' => [
        'id'      => (int)$user['id'],
        'name'    => $name,
        'email'   => $user['email'],
        'phone'   => $phone,
        'address' => $address,
        'role'    => $user['role']
    ]
], 'Profile updated successfully.');
