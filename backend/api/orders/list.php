<?php
/**
 * Customer Orders List API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user   = requireAuth();
$userId = (int)$user['id'];
$db     = Database::getConnection();

$stmt = $db->prepare("
    SELECT o.id, o.total_amount, o.shipping_address, o.payment_method,
           o.payment_status, o.order_status, o.cancel_reason, o.tracking_number, o.courier_name,
           o.created_at,
           COUNT(oi.id) AS item_count,
           SUM(oi.quantity) AS total_items
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
");
$stmt->execute([$userId]);
$orders = $stmt->fetchAll();

$itemsStmt = $db->prepare("
    SELECT oi.order_id, oi.product_id, oi.quantity, oi.price, p.name AS product_name, p.image AS product_image
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
");

foreach ($orders as &$ord) {
    $ord['id']           = (int)$ord['id'];
    $ord['total_amount'] = (float)$ord['total_amount'];
    $ord['item_count']   = (int)$ord['item_count'];
    $ord['total_items']  = (int)($ord['total_items'] ?? 0);

    $itemsStmt->execute([$ord['id']]);
    $ord['items'] = $itemsStmt->fetchAll();
}

Response::success($orders, 'Orders retrieved successfully.');
