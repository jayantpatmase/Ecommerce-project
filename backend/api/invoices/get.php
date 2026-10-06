<?php
/**
 * Retrieve Invoice API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/validation.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user    = requireAuth();
$userId  = (int)$user['id'];
$orderId = $_GET['order_id'] ?? null;

if (!Validator::isPositiveInt($orderId)) {
    Response::error('Valid order ID is required.', [], 400);
}

$db = Database::getConnection();

// Check order ownership
$stmt = $db->prepare("SELECT id, user_id FROM orders WHERE id = ?");
$stmt->execute([(int)$orderId]);
$order = $stmt->fetch();

if (!$order) {
    Response::error('Order not found.', [], 404);
}

if ($user['role'] !== 'admin' && (int)$order['user_id'] !== $userId) {
    Response::error('Access denied. You do not have permission to view this invoice.', [], 403);
}

// Fetch invoice
$invStmt = $db->prepare("SELECT id, order_id, invoice_number, invoice_date, file_path, created_at FROM invoices WHERE order_id = ?");
$invStmt->execute([(int)$orderId]);
$invoice = $invStmt->fetch();

if (!$invoice) {
    // If not yet generated, invoke invoice generation logic
    require_once __DIR__ . '/generate.php';
    exit;
}

// Check if HTML file exists on disk, read if available
$diskPath = __DIR__ . '/../../uploads/invoices/' . basename($invoice['file_path']);
$html = file_exists($diskPath) ? file_get_contents($diskPath) : null;

Response::success([
    'invoice' => $invoice,
    'html'    => $html
], 'Invoice retrieved.');
