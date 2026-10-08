<?php
/**
 * User Saved Addresses List API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/response.php';
require_once __DIR__ . '/../../../middleware/auth.php';

$user = requireAuth();
$userId = (int)$user['id'];
$db = Database::getConnection();

$stmt = $db->prepare("
    SELECT id, user_id, full_name, phone, flat_no, street, landmark, city, state, pincode, address_type, is_default, created_at
    FROM user_addresses
    WHERE user_id = ?
    ORDER BY is_default DESC, id DESC
");
$stmt->execute([$userId]);
$addresses = $stmt->fetchAll();

foreach ($addresses as &$addr) {
    $addr['id'] = (int)$addr['id'];
    $addr['user_id'] = (int)$addr['user_id'];
    $addr['is_default'] = (int)$addr['is_default'] === 1;
}

Response::success($addresses, 'User addresses retrieved successfully.');
