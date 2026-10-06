<?php
/**
 * Move Product from Wishlist to Cart API
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

// Check product stock and status
$pStmt = $db->prepare("SELECT id, stock, status FROM products WHERE id = ?");
$pStmt->execute([$productId]);
$product = $pStmt->fetch();

if (!$product || (int)$product['status'] !== 1) {
    Response::error('Product is unavailable.', [], 400);
}

if ((int)$product['stock'] < 1) {
    Response::error('Product is out of stock.', [], 400);
}

try {
    $db->beginTransaction();

    // Check if in cart
    $cStmt = $db->prepare("SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?");
    $cStmt->execute([$userId, $productId]);
    $existing = $cStmt->fetch();

    if ($existing) {
        $newQty = min((int)$existing['quantity'] + 1, (int)$product['stock']);
        $upStmt = $db->prepare("UPDATE cart SET quantity = ?, updated_at = NOW() WHERE id = ?");
        $upStmt->execute([$newQty, (int)$existing['id']]);
    } else {
        $inStmt = $db->prepare("INSERT INTO cart (user_id, product_id, quantity, created_at) VALUES (?, ?, 1, NOW())");
        $inStmt->execute([$userId, $productId]);
    }

    // Delete from wishlist
    $delStmt = $db->prepare("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?");
    $delStmt->execute([$userId, $productId]);

    $db->commit();
    Response::success([], 'Moved to shopping cart successfully!');
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    error_log("Move to cart error: " . $e->getMessage());
    Response::error('Could not move item to cart.', [], 500);
}
