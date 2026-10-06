<?php
/**
 * Administrator Update Inventory Stock API
 * Rule 10: Stock must never become negative
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

$errors = Validator::required($data, ['product_id', 'stock']);
if (!empty($errors)) {
    Response::error('Validation failed', $errors, 422);
}

$productId = (int)$data['product_id'];
$stock     = (int)$data['stock'];

if ($stock < 0) {
    Response::error('Stock cannot be negative.', ['stock' => 'Non-negative number required'], 422);
}

$db = Database::getConnection();

$stmt = $db->prepare("UPDATE products SET stock = ?, updated_at = NOW() WHERE id = ?");
$stmt->execute([$stock, $productId]);

if ($stmt->rowCount() >= 0) {
    Response::success([
        'product_id' => $productId,
        'stock'      => $stock
    ], 'Inventory stock updated successfully.');
} else {
    Response::error('Product not found.', [], 404);
}
