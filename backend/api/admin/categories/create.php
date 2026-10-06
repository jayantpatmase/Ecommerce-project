<?php
/**
 * Administrator Create Category API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/response.php';
require_once __DIR__ . '/../../../config/validation.php';
require_once __DIR__ . '/../../../middleware/admin.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', [], 405);
}

$admin = requireAdmin();
$data  = Response::getRequestData();

$errors = Validator::required($data, ['name']);
if (!empty($errors)) {
    Response::error('Category name is required.', $errors, 422);
}

$name        = Validator::sanitize($data['name']);
$description = isset($data['description']) ? Validator::sanitize($data['description']) : '';
$status      = isset($data['status']) ? (int)$data['status'] : 1;

$db = Database::getConnection();

// Check unique name
$check = $db->prepare("SELECT id FROM categories WHERE name = ?");
$check->execute([$name]);
if ($check->fetch()) {
    Response::error('A category with this name already exists.', [], 409);
}

$stmt = $db->prepare("INSERT INTO categories (name, description, status, created_at) VALUES (?, ?, ?, NOW())");
$stmt->execute([$name, $description, $status]);
$categoryId = (int)$db->lastInsertId();

Response::success([
    'id'          => $categoryId,
    'name'        => $name,
    'description' => $description,
    'status'      => $status
], 'Category created successfully!', 201);
