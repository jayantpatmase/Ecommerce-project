<?php
/**
 * Administrator Soft Delete / Disable Product API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/response.php';
require_once __DIR__ . '/../../../middleware/admin.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', [], 405);
}

$admin = requireAdmin();
$data  = Response::getRequestData();

$id = $data['id'] ?? ($_GET['id'] ?? null);
if (!$id) {
    Response::error('Product ID is required.', [], 400);
}

$db = Database::getConnection();

// Rule 42: Use soft delete (UPDATE products SET status = 0 WHERE id = ?)
// Preserves historical integrity for completed orders
$stmt = $db->prepare("UPDATE products SET status = 0, updated_at = NOW() WHERE id = ?");
$stmt->execute([(int)$id]);

if ($stmt->rowCount() > 0) {
    Response::success(['id' => (int)$id, 'status' => 0], 'Product deactivated (soft deleted).');
} else {
    Response::error('Product not found or already inactive.', [], 404);
}
