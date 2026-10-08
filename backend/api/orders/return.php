<?php
/**
 * 7-Day Return & Replacement Request API (Amazon / Flipkart Style)
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/validation.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', [], 405);
}

$user = requireAuth();
$userId = (int)$user['id'];
$data = Response::getRequestData();

$orderId   = $data['order_id'] ?? null;
$productId = $data['product_id'] ?? null;
$returnType= in_array($data['return_type'] ?? '', ['refund', 'replacement']) ? $data['return_type'] : 'refund';
$reason    = Validator::sanitize($data['reason'] ?? '');
$comments  = Validator::sanitize($data['comments'] ?? '');

if (!Validator::isPositiveInt($orderId) || !Validator::isPositiveInt($productId)) {
    Response::error('Valid order ID and product ID are required.', [], 400);
}

if (empty($reason)) {
    Response::error('Please select a valid return / replacement reason.', [], 422);
}

$db = Database::getConnection();

// 1. Verify Order ownership and Delivered status
$stmt = $db->prepare("
    SELECT id, user_id, order_status, total_amount, created_at
    FROM orders
    WHERE id = ? AND user_id = ?
");
$stmt->execute([(int)$orderId, $userId]);
$order = $stmt->fetch();

if (!$order) {
    Response::error('Order not found or unauthorized.', [], 404);
}

if ($order['order_status'] !== 'delivered') {
    Response::error("Return/replacement is only applicable for delivered orders.", [], 400);
}

// 2. Fetch the item purchase price
$itemStmt = $db->prepare("
    SELECT quantity, price FROM order_items WHERE order_id = ? AND product_id = ?
");
$itemStmt->execute([(int)$orderId, (int)$productId]);
$item = $itemStmt->fetch();

if (!$item) {
    Response::error('This product was not found in the specified order.', [], 404);
}

$refundAmount = round((float)$item['price'] * (int)$item['quantity'], 2);
$pickupDate   = date('Y-m-d', strtotime('+2 days'));

// 3. Insert into order_returns
$insertStmt = $db->prepare("
    INSERT INTO order_returns (order_id, user_id, product_id, return_type, reason, comments, status, pickup_date, refund_amount)
    VALUES (?, ?, ?, ?, ?, ?, 'pickup_scheduled', ?, ?)
");
$insertStmt->execute([
    (int)$orderId, $userId, (int)$productId, $returnType, $reason, $comments, $pickupDate, $refundAmount
]);
$returnId = (int)$db->lastInsertId();

Response::success([
    'return_id'     => $returnId,
    'order_id'      => (int)$orderId,
    'product_id'    => (int)$productId,
    'return_type'   => $returnType,
    'status'        => 'pickup_scheduled',
    'pickup_date'   => $pickupDate,
    'refund_amount' => $refundAmount
], "Your {$returnType} request has been approved! Doorstep courier pickup has been scheduled for " . date('D, d M Y', strtotime($pickupDate)) . ".");
