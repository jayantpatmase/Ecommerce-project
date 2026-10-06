<?php
/**
 * Administrator Update Category API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/response.php';
require_once __DIR__ . '/../../../config/validation.php';
require_once __DIR__ . '/../../../middleware/admin.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', [], 405);
}

$admin = requireAdmin();
$data  = Response::getRequestData();

$errors = Validator::required($data, ['id', 'name']);
if (!empty($errors)) {
    Response::error('Validation failed', $errors, 422);
}

$id          = (int)$data['id'];
$name        = Validator::sanitize($data['name']);
$description = isset($data['description']) ? Validator::sanitize($data['description']) : '';
$status      = isset($data['status']) ? (int)$data['status'] : 1;

$db = Database::getConnection();

// Check uniqueness excluding self
$check = $db->prepare("SELECT id FROM categories WHERE name = ? AND id != ?");
$check->execute([$name, $id]);
if ($check->fetch()) {
    Response::error('Another category already uses this name.', [], 409);
}

$stmt = $db->prepare("UPDATE categories SET name = ?, description = ?, status = ? WHERE id = ?");
$stmt->execute([$name, $description, $status, $id]);

Response::success([
    'id'          => $id,
    'name'        => $name,
    'description' => $description,
    'status'      => $status
], 'Category updated successfully.');
