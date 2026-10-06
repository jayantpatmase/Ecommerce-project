<?php
/**
 * Update User Shipping Address API
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

$errors = Validator::required($data, ['address']);
if (!empty($errors)) {
    Response::error('Address is required', $errors, 422);
}

$address = Validator::sanitize($data['address']);

$db = Database::getConnection();
$stmt = $db->prepare("UPDATE users SET address = ? WHERE id = ?");
$stmt->execute([$address, $user['id']]);

Response::success([
    'address' => $address
], 'Address updated successfully.');
