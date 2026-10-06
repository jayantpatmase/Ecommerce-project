<?php
/**
 * Administrator Inventory Overview API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/response.php';
require_once __DIR__ . '/../../../config/validation.php';
require_once __DIR__ . '/../../../middleware/admin.php';

$admin = requireAdmin();
$db    = Database::getConnection();

$filterStatus = $_GET['status'] ?? ''; // 'out_of_stock', 'low_stock', 'in_stock'
$search       = isset($_GET['search']) ? trim($_GET['search']) : '';

$pageParam  = $_GET['page'] ?? 1;
$limitParam = $_GET['limit'] ?? 25;
$paging     = Validator::paginate($pageParam, $limitParam, 25, 100);

$conditions = ["p.status = 1"];
$params     = [];

if ($search !== '') {
    $conditions[] = "(p.name LIKE ? OR c.name LIKE ?)";
    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
}

if ($filterStatus === 'out_of_stock') {
    $conditions[] = "p.stock = 0";
} elseif ($filterStatus === 'low_stock') {
    $conditions[] = "p.stock >= 1 AND p.stock <= 5";
} elseif ($filterStatus === 'in_stock') {
    $conditions[] = "p.stock >= 6";
}

$whereClause = implode(" AND ", $conditions);

// Count
$countStmt = $db->prepare("
    SELECT COUNT(*) 
    FROM products p 
    JOIN categories c ON c.id = p.category_id 
    WHERE {$whereClause}
");
$countStmt->execute($params);
$total = (int)$countStmt->fetchColumn();

// Fetch Inventory items
$sql = "
    SELECT p.id, p.name, p.stock, p.price, p.image,
           c.name AS category_name,
           CASE 
               WHEN p.stock = 0 THEN 'Out of Stock'
               WHEN p.stock <= 5 THEN 'Low Stock'
               ELSE 'In Stock'
           END AS stock_status,
           CASE 
               WHEN p.stock = 0 THEN 'danger'
               WHEN p.stock <= 5 THEN 'warning'
               ELSE 'success'
           END AS stock_badge
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE {$whereClause}
    ORDER BY p.stock ASC, p.id DESC
    LIMIT ? OFFSET ?
";

$stmt = $db->prepare($sql);
$execParams = array_merge($params, [$paging['limit'], $paging['offset']]);
$stmt->execute($execParams);
$inventory = $stmt->fetchAll();

foreach ($inventory as &$it) {
    $it['id']    = (int)$it['id'];
    $it['stock'] = (int)$it['stock'];
    $it['price'] = (float)$it['price'];
}

Response::success([
    'inventory'  => $inventory,
    'pagination' => [
        'page'        => $paging['page'],
        'limit'       => $paging['limit'],
        'total'       => $total,
        'total_pages' => $paging['limit'] > 0 ? (int)ceil($total / $paging['limit']) : 1
    ]
], 'Inventory retrieved.');
