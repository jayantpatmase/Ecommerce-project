<?php
/**
 * Cart Listing & Calculation API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = requireAuth();
$userId = (int)$user['id'];
$db = Database::getConnection();

$calcExpr = "ROUND(p.price - (p.price * (p.discount / 100.0)), 2)";

$stmt = $db->prepare("
    SELECT c.id AS cart_id, c.quantity, c.created_at,
           p.id AS product_id, p.name, p.price, p.discount, {$calcExpr} AS final_price,
           p.stock, p.image, p.status, cat.name AS category_name
    FROM cart c
    JOIN products p ON p.id = c.product_id
    JOIN categories cat ON cat.id = p.category_id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
");
$stmt->execute([$userId]);
$cartItems = $stmt->fetchAll();

$subtotal = 0.00;
$totalDiscount = 0.00;
$items = [];

foreach ($cartItems as $row) {
    $qty        = (int)$row['quantity'];
    $originalPr = (float)$row['price'];
    $finalPr    = (float)$row['final_price'];
    $stock      = (int)$row['stock'];
    $isActive   = (int)$row['status'] === 1;

    $itemTotal  = round($finalPr * $qty, 2);
    $itemSaving = round(($originalPr - $finalPr) * $qty, 2);

    $subtotal += $itemTotal;
    $totalDiscount += $itemSaving;

    $items[] = [
        'cart_id'       => (int)$row['cart_id'],
        'product_id'    => (int)$row['product_id'],
        'name'          => $row['name'],
        'image'         => $row['image'],
        'category_name' => $row['category_name'],
        'price'         => $originalPr,
        'discount'      => (float)$row['discount'],
        'final_price'   => $finalPr,
        'quantity'      => $qty,
        'item_total'    => $itemTotal,
        'stock'         => $stock,
        'is_available'  => $isActive && ($stock >= $qty),
        'in_stock'      => $stock > 0
    ];
}

// Shipping rule: Free delivery if subtotal >= ₹999 or empty, else ₹49 flat
$shipping = ($subtotal >= 999.00 || empty($items)) ? 0.00 : 49.00;
$grandTotal = round($subtotal + $shipping, 2);

Response::success([
    'items'   => $items,
    'summary' => [
        'item_count'     => count($items),
        'total_quantity' => array_sum(array_column($items, 'quantity')),
        'subtotal'       => round($subtotal, 2),
        'discount_total' => round($totalDiscount, 2),
        'shipping'       => round($shipping, 2),
        'grand_total'    => $grandTotal
    ]
], 'Cart retrieved successfully.');
