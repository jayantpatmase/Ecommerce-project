<?php
/**
 * Administrator Orders List API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/response.php';
require_once __DIR__ . '/../../../config/validation.php';
require_once __DIR__ . '/../../../middleware/admin.php';

$admin = requireAdmin();
$db    = Database::getConnection();

$status  = isset($_GET['order_status']) ? trim($_GET['order_status']) : '';
$payment = isset($_GET['payment_status']) ? trim($_GET['payment_status']) : '';
$search  = isset($_GET['search']) ? trim($_GET['search']) : '';

$pageParam  = $_GET['page'] ?? 1;
$limitParam = $_GET['limit'] ?? 20;
$paging     = Validator::paginate($pageParam, $limitParam, 20, 100);

$conditions = ["1=1"];
$params     = [];

if ($status !== '') {
    $conditions[] = "o.order_status = ?";
    $params[] = $status;
}

if ($payment !== '') {
    $conditions[] = "o.payment_status = ?";
    $params[] = $payment;
}

if ($search !== '') {
    $term = "%{$search}%";
    $conditions[] = "(u.name LIKE ? OR u.email LIKE ? OR o.id = ?)";
    $params[] = $term;
    $params[] = $term;
    $params[] = (int)$search;
}

$whereClause = implode(" AND ", $conditions);

// Total
$cStmt = $db->prepare("
    SELECT COUNT(*) 
    FROM orders o 
    JOIN users u ON u.id = o.user_id 
    WHERE {$whereClause}
");
$cStmt->execute($params);
$total = (int)$cStmt->fetchColumn();

// List
$sql = "
    SELECT o.id, o.user_id, o.total_amount, o.shipping_address, o.payment_method,
           o.payment_status, o.order_status, o.created_at, o.updated_at,
           u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
           COUNT(oi.id) AS item_count
    FROM orders o
    JOIN users u ON u.id = o.user_id
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE {$whereClause}
    GROUP BY o.id
    ORDER BY o.id DESC
    LIMIT ? OFFSET ?
";

$stmt = $db->prepare($sql);
$execParams = array_merge($params, [$paging['limit'], $paging['offset']]);
$stmt->execute($execParams);
$orders = $stmt->fetchAll();

foreach ($orders as &$ord) {
    $ord['id']           = (int)$ord['id'];
    $ord['user_id']      = (int)$ord['user_id'];
    $ord['total_amount'] = (float)$ord['total_amount'];
    $ord['item_count']   = (int)$ord['item_count'];
}

Response::success([
    'orders'     => $orders,
    'pagination' => [
        'page'        => $paging['page'],
        'limit'       => $paging['limit'],
        'total'       => $total,
        'total_pages' => $paging['limit'] > 0 ? (int)ceil($total / $paging['limit']) : 1
    ]
], 'Admin orders retrieved.');
