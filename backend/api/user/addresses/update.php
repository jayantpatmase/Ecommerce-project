<?php
/**
 * Update Existing User Address API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/response.php';
require_once __DIR__ . '/../../../config/validation.php';
require_once __DIR__ . '/../../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
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

// Verify ownership
$checkStmt = $db->prepare("SELECT id FROM user_addresses WHERE id = ? AND user_id = ?");
$checkStmt->execute([(int)$addressId, $userId]);
if (!$checkStmt->fetch()) {
    Response::error('Address not found or permission denied.', [], 404);
}

$fullName    = Validator::sanitize($data['full_name'] ?? '');
$phone       = Validator::sanitize($data['phone'] ?? '');
$flatNo      = Validator::sanitize($data['flat_no'] ?? '');
$street      = Validator::sanitize($data['street'] ?? '');
$landmark    = Validator::sanitize($data['landmark'] ?? '');
$city        = Validator::sanitize($data['city'] ?? '');
$state       = Validator::sanitize($data['state'] ?? '');
$pincode     = Validator::sanitize($data['pincode'] ?? '');
$addressType = in_array($data['address_type'] ?? '', ['Home', 'Work', 'Other']) ? $data['address_type'] : 'Home';
$isDefault   = !empty($data['is_default']) ? 1 : 0;

try {
    $db->beginTransaction();

    if ($isDefault) {
        $unsetStmt = $db->prepare("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?");
        $unsetStmt->execute([$userId]);
    }

    $updStmt = $db->prepare("
        UPDATE user_addresses
        SET full_name = ?, phone = ?, flat_no = ?, street = ?, landmark = ?, city = ?, state = ?, pincode = ?, address_type = ?, is_default = ?, updated_at = NOW()
        WHERE id = ? AND user_id = ?
    ");
    $updStmt->execute([
        $fullName, $phone, $flatNo, $street, $landmark, $city, $state, $pincode, $addressType, $isDefault, (int)$addressId, $userId
    ]);

    if ($isDefault) {
        $composite = "{$flatNo}, {$street}, " . ($landmark ? "{$landmark}, " : "") . "{$city}, {$state} - {$pincode}";
        $userUpd = $db->prepare("UPDATE users SET address = ?, phone = ? WHERE id = ?");
        $userUpd->execute([$composite, $phone, $userId]);
    }

    $db->commit();

    Response::success(['id' => (int)$addressId], 'Address updated successfully.');
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    Response::error('Could not update address: ' . $e->getMessage(), [], 500);
}
