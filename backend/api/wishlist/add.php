<?php
/**
 * Add Product to Wishlist API
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
$userId = (int)$user['id'];
$data = Response::getRequestData();

$errors = Validator::required($data, ['product_id']);
if (!empty($errors)) {
    Response::error('Product ID is required', $errors, 422);
}

$productId = (int)$data['product_id'];

$db = Database::getConnection();

// Verify product exists and is active
$checkStmt = $db->prepare("SELECT id FROM products WHERE id = ? AND status = 1");
$checkStmt->execute([$productId]);
if (!$checkStmt->fetch()) {
    Response::error('Product not found or inactive.', [], 404);
}

// Check existing wishlist item
$wishStmt = $db->prepare("SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?");
$wishStmt->execute([$userId, $productId]);
$existing = $wishStmt->fetch();

if ($existing) {
    Response::success(['wishlist_id' => (int)$existing['id']], 'Product is already in your wishlist.');
}

$insertStmt = $db->prepare("INSERT INTO wishlist (user_id, product_id, created_at) VALUES (?, ?, NOW())");
$insertStmt->execute([$userId, $productId]);
$wishlistId = (int)$db->lastInsertId();

Response::success(['wishlist_id' => $wishlistId], 'Product added to wishlist!', 201);
