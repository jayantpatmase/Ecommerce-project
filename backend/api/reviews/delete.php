<?php
/**
 * Delete Product Review API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', [], 405);
}

$user   = requireAuth();
$userId = (int)$user['id'];
$data   = Response::getRequestData();

$reviewId = $data['review_id'] ?? ($_GET['review_id'] ?? null);
if (!$reviewId) {
    Response::error('Review ID is required.', [], 400);
}

$db = Database::getConnection();

// Check ownership
$stmt = $db->prepare("SELECT id, user_id FROM reviews WHERE id = ?");
$stmt->execute([(int)$reviewId]);
$existing = $stmt->fetch();

if (!$existing) {
    Response::error('Review not found.', [], 404);
}

if ($user['role'] !== 'admin' && (int)$existing['user_id'] !== $userId) {
    Response::error('Access denied. You can only delete your own reviews.', [], 403);
}

$delStmt = $db->prepare("DELETE FROM reviews WHERE id = ?");
$delStmt->execute([(int)$reviewId]);

Response::success([], 'Review deleted successfully.');
