<?php
/**
 * Administrator Products List API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/response.php';
require_once __DIR__ . '/../../../config/validation.php';
require_once __DIR__ . '/../../../middleware/admin.php';

$admin = requireAdmin();
$db    = Database::getConnection();

$search     = isset($_GET['search']) ? trim($_GET['search']) : '';
$categoryId = isset($_GET['category']) && is_numeric($_GET['category']) ? (int)$_GET['category'] : null;
$status     = isset($_GET['status']) && $_GET['status'] !== '' ? (int)$_GET['status'] : null;

$pageParam  = $_GET['page'] ?? 1;
$limitParam = $_GET['limit'] ?? 20;
$paging     = Validator::paginate($pageParam, $limitParam, 20, 100);

$conditions = ["1=1"];
$params     = [];

if ($search !== '') {
    $term = "%{$search}%";
    $conditions[] = "(p.name LIKE ? OR p.description LIKE ?)";
    $params[] = $term;
    $params[] = $term;
}

if ($categoryId !== null) {
    $conditions[] = "p.category_id = ?";
    $params[] = $categoryId;
}

if ($status !== null) {
    $conditions[] = "p.status = ?";
    $params[] = $status;
}

$whereClause = implode(" AND ", $conditions);

// Total count
$countStmt = $db->prepare("SELECT COUNT(*) FROM products p WHERE {$whereClause}");
$countStmt->execute($params);
$total = (int)$countStmt->fetchColumn();

// List
$calcExpr = "ROUND(p.price - (p.price * (p.discount / 100.0)), 2)";
$sql = "
    SELECT p.id, p.category_id, p.name, p.description, p.specifications,
           p.price, p.discount, {$calcExpr} AS final_price,
           p.stock, p.image, p.status, p.created_at, p.updated_at,
           c.name AS category_name
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE {$whereClause}
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
";

$stmt = $db->prepare($sql);
$execParams = array_merge($params, [$paging['limit'], $paging['offset']]);
$stmt->execute($execParams);
$products = $stmt->fetchAll();

foreach ($products as &$p) {
    $p['id']          = (int)$p['id'];
    $p['category_id'] = (int)$p['category_id'];
    $p['price']       = (float)$p['price'];
    $p['discount']    = (float)$p['discount'];
    $p['final_price'] = (float)$p['final_price'];
    $p['stock']       = (int)$p['stock'];
    $p['status']      = (int)$p['status'];
}

Response::success([
    'products'   => $products,
    'pagination' => [
        'page'        => $paging['page'],
        'limit'       => $paging['limit'],
        'total'       => $total,
        'total_pages' => $paging['limit'] > 0 ? (int)ceil($total / $paging['limit']) : 1
    ]
], 'Admin products retrieved.');
