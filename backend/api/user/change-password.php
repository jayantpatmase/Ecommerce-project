<?php
/**
 * Change Password API
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

$errors = Validator::required($data, ['current_password', 'new_password', 'confirm_password']);
if (!empty($errors)) {
    Response::error('All fields are required', $errors, 422);
}

$currentPassword = $data['current_password'];
$newPassword     = $data['new_password'];
$confirmPassword = $data['confirm_password'];

if (!Validator::isPasswordValid($newPassword, 8)) {
    Response::error('New password must be at least 8 characters long.', ['new_password' => 'Too short'], 422);
}

if ($newPassword !== $confirmPassword) {
    Response::error('New password and confirm password do not match.', ['confirm_password' => 'Mismatch'], 422);
}

$db = Database::getConnection();
$stmt = $db->prepare("SELECT password FROM users WHERE id = ?");
$stmt->execute([$user['id']]);
$row = $stmt->fetch();

if (!$row || !password_verify($currentPassword, $row['password'])) {
    Response::error('Current password is incorrect.', ['current_password' => 'Invalid current password'], 400);
}

$newHashed = password_hash($newPassword, PASSWORD_BCRYPT);
$updateStmt = $db->prepare("UPDATE users SET password = ? WHERE id = ?");
$updateStmt->execute([$newHashed, $user['id']]);

Response::success([], 'Password changed successfully!');
