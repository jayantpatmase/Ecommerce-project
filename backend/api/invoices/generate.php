<?php
/**
 * Invoice Generation API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/validation.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user   = requireAuth();
$userId = (int)$user['id'];
$data   = Response::getRequestData();

$orderId = $data['order_id'] ?? ($_GET['order_id'] ?? null);
if (!Validator::isPositiveInt($orderId)) {
    Response::error('Valid order ID is required.', [], 400);
}

$db = Database::getConnection();

// Fetch order
$stmt = $db->prepare("
    SELECT o.id, o.user_id, o.total_amount, o.shipping_address, o.payment_method,
           o.payment_status, o.order_status, o.created_at,
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

// Ownership check
if ($user['role'] !== 'admin' && (int)$order['user_id'] !== $userId) {
    Response::error('Access denied. You cannot generate invoices for other users.', [], 403);
}

// Fetch items
$itemStmt = $db->prepare("
    SELECT oi.product_id, oi.quantity, oi.price AS purchase_price, p.name AS product_name
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
");
$itemStmt->execute([(int)$orderId]);
$items = $itemStmt->fetchAll();

// Check or create invoice record
$invStmt = $db->prepare("SELECT id, invoice_number, invoice_date, file_path FROM invoices WHERE order_id = ?");
$invStmt->execute([(int)$orderId]);
$invoice = $invStmt->fetch();

$invNumber = $invoice['invoice_number'] ?? ('INV-' . date('Y') . '-' . str_pad((string)$orderId, 5, '0', STR_PAD_LEFT));
$fileName  = "{$invNumber}.html";
$savePath  = __DIR__ . "/../../uploads/invoices/{$fileName}";
$webPath   = "/uploads/invoices/{$fileName}";

if (!$invoice) {
    $insStmt = $db->prepare("
        INSERT INTO invoices (order_id, invoice_number, invoice_date, file_path, created_at)
        VALUES (?, ?, NOW(), ?, NOW())
    ");
    $insStmt->execute([(int)$orderId, $invNumber, $webPath]);
}

// Render clean HTML printable invoice
$dateFormatted = date('F d, Y h:i A', strtotime($order['created_at']));
$subtotal = 0.00;
$itemsRows = '';

foreach ($items as $it) {
    $itemTot = round((float)$it['purchase_price'] * (int)$it['quantity'], 2);
    $subtotal += $itemTot;
    $itemsRows .= "
        <tr>
            <td style='padding:10px;border-bottom:1px solid #e2e8f0;'>" . htmlspecialchars($it['product_name']) . "</td>
            <td style='padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;'>{$it['quantity']}</td>
            <td style='padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;'>₹" . number_format($it['purchase_price'], 2) . "</td>
            <td style='padding:10px;border-bottom:1px solid #e2e8f0;text-align:right;'>₹" . number_format($itemTot, 2) . "</td>
        </tr>
    ";
}

$shipping = ($subtotal >= 999.00) ? 0.00 : 49.00;
$totalFormatted = number_format((float)$order['total_amount'], 2);
$gstAmount = round($subtotal * 0.18 / 1.18, 2); // 18% inclusive GST
$cgst = round($gstAmount / 2, 2);
$sgst = round($gstAmount / 2, 2);

$html = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Tax Invoice - {$invNumber}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; color: #1e293b; background: #fff; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 8px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0d6efd; padding-bottom: 20px; }
        .title { font-size: 28px; font-weight: 800; color: #0d6efd; margin: 0; }
        .sub { color: #64748b; font-size: 13px; margin-top: 4px; }
        .details-grid { display: flex; justify-content: space-between; margin: 24px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #f8fafc; padding: 12px 10px; text-align: left; font-size: 13px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
        .totals { margin-top: 20px; float: right; width: 340px; }
        .totals table tr td { padding: 6px 0; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #e0f2fe; color: #0369a1; text-transform: uppercase; }
        @media print { .no-print { display: none; } body { margin: 0; } .invoice-box { border: none; padding: 0; } }
    </style>
</head>
<body>
    <div class='invoice-box'>
        <div class='no-print' style='text-align:right; margin-bottom: 15px;'>
            <button onclick='window.print()' style='background:#0d6efd;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-weight:600;'>Print / Save Tax Invoice (PDF)</button>
        </div>
        <div class='header'>
            <div>
                <h1 class='title'>E-Shop India</h1>
                <div class='sub'>Online Shopping Management System</div>
                <div class='sub'><strong>GSTIN:</strong> 29AABCU9603R1Z2 | <strong>PAN:</strong> AABCU9603R</div>
                <div class='sub'>Brigade Tech Gardens, Whitefield, Bengaluru, KA - 560066</div>
                <div class='sub'>support@eshop.in | Toll Free: 1800-123-4567</div>
            </div>
            <div style='text-align:right;'>
                <h2 style='margin:0;color:#0f172a;'>TAX INVOICE</h2>
                <div style='font-size:16px;font-weight:bold;color:#0d6efd;'>{$invNumber}</div>
                <div class='sub'>Date: {$dateFormatted}</div>
                <div style='margin-top:6px;'><span class='badge'>" . strtoupper($order['payment_status']) . "</span></div>
            </div>
        </div>

        <div class='details-grid'>
            <div>
                <strong>Billed & Delivered To:</strong><br>
                " . htmlspecialchars($order['customer_name']) . "<br>
                " . htmlspecialchars($order['customer_email']) . "<br>
                " . htmlspecialchars($order['customer_phone'] ?? '') . "<br>
                <strong>Delivery Address:</strong><br>
                " . nl2br(htmlspecialchars($order['shipping_address'])) . "
            </div>
            <div style='text-align:right;'>
                <strong>Order Details:</strong><br>
                Order ID: #{$orderId}<br>
                Payment Method: " . htmlspecialchars($order['payment_method']) . "<br>
                Order Status: " . ucfirst($order['order_status']) . "<br>
                Place of Supply: India
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Product & Description</th>
                    <th style='text-align:center;'>Qty</th>
                    <th style='text-align:right;'>Unit Price</th>
                    <th style='text-align:right;'>Amount</th>
                </tr>
            </thead>
            <tbody>
                {$itemsRows}
            </tbody>
        </table>

        <div style='overflow:hidden;'>
            <div class='totals'>
                <table style='width:100%;'>
                    <tr><td>Item Subtotal:</td><td style='text-align:right;'>₹" . number_format($subtotal, 2) . "</td></tr>
                    <tr><td>Delivery Charges:</td><td style='text-align:right;'>" . ($shipping == 0 ? '<span style=\"color:#198754;font-weight:bold;\">FREE</span>' : ('₹' . number_format($shipping, 2))) . "</td></tr>
                    <tr style='font-size:12px;color:#64748b;'><td>Incl. CGST (9%):</td><td style='text-align:right;'>₹" . number_format($cgst, 2) . "</td></tr>
                    <tr style='font-size:12px;color:#64748b;'><td>Incl. SGST (9%):</td><td style='text-align:right;'>₹" . number_format($sgst, 2) . "</td></tr>
                    <tr style='font-size:18px;font-weight:bold;color:#0d6efd;border-top:2px solid #0d6efd;'>
                        <td style='padding-top:10px;'>Grand Total (INR):</td>
                        <td style='text-align:right;padding-top:10px;'>₹{$totalFormatted}</td>
                    </tr>
                </table>
            </div>
        </div>

        <div style='margin-top:50px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8;'>
            Thank you for shopping with E-Shop India. This is a computer-generated tax invoice. For support, contact support@eshop.in.
        </div>
    </div>
</body>
</html>
";

@file_put_contents($savePath, $html);

Response::success([
    'invoice_number' => $invNumber,
    'file_path'      => $webPath,
    'html'           => $html
], 'Invoice generated successfully.');
