<?php
/**
 * Add Product Review & Rating API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/validation.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', [], 405);
}

$user   = requireAuth();
$userId = (int)$user['id'];
$data   = Response::getRequestData();

$errors = Validator::required($data, ['product_id', 'rating', 'review']);
if (!empty($errors)) {
    Response::error('Validation failed', $errors, 422);
}

$productId = (int)$data['product_id'];
$rating    = (int)$data['rating'];
$review    = Validator::sanitize($data['review']);

if (!Validator::isRating($rating)) {
    Response::error('Rating must be an integer between 1 and 5 stars.', ['rating' => 'Invalid rating'], 422);
}

$db = Database::getConnection();

// Check product exists
$pStmt = $db->prepare("SELECT id FROM products WHERE id = ? AND status = 1");
$pStmt->execute([$productId]);
if (!$pStmt->fetch()) {
    Response::error('Product not found or inactive.', [], 404);
}

// Check if user already reviewed this product (Rule 7: One review per user/product)
$checkStmt = $db->prepare("SELECT id FROM reviews WHERE user_id = ? AND product_id = ?");
$checkStmt->execute([$userId, $productId]);
if ($checkStmt->fetch()) {
    Response::error('You have already submitted a review for this product. You may edit your existing review.', [], 409);
}

try {
    $insertStmt = $db->prepare("
        INSERT INTO reviews (user_id, product_id, rating, review, status, created_at)
        VALUES (?, ?, ?, ?, 1, NOW())
    ");
    $insertStmt->execute([$userId, $productId, $rating, $review]);
    $reviewId = (int)$db->lastInsertId();

    Response::success([
        'review_id'  => $reviewId,
        'rating'     => $rating,
        'review'     => $review,
        'user_name'  => $user['name']
    ], 'Thank you! Your review has been published.', 201);
} catch (PDOException $e) {
    error_log("Add review error: " . $e->getMessage());
    Response::error('Failed to submit review.', [], 500);
}
