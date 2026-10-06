<?php
/**
 * Administrator Update Product API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/response.php';
require_once __DIR__ . '/../../../config/validation.php';
require_once __DIR__ . '/../../../middleware/admin.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', [], 405);
}

$admin = requireAdmin();
$data  = Response::getRequestData();

$errors = Validator::required($data, ['id', 'name', 'category_id', 'price', 'stock']);
if (!empty($errors)) {
    Response::error('Validation failed', $errors, 422);
}

$id             = (int)$data['id'];
$name           = Validator::sanitize($data['name']);
$categoryId     = (int)$data['category_id'];
$description    = isset($data['description']) ? Validator::sanitize($data['description']) : '';
$specifications = isset($data['specifications']) ? Validator::sanitize($data['specifications']) : '';
$price          = (float)$data['price'];
$discount       = isset($data['discount']) ? (float)$data['discount'] : 0.00;
$stock          = (int)$data['stock'];
$status         = isset($data['status']) ? (int)$data['status'] : 1;

if ($price < 0 || $stock < 0) {
    Response::error('Price and stock cannot be negative.', [], 422);
}

$db = Database::getConnection();

// Check existence
$pStmt = $db->prepare("SELECT id, image FROM products WHERE id = ?");
$pStmt->execute([$id]);
$current = $pStmt->fetch();

if (!$current) {
    Response::error('Product not found.', [], 404);
}

$imagePath = $current['image'];

// Handle upload if updated
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $fileTmp  = $_FILES['image']['tmp_name'];
    $fileName = $_FILES['image']['name'];
    $fileSize = $_FILES['image']['size'];

    if ($fileSize <= 5 * 1024 * 1024) {
        $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) {
            $uniqueName = 'prod_' . bin2hex(random_bytes(8)) . '.' . $ext;
            $targetDirBackend  = __DIR__ . '/../../../uploads/products/';
            $targetDirFrontend = __DIR__ . '/../../../../frontend/public/uploads/products/';

            if (move_uploaded_file($fileTmp, $targetDirBackend . $uniqueName)) {
                @copy($targetDirBackend . $uniqueName, $targetDirFrontend . $uniqueName);
                $imagePath = '/uploads/products/' . $uniqueName;
            }
        }
    }
} elseif (!empty($data['image'])) {
    $imagePath = Validator::sanitize($data['image']);
}

$stmt = $db->prepare("
    UPDATE products 
    SET category_id = ?, name = ?, description = ?, specifications = ?,
        price = ?, discount = ?, stock = ?, image = ?, status = ?, updated_at = NOW()
    WHERE id = ?
");
$stmt->execute([$categoryId, $name, $description, $specifications, $price, $discount, $stock, $imagePath, $status, $id]);

Response::success([
    'id'         => $id,
    'name'       => $name,
    'price'      => $price,
    'discount'   => $discount,
    'stock'      => $stock,
    'status'     => $status,
    'image'      => $imagePath
], 'Product updated successfully.');
