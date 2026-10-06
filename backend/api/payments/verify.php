<?php
/**
 * Server-Side Payment Verification API
 * Strict security: Never trust client-side claims without server validation
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

$errors = Validator::required($data, ['order_id', 'transaction_id']);
if (!empty($errors)) {
    Response::error('Validation failed', $errors, 422);
}

$orderId       = (int)$data['order_id'];
$transactionId = trim($data['transaction_id']);
$simulateFail  = isset($data['simulate_failure']) && $data['simulate_failure'] == true;

$db = Database::getConnection();

try {
    $db->beginTransaction();

    // 1. Fetch Order with Lock
    $oStmt = $db->prepare("SELECT id, user_id, total_amount, payment_status, order_status FROM orders WHERE id = ? FOR UPDATE");
    $oStmt->execute([$orderId]);
    $order = $oStmt->fetch();

    if (!$order) {
        $db->rollBack();
        Response::error('Order not found.', [], 404);
    }

    if ($user['role'] !== 'admin' && (int)$order['user_id'] !== $userId) {
        $db->rollBack();
        Response::error('Access denied.', [], 403);
    }

    // 2. Fetch Payment Record
    $pStmt = $db->prepare("SELECT id, amount, status FROM payments WHERE order_id = ? AND transaction_id = ? FOR UPDATE");
    $pStmt->execute([$orderId, $transactionId]);
    $payment = $pStmt->fetch();

    if (!$payment) {
        $db->rollBack();
        Response::error('Invalid transaction record. Payment verification failed.', [], 400);
    }

    // If client requested simulated failure for testing payment retry flows
    if ($simulateFail) {
        $failStmt = $db->prepare("
            UPDATE payments 
            SET status = 'failed', 
                gateway_response = '{\"gateway\":\"SimulatedGateway\",\"status\":\"DECLINED\",\"reason\":\"Card Declined by Issuer\"}',
                updated_at = NOW() 
            WHERE id = ?
        ");
        $failStmt->execute([(int)$payment['id']]);
        
        $db->commit();
        Response::error('Payment was declined by payment gateway. Please retry with another payment method.', [
            'order_id'       => $orderId,
            'payment_status' => 'failed'
        ], 402);
    }

    // 3. Strict Server Verification: Verify Amount Matches Order Amount
    $orderTotal    = round((float)$order['total_amount'], 2);
    $paymentAmount = round((float)$payment['amount'], 2);

    if (abs($orderTotal - $paymentAmount) > 0.01) {
        $db->rollBack();
        Response::error("Payment amount mismatch! Expected: {$orderTotal}, Received: {$paymentAmount}", [], 400);
    }

    // 4. Update Payment status to paid
    $gatewayPayload = json_encode([
        'gateway'      => 'SecureOnlineGateway',
        'status'       => 'PAID_VERIFIED',
        'verified_at'  => date('c'),
        'reference'    => 'REF_' . strtoupper(bin2hex(random_bytes(4)))
    ]);

    $upPayStmt = $db->prepare("UPDATE payments SET status = 'paid', gateway_response = ?, updated_at = NOW() WHERE id = ?");
    $upPayStmt->execute([$gatewayPayload, (int)$payment['id']]);

    // 5. Update Order status
    $upOrdStmt = $db->prepare("UPDATE orders SET payment_status = 'paid', order_status = 'confirmed', updated_at = NOW() WHERE id = ?");
    $upOrdStmt->execute([$orderId]);

    // 6. Generate Invoice if not exists
    $invStmt = $db->prepare("SELECT id FROM invoices WHERE order_id = ?");
    $invStmt->execute([$orderId]);
    if (!$invStmt->fetch()) {
        $invNumber = 'INV-' . date('Y') . '-' . str_pad((string)$orderId, 5, '0', STR_PAD_LEFT);
        $makeInv = $db->prepare("
            INSERT INTO invoices (order_id, invoice_number, invoice_date, file_path, created_at)
            VALUES (?, ?, NOW(), ?, NOW())
        ");
        $makeInv->execute([$orderId, $invNumber, "/uploads/invoices/{$invNumber}.html"]);
    }

    $db->commit();

    // 7. Dispatch Payment Confirmation Email
    EmailService::sendOrderStatusUpdate($user['email'], $user['name'], $orderId, 'paid', $userId);

    Response::success([
        'order_id'       => $orderId,
        'transaction_id' => $transactionId,
        'amount'         => $paymentAmount,
        'payment_status' => 'paid',
        'order_status'   => 'confirmed'
    ], 'Payment verified and order confirmed successfully!');

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    error_log("Payment verification error: " . $e->getMessage());
    Response::error('Payment verification failed: ' . $e->getMessage(), [], 500);
}
