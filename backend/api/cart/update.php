<?php
/**
 * Update Cart Item Quantity API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/validation.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', [], 405);
}

$user = requireAuth();
$userId = (int)$user['id'];
$data = Response::getRequestData();

$errors = Validator::required($data, ['cart_id', 'quantity']);
if (!empty($errors)) {
    Response::error('Validation failed', $errors, 422);
}

$cartId   = (int)$data['cart_id'];
$quantity = (int)$data['quantity'];

$db = Database::getConnection();

// Fetch cart item belonging to this user
$stmt = $db->prepare("
    SELECT c.id, c.product_id, p.stock, p.status 
    FROM cart c
    JOIN products p ON p.id = c.product_id
    WHERE c.id = ? AND c.user_id = ?
");
$stmt->execute([$cartId, $userId]);
$item = $stmt->fetch();

if (!$item) {
    Response::error('Cart item not found or unauthorized.', [], 404);
}

if ($quantity <= 0) {
    // Delete if quantity is zero or below
    $delStmt = $db->prepare("DELETE FROM cart WHERE id = ? AND user_id = ?");
    $delStmt->execute([$cartId, $userId]);
    Response::success(['cart_id' => $cartId, 'deleted' => true], 'Item removed from cart.');
}

if ((int)$item['status'] !== 1) {
    Response::error('Product is no longer available.', [], 400);
}

$stockAvailable = (int)$item['stock'];
if ($quantity > $stockAvailable) {
    Response::error("Cannot update quantity. Only {$stockAvailable} units available in stock.", [], 400);
}

$updateStmt = $db->prepare("UPDATE cart SET quantity = ?, updated_at = NOW() WHERE id = ? AND user_id = ?");
$updateStmt->execute([$quantity, $cartId, $userId]);

Response::success(['cart_id' => $cartId, 'quantity' => $quantity], 'Cart item updated.');
