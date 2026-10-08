<?php
/**
 * Add New User Address API
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

$errors = Validator::required($data, ['full_name', 'phone', 'flat_no', 'street', 'city', 'state', 'pincode']);
if (!empty($errors)) {
    Response::error('Please fill all mandatory address fields.', $errors, 422);
}

$fullName    = Validator::sanitize($data['full_name']);
$phone       = Validator::sanitize($data['phone']);
$flatNo      = Validator::sanitize($data['flat_no']);
$street      = Validator::sanitize($data['street']);
$landmark    = Validator::sanitize($data['landmark'] ?? '');
$city        = Validator::sanitize($data['city']);
$state       = Validator::sanitize($data['state']);
$pincode     = Validator::sanitize($data['pincode']);
$addressType = in_array($data['address_type'] ?? '', ['Home', 'Work', 'Other']) ? $data['address_type'] : 'Home';
$isDefault   = !empty($data['is_default']) ? 1 : 0;

$db = Database::getConnection();

try {
    $db->beginTransaction();

    // If marked default, unset existing default
    if ($isDefault) {
        $unsetStmt = $db->prepare("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?");
        $unsetStmt->execute([$userId]);
    } else {
        // If this is user's first address, make it default automatically
        $countStmt = $db->prepare("SELECT COUNT(*) FROM user_addresses WHERE user_id = ?");
        $countStmt->execute([$userId]);
        if ($countStmt->fetchColumn() == 0) {
            $isDefault = 1;
        }
    }

    $insertStmt = $db->prepare("
        INSERT INTO user_addresses (user_id, full_name, phone, flat_no, street, landmark, city, state, pincode, address_type, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $insertStmt->execute([
        $userId, $fullName, $phone, $flatNo, $street, $landmark, $city, $state, $pincode, $addressType, $isDefault
    ]);
    $newId = (int)$db->lastInsertId();

    // Also update main user's fallback address and phone if default
    if ($isDefault) {
        $composite = "{$flatNo}, {$street}, " . ($landmark ? "{$landmark}, " : "") . "{$city}, {$state} - {$pincode}";
        $userUpd = $db->prepare("UPDATE users SET address = ?, phone = ? WHERE id = ?");
        $userUpd->execute([$composite, $phone, $userId]);
    }

    $db->commit();

    Response::success([
        'id'           => $newId,
        'full_name'    => $fullName,
        'phone'        => $phone,
        'flat_no'      => $flatNo,
        'street'       => $street,
        'landmark'     => $landmark,
        'city'         => $city,
        'state'        => $state,
        'pincode'      => $pincode,
        'address_type' => $addressType,
        'is_default'   => (bool)$isDefault
    ], 'Address added successfully.');

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    Response::error('Could not save address: ' . $e->getMessage(), [], 500);
}
