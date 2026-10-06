<?php
/**
 * Remove Product from Wishlist API
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

$wishlistId = $data['wishlist_id'] ?? ($_GET['wishlist_id'] ?? null);
$productId  = $data['product_id'] ?? ($_GET['product_id'] ?? null);

$db = Database::getConnection();

if ($wishlistId) {
    $stmt = $db->prepare("DELETE FROM wishlist WHERE id = ? AND user_id = ?");
    $stmt->execute([(int)$wishlistId, $userId]);
} elseif ($productId) {
    $stmt = $db->prepare("DELETE FROM wishlist WHERE product_id = ? AND user_id = ?");
    $stmt->execute([(int)$productId, $userId]);
} else {
    Response::error('Wishlist ID or Product ID is required.', [], 400);
}

Response::success([], 'Removed from wishlist.');
