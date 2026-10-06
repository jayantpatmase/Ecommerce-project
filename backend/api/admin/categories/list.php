<?php
/**
 * Administrator Categories List API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/response.php';
require_once __DIR__ . '/../../../middleware/admin.php';

$admin = requireAdmin();
$db    = Database::getConnection();

$stmt = $db->query("
    SELECT c.id, c.name, c.description, c.status, c.created_at,
           COUNT(p.id) AS product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.id
    ORDER BY c.id DESC
");
$categories = $stmt->fetchAll();

foreach ($categories as &$c) {
    $c['id']            = (int)$c['id'];
    $c['status']        = (int)$c['status'];
    $c['product_count'] = (int)$c['product_count'];
}

Response::success($categories, 'Admin categories retrieved.');
