<?php
/**
 * Administrator Create Product API with Secure File Upload
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/response.php';
require_once __DIR__ . '/../../../config/validation.php';
require_once __DIR__ . '/../../../middleware/admin.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', [], 405);
}

$admin = requireAdmin();
$data  = Response::getRequestData();

$errors = Validator::required($data, ['name', 'category_id', 'price', 'stock']);
if (!empty($errors)) {
    Response::error('Validation failed', $errors, 422);
}

$name           = Validator::sanitize($data['name']);
$categoryId     = (int)$data['category_id'];
$description    = isset($data['description']) ? Validator::sanitize($data['description']) : '';
$specifications = isset($data['specifications']) ? Validator::sanitize($data['specifications']) : '';
$price          = (float)$data['price'];
$discount       = isset($data['discount']) ? (float)$data['discount'] : 0.00;
$stock          = (int)$data['stock'];
$status         = isset($data['status']) ? (int)$data['status'] : 1;
$imagePath      = '/uploads/products/placeholder.svg';

if ($price < 0) {
    Response::error('Price cannot be negative.', [], 422);
}
if ($stock < 0) {
    Response::error('Stock cannot be negative.', [], 422);
}

// Handle Secure File Upload
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $fileTmp  = $_FILES['image']['tmp_name'];
    $fileName = $_FILES['image']['name'];
    $fileSize = $_FILES['image']['size'];
    
    // Max 5MB
    if ($fileSize > 5 * 1024 * 1024) {
        Response::error('Image file size exceeds maximum limit of 5MB.', [], 422);
    }

    $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    if (!in_array($ext, $allowedExts, true)) {
        Response::error('Invalid image type. Allowed: JPG, PNG, WEBP.', [], 422);
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime  = finfo_file($finfo, $fileTmp);
    finfo_close($finfo);

    $allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!in_array($mime, $allowedMimes, true)) {
        Response::error('File MIME type is not a valid image.', [], 422);
    }

    $uniqueName = 'prod_' . bin2hex(random_bytes(8)) . '.' . $ext;
    $targetDirBackend  = __DIR__ . '/../../../uploads/products/';
    $targetDirFrontend = __DIR__ . '/../../../../frontend/public/uploads/products/';

    if (!is_dir($targetDirBackend)) mkdir($targetDirBackend, 0755, true);
    if (!is_dir($targetDirFrontend)) mkdir($targetDirFrontend, 0755, true);

    if (move_uploaded_file($fileTmp, $targetDirBackend . $uniqueName)) {
        @copy($targetDirBackend . $uniqueName, $targetDirFrontend . $uniqueName);
        $imagePath = '/uploads/products/' . $uniqueName;
    }
} elseif (!empty($data['image'])) {
    $imagePath = Validator::sanitize($data['image']);
}

$db = Database::getConnection();

// Verify category exists
$cStmt = $db->prepare("SELECT id FROM categories WHERE id = ?");
$cStmt->execute([$categoryId]);
if (!$cStmt->fetch()) {
    Response::error('Selected category does not exist.', [], 400);
}

$stmt = $db->prepare("
    INSERT INTO products (category_id, name, description, specifications, price, discount, stock, image, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
");
$stmt->execute([$categoryId, $name, $description, $specifications, $price, $discount, $stock, $imagePath, $status]);
$productId = (int)$db->lastInsertId();

Response::success([
    'product_id' => $productId,
    'name'       => $name,
    'price'      => $price,
    'stock'      => $stock
], 'Product created successfully!', 201);
