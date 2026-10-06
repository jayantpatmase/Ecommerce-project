<?php
/**
 * Remove Item from Cart API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', [], 405);
}

$user = requireAuth();
$userId = (int)$user['id'];
$data = Response::getRequestData();

$cartId = $data['cart_id'] ?? ($_GET['cart_id'] ?? null);

if (!$cartId) {
    Response::error('Cart ID is required.', [], 400);
}

$db = Database::getConnection();
$stmt = $db->prepare("DELETE FROM cart WHERE id = ? AND user_id = ?");
$stmt->execute([(int)$cartId, $userId]);

if ($stmt->rowCount() > 0) {
    Response::success(['cart_id' => (int)$cartId], 'Item removed from cart.');
} else {
    Response::error('Cart item not found or unauthorized.', [], 404);
}
