<?php
/**
 * Customer Order Cancellation API with Atomic Stock Restoration
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/validation.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../services/email.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', [], 405);
}

$user   = requireAuth();
$userId = (int)$user['id'];
$data   = Response::getRequestData();

$orderId = $data['order_id'] ?? null;
if (!Validator::isPositiveInt($orderId)) {
    Response::error('Invalid order ID provided.', [], 400);
}

$db = Database::getConnection();

try {
    $db->beginTransaction();

    // Lock order row for update
    $stmt = $db->prepare("SELECT id, user_id, order_status, total_amount FROM orders WHERE id = ? FOR UPDATE");
    $stmt->execute([(int)$orderId]);
    $order = $stmt->fetch();

    if (!$order) {
        $db->rollBack();
        Response::error('Order not found.', [], 404);
    }

    // Ownership check (only order owner or admin can cancel)
    if ($user['role'] !== 'admin' && (int)$order['user_id'] !== $userId) {
        $db->rollBack();
        Response::error('Access denied. You can only cancel your own orders.', [], 403);
    }

    // Business Rule: Pending or Confirmed orders can be cancelled before dispatch
    if ($order['order_status'] === 'cancelled') {
        $db->rollBack();
        Response::error('This order has already been cancelled.', [], 400);
    }

    if (!in_array($order['order_status'], ['pending', 'confirmed'])) {
        $db->rollBack();
        Response::error("Cannot cancel order with status '{$order['order_status']}'. The item has already been dispatched. Please contact customer support for return requests.", [], 400);
    }

    $reason = Validator::sanitize($data['reason'] ?? 'Cancelled by customer');

    // Restore stock for all items
    $itemsStmt = $db->prepare("SELECT product_id, quantity FROM order_items WHERE order_id = ?");
    $itemsStmt->execute([(int)$orderId]);
    $items = $itemsStmt->fetchAll();

    $restoreStmt = $db->prepare("UPDATE products SET stock = stock + ? WHERE id = ?");
    foreach ($items as $item) {
        $restoreStmt->execute([(int)$item['quantity'], (int)$item['product_id']]);
    }

    // Update order status and record cancellation reason
    $cancelStmt = $db->prepare("UPDATE orders SET order_status = 'cancelled', cancel_reason = ?, updated_at = NOW() WHERE id = ?");
    $cancelStmt->execute([$reason, (int)$orderId]);

    // If customer already paid online/UPI, trigger refund workflow
    if ($order['payment_status'] === 'paid') {
        $refOrder = $db->prepare("UPDATE orders SET payment_status = 'refunded' WHERE id = ?");
        $refOrder->execute([(int)$orderId]);

        $refundTxnId = 'REFUND-' . date('YmdHis') . '-' . (int)$orderId;
        $refPayStmt = $db->prepare("
            INSERT INTO payments (order_id, payment_method, transaction_id, amount, status, gateway_response)
            VALUES (?, 'Instant Refund', ?, ?, 'refunded', ?)
        ");
        $refPayStmt->execute([
            (int)$orderId,
            $refundTxnId,
            (float)$order['total_amount'],
            "100% Refund credited back to original payment method. Reason: {$reason}"
        ]);
    }

    $db->commit();

    // Send Cancellation Notification
    EmailService::sendOrderStatusUpdate($user['email'], $user['name'], (int)$orderId, 'cancelled', $userId);

    Response::success([
        'order_id'      => (int)$orderId,
        'order_status'  => 'cancelled',
        'cancel_reason' => $reason
    ], 'Order has been successfully cancelled and stock restored to inventory.');

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    error_log("Order cancellation error: " . $e->getMessage());
    Response::error('Could not cancel order: ' . $e->getMessage(), [], 500);
}
