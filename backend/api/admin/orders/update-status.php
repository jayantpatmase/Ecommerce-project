<?php
/**
 * Administrator Update Order Status API
 * Strict business rules: Enforces allowed state transitions and stock integrity
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/response.php';
require_once __DIR__ . '/../../../config/validation.php';
require_once __DIR__ . '/../../../middleware/admin.php';
require_once __DIR__ . '/../../../services/email.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', [], 405);
}

$admin = requireAdmin();
$data  = Response::getRequestData();

$errors = Validator::required($data, ['order_id', 'order_status']);
if (!empty($errors)) {
    Response::error('Validation failed', $errors, 422);
}

$orderId   = (int)$data['order_id'];
$newStatus = strtolower(trim($data['order_status']));
$newPayStatus = isset($data['payment_status']) ? strtolower(trim($data['payment_status'])) : null;

$allowedStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];
if (!in_array($newStatus, $allowedStatuses, true)) {
    Response::error("Invalid order status '{$newStatus}'.", [], 422);
}

$db = Database::getConnection();

try {
    $db->beginTransaction();

    // Lock Order
    $stmt = $db->prepare("
        SELECT o.id, o.user_id, o.order_status, o.payment_status, o.total_amount,
               u.name AS customer_name, u.email AS customer_email
        FROM orders o
        JOIN users u ON u.id = o.user_id
        WHERE o.id = ?
        FOR UPDATE
    ");
    $stmt->execute([$orderId]);
    $order = $stmt->fetch();

    if (!$order) {
        $db->rollBack();
        Response::error('Order not found.', [], 404);
    }

    $currentStatus = $order['order_status'];

    if ($currentStatus === $newStatus && (!$newPayStatus || $newPayStatus === $order['payment_status'])) {
        $db->rollBack();
        Response::success(['order_id' => $orderId, 'order_status' => $currentStatus], 'Status is already set to ' . $newStatus);
    }

    // Business Rule 9: Cancelled orders cannot be re-opened or cancelled again
    if ($currentStatus === 'cancelled') {
        $db->rollBack();
        Response::error('This order is cancelled and its status cannot be modified.', [], 400);
    }

    // Business Rule: Delivered orders cannot be cancelled
    if ($currentStatus === 'delivered' && $newStatus === 'cancelled') {
        $db->rollBack();
        Response::error('Delivered orders cannot be cancelled.', [], 400);
    }

    // If transitioning to 'cancelled', restore stock
    if ($newStatus === 'cancelled') {
        $itemsStmt = $db->prepare("SELECT product_id, quantity FROM order_items WHERE order_id = ?");
        $itemsStmt->execute([$orderId]);
        $items = $itemsStmt->fetchAll();

        $restoreStmt = $db->prepare("UPDATE products SET stock = stock + ? WHERE id = ?");
        foreach ($items as $item) {
            $restoreStmt->execute([(int)$item['quantity'], (int)$item['product_id']]);
        }
    }

    // Determine payment status update if applicable (e.g., Cash on Delivery marked paid when delivered)
    $paymentStatusToSet = $order['payment_status'];
    if ($newPayStatus && in_array($newPayStatus, ['pending', 'paid', 'failed', 'refunded'], true)) {
        $paymentStatusToSet = $newPayStatus;
    } elseif ($newStatus === 'delivered' && $order['payment_status'] === 'pending') {
        $paymentStatusToSet = 'paid';
    }

    $upStmt = $db->prepare("
        UPDATE orders 
        SET order_status = ?, payment_status = ?, updated_at = NOW() 
        WHERE id = ?
    ");
    $upStmt->execute([$newStatus, $paymentStatusToSet, $orderId]);

    $db->commit();

    // Trigger customer notification
    EmailService::sendOrderStatusUpdate($order['customer_email'], $order['customer_name'], $orderId, $newStatus, (int)$order['user_id']);

    Response::success([
        'order_id'       => $orderId,
        'order_status'   => $newStatus,
        'payment_status' => $paymentStatusToSet
    ], 'Order status updated successfully.');

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    error_log("Admin order status update error: " . $e->getMessage());
    Response::error('Failed to update order status: ' . $e->getMessage(), [], 500);
}
