<?php
/**
 * Create Payment Session / Intent API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/validation.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', [], 405);
}

$user   = requireAuth();
$userId = (int)$user['id'];
$data   = Response::getRequestData();

$orderId = $data['order_id'] ?? null;
if (!Validator::isPositiveInt($orderId)) {
    Response::error('Valid order ID is required.', [], 400);
}

$db = Database::getConnection();

// Validate order belongs to user and is pending payment
$stmt = $db->prepare("SELECT id, user_id, total_amount, payment_status, order_status FROM orders WHERE id = ?");
$stmt->execute([(int)$orderId]);
$order = $stmt->fetch();

if (!$order) {
    Response::error('Order not found.', [], 404);
}

if ($user['role'] !== 'admin' && (int)$order['user_id'] !== $userId) {
    Response::error('Access denied.', [], 403);
}

if ($order['payment_status'] === 'paid') {
    Response::error('This order is already paid.', [], 400);
}

if ($order['order_status'] === 'cancelled') {
    Response::error('Cannot pay for a cancelled order.', [], 400);
}

$amount = (float)$order['total_amount'];
$transactionId = 'TXN_' . strtoupper(bin2hex(random_bytes(6))) . '_' . time();
$methodToStore = !empty($order['payment_method']) ? $order['payment_method'] : 'Online Payment';

// Record pending payment intent
$payStmt = $db->prepare("
    INSERT INTO payments (order_id, payment_method, transaction_id, amount, status, gateway_response, created_at)
    VALUES (?, ?, ?, ?, 'pending', '{\"intent_created\":true}', NOW())
");
$payStmt->execute([(int)$orderId, $methodToStore, $transactionId, $amount]);
$paymentId = (int)$db->lastInsertId();

Response::success([
    'payment_id'     => $paymentId,
    'order_id'       => (int)$orderId,
    'transaction_id' => $transactionId,
    'amount'         => $amount,
    'currency'       => 'INR',
    'status'         => 'pending'
], 'Payment session initiated.');
