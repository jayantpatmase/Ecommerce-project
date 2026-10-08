<?php
/**
 * Set Default User Address API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/response.php';
require_once __DIR__ . '/../../../config/validation.php';
require_once __DIR__ . '/../../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', [], 405);
}

$user = requireAuth();
$userId = (int)$user['id'];
$data = Response::getRequestData();

$addressId = $data['id'] ?? null;
if (!Validator::isPositiveInt($addressId)) {
    Response::error('Valid address ID is required.', [], 400);
}

$db = Database::getConnection();

$stmt = $db->prepare("SELECT * FROM user_addresses WHERE id = ? AND user_id = ?");
$stmt->execute([(int)$addressId, $userId]);
$addr = $stmt->fetch();

if (!$addr) {
    Response::error('Address not found.', [], 404);
}

try {
    $db->beginTransaction();

    $unsetStmt = $db->prepare("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?");
    $unsetStmt->execute([$userId]);

    $setStmt = $db->prepare("UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?");
    $setStmt->execute([(int)$addressId, $userId]);

    // Update main user profile address and phone
    $composite = "{$addr['flat_no']}, {$addr['street']}, " . ($addr['landmark'] ? "{$addr['landmark']}, " : "") . "{$addr['city']}, {$addr['state']} - {$addr['pincode']}";
    $userUpd = $db->prepare("UPDATE users SET address = ?, phone = ? WHERE id = ?");
    $userUpd->execute([$composite, $addr['phone'], $userId]);

    $db->commit();

    Response::success(['id' => (int)$addressId], 'Default address set successfully.');
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    Response::error('Could not update default address: ' . $e->getMessage(), [], 500);
}
