<?php
/**
 * Payment Status API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/validation.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user   = requireAuth();
$userId = (int)$user['id'];
$orderId = $_GET['order_id'] ?? null;

if (!Validator::isPositiveInt($orderId)) {
    Response::error('Valid order ID is required.', [], 400);
}

$db = Database::getConnection();

// Check order ownership
$oStmt = $db->prepare("SELECT user_id, payment_status, total_amount FROM orders WHERE id = ?");
$oStmt->execute([(int)$orderId]);
$order = $oStmt->fetch();

if (!$order) {
    Response::error('Order not found.', [], 404);
}

if ($user['role'] !== 'admin' && (int)$order['user_id'] !== $userId) {
    Response::error('Access denied.', [], 403);
}

$stmt = $db->prepare("SELECT id, payment_method, transaction_id, amount, status, created_at FROM payments WHERE order_id = ? ORDER BY id DESC");
$stmt->execute([(int)$orderId]);
$payments = $stmt->fetchAll();

Response::success([
    'order_id'       => (int)$orderId,
    'payment_status' => $order['payment_status'],
    'total_amount'   => (float)$order['total_amount'],
    'payments'       => $payments
], 'Payment status loaded.');
