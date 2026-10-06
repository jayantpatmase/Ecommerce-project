<?php
/**
 * Customer Wishlist List API
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
    SELECT w.id AS wishlist_id, w.created_at,
           p.id AS product_id, p.name, p.price, p.discount, {$calcExpr} AS final_price,
           p.stock, p.image, p.status, cat.name AS category_name,
           ROUND(COALESCE(AVG(r.rating), 0), 1) AS avg_rating
    FROM wishlist w
    JOIN products p ON p.id = w.product_id
    JOIN categories cat ON cat.id = p.category_id
    LEFT JOIN reviews r ON r.product_id = p.id AND r.status = 1
    WHERE w.user_id = ?
    GROUP BY w.id
    ORDER BY w.created_at DESC
");
$stmt->execute([$userId]);
$wishlist = $stmt->fetchAll();

foreach ($wishlist as &$item) {
    $item['wishlist_id']  = (int)$item['wishlist_id'];
    $item['product_id']   = (int)$item['product_id'];
    $item['price']        = (float)$item['price'];
    $item['discount']     = (float)$item['discount'];
    $item['final_price']  = (float)$item['final_price'];
    $item['stock']        = (int)$item['stock'];
    $item['avg_rating']   = (float)$item['avg_rating'];
}

Response::success($wishlist, 'Wishlist retrieved successfully.');
