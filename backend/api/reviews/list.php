<?php
/**
 * Product Reviews Listing API with Ratings Breakdown
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/validation.php';

$productId = $_GET['product_id'] ?? null;
if (!Validator::isPositiveInt($productId)) {
    Response::error('Valid Product ID is required.', [], 400);
}

$db = Database::getConnection();

// Fetch reviews
$stmt = $db->prepare("
    SELECT r.id, r.user_id, r.product_id, r.rating, r.review, r.created_at,
           u.name AS user_name
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.product_id = ? AND r.status = 1
    ORDER BY r.created_at DESC
");
$stmt->execute([(int)$productId]);
$reviews = $stmt->fetchAll();

$breakdown = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];
$totalRating = 0;

foreach ($reviews as &$r) {
    $r['id']         = (int)$r['id'];
    $r['user_id']    = (int)$r['user_id'];
    $r['product_id'] = (int)$r['product_id'];
    $r['rating']     = (int)$r['rating'];

    $breakdown[$r['rating']]++;
    $totalRating += $r['rating'];
}

$count = count($reviews);
$average = $count > 0 ? round($totalRating / $count, 1) : 0;

Response::success([
    'reviews'        => $reviews,
    'total_reviews'  => $count,
    'average_rating' => $average,
    'breakdown'      => $breakdown
], 'Reviews retrieved successfully.');
