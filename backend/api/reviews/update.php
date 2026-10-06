<?php
/**
 * Update Product Review API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/validation.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', [], 405);
}

$user   = requireAuth();
$userId = (int)$user['id'];
$data   = Response::getRequestData();

$errors = Validator::required($data, ['review_id', 'rating', 'review']);
if (!empty($errors)) {
    Response::error('Validation failed', $errors, 422);
}

$reviewId = (int)$data['review_id'];
$rating   = (int)$data['rating'];
$review   = Validator::sanitize($data['review']);

if (!Validator::isRating($rating)) {
    Response::error('Rating must be between 1 and 5 stars.', [], 422);
}

$db = Database::getConnection();

// Check ownership (Rule 6: Users cannot modify another user's review)
$stmt = $db->prepare("SELECT id, user_id FROM reviews WHERE id = ?");
$stmt->execute([$reviewId]);
$existing = $stmt->fetch();

if (!$existing) {
    Response::error('Review not found.', [], 404);
}

if ($user['role'] !== 'admin' && (int)$existing['user_id'] !== $userId) {
    Response::error('Access denied. You can only edit your own reviews.', [], 403);
}

$updateStmt = $db->prepare("UPDATE reviews SET rating = ?, review = ? WHERE id = ?");
$updateStmt->execute([$rating, $review, $reviewId]);

Response::success([
    'review_id' => $reviewId,
    'rating'    => $rating,
    'review'    => $review
], 'Review updated successfully.');
