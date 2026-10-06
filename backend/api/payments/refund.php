<?php
/**
 * Payment Refund API (Admin / Authorized Cancellation)
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/validation.php';
require_once __DIR__ . '/../../middleware/admin.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', [], 405);
}

$admin = requireAdmin();
$data  = Response::getRequestData();

$orderId = $data['order_id'] ?? null;
if (!Validator::isPositiveInt($orderId)) {
    Response::error('Valid order ID is required.', [], 400);
}

$db = Database::getConnection();

try {
    $db->beginTransaction();

    $stmt = $db->prepare("SELECT id, payment_status, total_amount, order_status FROM orders WHERE id = ? FOR UPDATE");
    $stmt->execute([(int)$orderId]);
    $order = $stmt->fetch();

    if (!$order) {
        $db->rollBack();
        Response::error('Order not found.', [], 404);
    }

    if ($order['payment_status'] !== 'paid') {
        $db->rollBack();
        Response::error('Only paid orders can be refunded.', [], 400);
    }

    $refTxn = 'REFUND_' . strtoupper(bin2hex(random_bytes(6))) . '_' . time();
    $amount = (float)$order['total_amount'];

    $refStmt = $db->prepare("
        INSERT INTO payments (order_id, payment_method, transaction_id, amount, status, gateway_response, created_at)
        VALUES (?, 'Refund', ?, ?, 'refunded', '{\"reason\":\"Admin processed refund\"}', NOW())
    ");
    $refStmt->execute([(int)$orderId, $refTxn, -$amount]);

    $upOrder = $db->prepare("UPDATE orders SET payment_status = 'refunded', order_status = 'cancelled', updated_at = NOW() WHERE id = ?");
    $upOrder->execute([(int)$orderId]);

    $db->commit();
    Response::success([
        'order_id'       => (int)$orderId,
        'refund_txn'     => $refTxn,
        'payment_status' => 'refunded'
    ], 'Refund processed successfully.');

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    Response::error('Refund processing failed: ' . $e->getMessage(), [], 500);
}
