<?php
/**
 * Add Item to Shopping Cart API
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
$quantity  = isset($data['quantity']) && Validator::isPositiveInt($data['quantity']) ? (int)$data['quantity'] : 1;

$db = Database::getConnection();

// Check product exists, active and has stock
$stmt = $db->prepare("SELECT id, name, stock, status FROM products WHERE id = ?");
$stmt->execute([$productId]);
$product = $stmt->fetch();

if (!$product) {
    Response::error('Product not found.', [], 404);
}

if ((int)$product['status'] !== 1) {
    Response::error('This product is currently unavailable.', [], 400);
}

$stockAvailable = (int)$product['stock'];
if ($stockAvailable < 1) {
    Response::error('Sorry, this product is out of stock.', [], 400);
}

// Check existing cart item
$cartStmt = $db->prepare("SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?");
$cartStmt->execute([$userId, $productId]);
$existing = $cartStmt->fetch();

if ($existing) {
    $newQuantity = (int)$existing['quantity'] + $quantity;
    if ($newQuantity > $stockAvailable) {
        Response::error("Cannot add more. Maximum available stock is {$stockAvailable}.", [], 400);
    }

    $updateStmt = $db->prepare("UPDATE cart SET quantity = ?, updated_at = NOW() WHERE id = ?");
    $updateStmt->execute([$newQuantity, (int)$existing['id']]);
    Response::success(['cart_id' => (int)$existing['id'], 'quantity' => $newQuantity], 'Cart updated successfully.');
} else {
    if ($quantity > $stockAvailable) {
        Response::error("Quantity exceeds available stock of {$stockAvailable}.", [], 400);
    }

    $insertStmt = $db->prepare("INSERT INTO cart (user_id, product_id, quantity, created_at) VALUES (?, ?, ?, NOW())");
    $insertStmt->execute([$userId, $productId, $quantity]);
    $cartId = (int)$db->lastInsertId();

    Response::success(['cart_id' => $cartId, 'quantity' => $quantity], 'Product added to cart!', 201);
}
