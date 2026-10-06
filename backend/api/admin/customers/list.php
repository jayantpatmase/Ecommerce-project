<?php
/**
 * Administrator Customer Management API
 * Never leaks user passwords
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/response.php';
require_once __DIR__ . '/../../../config/validation.php';
require_once __DIR__ . '/../../../middleware/admin.php';

$admin = requireAdmin();
$db    = Database::getConnection();

$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$pageParam  = $_GET['page'] ?? 1;
$limitParam = $_GET['limit'] ?? 20;
$paging     = Validator::paginate($pageParam, $limitParam, 20, 100);

$conditions = ["u.role = 'customer'"];
$params     = [];

if ($search !== '') {
    $term = "%{$search}%";
    $conditions[] = "(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
    $params[] = $term;
    $params[] = $term;
    $params[] = $term;
}

$whereClause = implode(" AND ", $conditions);

// Total
$cStmt = $db->prepare("SELECT COUNT(*) FROM users u WHERE {$whereClause}");
$cStmt->execute($params);
$total = (int)$cStmt->fetchColumn();

// Query
$sql = "
    SELECT u.id, u.name, u.email, u.phone, u.address, u.role, u.status, u.created_at,
           COUNT(o.id) AS total_orders,
           COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.total_amount ELSE 0 END), 0) AS total_spent
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
    WHERE {$whereClause}
    GROUP BY u.id
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
";

$stmt = $db->prepare($sql);
$execParams = array_merge($params, [$paging['limit'], $paging['offset']]);
$stmt->execute($execParams);
$customers = $stmt->fetchAll();

foreach ($customers as &$cust) {
    $cust['id']           = (int)$cust['id'];
    $cust['status']       = (int)$cust['status'];
    $cust['total_orders'] = (int)$cust['total_orders'];
    $cust['total_spent']  = (float)$cust['total_spent'];
}

Response::success([
    'customers'  => $customers,
    'pagination' => [
        'page'        => $paging['page'],
        'limit'       => $paging['limit'],
        'total'       => $total,
        'total_pages' => $paging['limit'] > 0 ? (int)ceil($total / $paging['limit']) : 1
    ]
], 'Customer accounts retrieved.');
