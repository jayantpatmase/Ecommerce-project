<?php
/**
 * Delete User Address API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/response.php';
require_once __DIR__ . '/../../../config/validation.php';
require_once __DIR__ . '/../../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', [], 405);
}

$user = requireAuth();
$userId = (int)$user['id'];
$data = Response::getRequestData();

$addressId = $data['id'] ?? $_GET['id'] ?? null;
if (!Validator::isPositiveInt($addressId)) {
    Response::error('Valid address ID is required.', [], 400);
}

$db = Database::getConnection();

// Check existence & default status
$stmt = $db->prepare("SELECT id, is_default FROM user_addresses WHERE id = ? AND user_id = ?");
$stmt->execute([(int)$addressId, $userId]);
$row = $stmt->fetch();

if (!$row) {
    Response::error('Address not found.', [], 404);
}

$delStmt = $db->prepare("DELETE FROM user_addresses WHERE id = ? AND user_id = ?");
$delStmt->execute([(int)$addressId, $userId]);

// If deleted address was default, promote the newest remaining address to default
if ($row['is_default']) {
    $promoteStmt = $db->prepare("UPDATE user_addresses SET is_default = 1 WHERE user_id = ? ORDER BY id DESC LIMIT 1");
    $promoteStmt->execute([$userId]);
}

Response::success(['id' => (int)$addressId], 'Address deleted successfully.');
