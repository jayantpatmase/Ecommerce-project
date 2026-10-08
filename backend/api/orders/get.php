<?php
/**
 * Single Order Details API with Strict Ownership Validation
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/validation.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user   = requireAuth();
$userId = (int)$user['id'];
$orderId = $_GET['id'] ?? null;

if (!Validator::isPositiveInt($orderId)) {
    Response::error('Invalid or missing order ID.', [], 400);
}

$db = Database::getConnection();

// Fetch order
$stmt = $db->prepare("
    SELECT o.id, o.user_id, o.total_amount, o.shipping_address, o.payment_method,
           o.payment_status, o.order_status, o.cancel_reason, o.tracking_number, o.courier_name,
           o.created_at, o.updated_at,
           u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone
    FROM orders o
    JOIN users u ON u.id = o.user_id
    WHERE o.id = ?
");
$stmt->execute([(int)$orderId]);
$order = $stmt->fetch();

if (!$order) {
    Response::error('Order not found.', [], 404);
}

// Ownership Authorization Check
if ($user['role'] !== 'admin' && (int)$order['user_id'] !== $userId) {
    Response::error('Access denied. You do not have permission to view this order.', [], 403);
}

// Fetch order items with purchased price
$itemStmt = $db->prepare("
    SELECT oi.id, oi.product_id, oi.quantity, oi.price AS purchase_price,
           p.name AS product_name, p.image AS product_image,
           c.name AS category_name
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    JOIN categories c ON c.id = p.category_id
    WHERE oi.order_id = ?
");
$itemStmt->execute([(int)$orderId]);
$items = $itemStmt->fetchAll();

foreach ($items as &$it) {
    $it['id']             = (int)$it['id'];
    $it['product_id']     = (int)$it['product_id'];
    $it['quantity']       = (int)$it['quantity'];
    $it['purchase_price'] = (float)$it['purchase_price'];
    $it['item_total']     = round($it['quantity'] * $it['purchase_price'], 2);
}

$order['id']           = (int)$order['id'];
$order['user_id']      = (int)$order['user_id'];
$order['total_amount'] = (float)$order['total_amount'];
$order['items']        = $items;

// Fetch Invoice details if available
$invStmt = $db->prepare("SELECT invoice_number, invoice_date, file_path FROM invoices WHERE order_id = ?");
$invStmt->execute([(int)$orderId]);
$order['invoice'] = $invStmt->fetch() ?: null;

// Fetch Payment history
$payStmt = $db->prepare("SELECT payment_method, transaction_id, amount, status, created_at FROM payments WHERE order_id = ?");
$payStmt->execute([(int)$orderId]);
$order['payment_records'] = $payStmt->fetchAll();

Response::success($order, 'Order details loaded successfully.');
