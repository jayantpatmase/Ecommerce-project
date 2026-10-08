<?php
/**
 * Instant Search Autocomplete & Suggestions API (Amazon Style)
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/validation.php';

$q = trim(Validator::sanitize($_GET['q'] ?? ''));

if (strlen($q) < 1) {
    Response::success([
        'trending' => [
            'Pro Wireless ANC Headphones',
            'Smart Fitness Watch',
            'Running Shoes',
            'Bluetooth Speaker',
            'Mechanical Keyboard'
        ],
        'products' => [],
        'categories' => []
    ]);
}

$db = Database::getConnection();

// 1. Search matching products (limit 6)
$stmt = $db->prepare("
    SELECT p.id, p.name, p.price, p.discount, p.image, c.name AS category_name,
           ROUND(p.price * (1 - p.discount / 100), 2) AS final_price
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.status = 1 AND (p.name LIKE ? OR p.description LIKE ?)
    ORDER BY p.name ASC
    LIMIT 6
");
$searchLike = "%{$q}%";
$stmt->execute([$searchLike, $searchLike]);
$products = $stmt->fetchAll();

foreach ($products as &$p) {
    $p['id'] = (int)$p['id'];
    $p['price'] = (float)$p['price'];
    $p['discount'] = (float)$p['discount'];
    $p['final_price'] = (float)$p['final_price'];
}

// 2. Search matching categories (limit 3)
$catStmt = $db->prepare("
    SELECT id, name FROM categories WHERE status = 1 AND name LIKE ? LIMIT 3
");
$catStmt->execute([$searchLike]);
$categories = $catStmt->fetchAll();

Response::success([
    'query'      => $q,
    'products'   => $products,
    'categories' => $categories
], 'Search suggestions retrieved.');
