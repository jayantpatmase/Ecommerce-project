<?php
/**
 * Available Coupons List API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';

$db = Database::getConnection();

$stmt = $db->query("
    SELECT id, code, description, discount_type, discount_value, min_order_amount, max_discount, expiry_date
    FROM coupons
    WHERE status = 1 AND (expiry_date IS NULL OR expiry_date >= CURDATE())
    ORDER BY discount_value DESC
");
$coupons = $stmt->fetchAll();

foreach ($coupons as &$cp) {
    $cp['id'] = (int)$cp['id'];
    $cp['discount_value'] = (float)$cp['discount_value'];
    $cp['min_order_amount'] = (float)$cp['min_order_amount'];
    $cp['max_discount'] = $cp['max_discount'] !== null ? (float)$cp['max_discount'] : null;
}

Response::success($coupons, 'Coupons loaded successfully.');
