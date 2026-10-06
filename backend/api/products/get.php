<?php
/**
 * Single Product Details API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/validation.php';

$id = $_GET['id'] ?? null;
if (!Validator::isPositiveInt($id)) {
    Response::error('Invalid or missing product ID.', [], 400);
}

$db = Database::getConnection();

$calcExpr = "ROUND(p.price - (p.price * (p.discount / 100.0)), 2)";

$stmt = $db->prepare("
    SELECT p.id, p.category_id, p.name, p.description, p.specifications,
           p.price, p.discount, {$calcExpr} AS final_price,
           p.stock, p.image, p.status, p.created_at,
           c.name AS category_name,
           ROUND(COALESCE(AVG(r.rating), 0), 1) AS avg_rating,
           COUNT(r.id) AS review_count
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN reviews r ON r.product_id = p.id AND r.status = 1
    WHERE p.id = ? AND p.status = 1
    GROUP BY p.id
");
$stmt->execute([(int)$id]);
$product = $stmt->fetch();

if (!$product) {
    Response::error('Product not found or is currently inactive.', [], 404);
}

$product['id']           = (int)$product['id'];
$product['category_id']  = (int)$product['category_id'];
$product['price']        = (float)$product['price'];
$product['discount']     = (float)$product['discount'];
$product['final_price']  = (float)$product['final_price'];
$product['stock']        = (int)$product['stock'];
$product['avg_rating']   = (float)$product['avg_rating'];
$product['review_count'] = (int)$product['review_count'];

// Fetch latest verified reviews for this product
$reviewStmt = $db->prepare("
    SELECT r.id, r.user_id, r.rating, r.review, r.created_at, u.name AS user_name
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.product_id = ? AND r.status = 1
    ORDER BY r.created_at DESC
");
$reviewStmt->execute([(int)$id]);
$reviews = $reviewStmt->fetchAll();

foreach ($reviews as &$rev) {
    $rev['id']      = (int)$rev['id'];
    $rev['user_id'] = (int)$rev['user_id'];
    $rev['rating']  = (int)$rev['rating'];
}

$product['reviews'] = $reviews;

Response::success($product, 'Product retrieved successfully.');
