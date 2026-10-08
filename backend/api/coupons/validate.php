<?php
/**
 * Validate and Calculate Coupon Discount API
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
$data = Response::getRequestData();

$code = strtoupper(trim(Validator::sanitize($data['code'] ?? '')));
$orderTotal = (float)($data['order_total'] ?? 0);

if (empty($code)) {
    Response::error('Coupon code is required.', [], 400);
}

$db = Database::getConnection();
$stmt = $db->prepare("
    SELECT * FROM coupons
    WHERE code = ? AND status = 1 AND (expiry_date IS NULL OR expiry_date >= CURDATE())
");
$stmt->execute([$code]);
$coupon = $stmt->fetch();

if (!$coupon) {
    Response::error("Invalid or expired coupon code '{$code}'.", [], 404);
}

$minAmount = (float)$coupon['min_order_amount'];
if ($orderTotal < $minAmount) {
    $diff = $minAmount - $orderTotal;
    Response::error("This coupon requires a minimum cart total of ₹" . number_format($minAmount, 2) . ". Add ₹" . number_format($diff, 2) . " more to apply.", [], 400);
}

// Calculate discount
$discount = 0.0;
if ($coupon['discount_type'] === 'percentage') {
    $discount = ($orderTotal * (float)$coupon['discount_value']) / 100;
    if ($coupon['max_discount'] !== null && $discount > (float)$coupon['max_discount']) {
        $discount = (float)$coupon['max_discount'];
    }
} else {
    // Fixed amount discount
    $discount = min((float)$coupon['discount_value'], $orderTotal);
}

$discount = round($discount, 2);
$finalTotal = max(0, round($orderTotal - $discount, 2));

Response::success([
    'code'            => $coupon['code'],
    'description'     => $coupon['description'],
    'discount_type'   => $coupon['discount_type'],
    'discount_value'  => (float)$coupon['discount_value'],
    'discount_amount' => $discount,
    'original_total'  => $orderTotal,
    'final_total'     => $finalTotal
], "Coupon '{$code}' applied successfully! You saved ₹" . number_format($discount, 2) . ".");
