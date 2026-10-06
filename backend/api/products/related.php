<?php
/**
 * Related Products API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/validation.php';

$productId = $_GET['product_id'] ?? null;
if (!Validator::isPositiveInt($productId)) {
    Response::error('Invalid or missing product ID.', [], 400);
}

$db = Database::getConnection();

// First get category of the base product
$catStmt = $db->prepare("SELECT category_id FROM products WHERE id = ?");
$catStmt->execute([(int)$productId]);
$cat = $catStmt->fetch();

if (!$cat) {
    Response::error('Product not found.', [], 404);
}

$calcExpr = "ROUND(p.price - (p.price * (p.discount / 100.0)), 2)";

$stmt = $db->prepare("
    SELECT p.id, p.category_id, p.name, p.price, p.discount, {$calcExpr} AS final_price,
           p.stock, p.image, c.name AS category_name,
           ROUND(COALESCE(AVG(r.rating), 0), 1) AS avg_rating,
           COUNT(r.id) AS review_count
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN reviews r ON r.product_id = p.id AND r.status = 1
    WHERE p.category_id = ? AND p.id != ? AND p.status = 1
    GROUP BY p.id
    ORDER BY p.id DESC
    LIMIT 4
");
$stmt->execute([(int)$cat['category_id'], (int)$productId]);
$related = $stmt->fetchAll();

foreach ($related as &$item) {
    $item['id']           = (int)$item['id'];
    $item['category_id']  = (int)$item['category_id'];
    $item['price']        = (float)$item['price'];
    $item['discount']     = (float)$item['discount'];
    $item['final_price']  = (float)$item['final_price'];
    $item['stock']        = (int)$item['stock'];
    $item['avg_rating']   = (float)$item['avg_rating'];
    $item['review_count'] = (int)$item['review_count'];
}

Response::success($related, 'Related products retrieved successfully.');
