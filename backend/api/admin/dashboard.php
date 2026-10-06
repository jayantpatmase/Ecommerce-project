<?php
/**
 * Administrator Dashboard Overview API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../middleware/admin.php';

$admin = requireAdmin();
$db    = Database::getConnection();

// 1. KPI Cards
$totalProducts   = (int)$db->query("SELECT COUNT(*) FROM products")->fetchColumn();
$totalCustomers  = (int)$db->query("SELECT COUNT(*) FROM users WHERE role = 'customer'")->fetchColumn();
$totalOrders     = (int)$db->query("SELECT COUNT(*) FROM orders")->fetchColumn();
$pendingOrders   = (int)$db->query("SELECT COUNT(*) FROM orders WHERE order_status = 'pending'")->fetchColumn();
$deliveredOrders = (int)$db->query("SELECT COUNT(*) FROM orders WHERE order_status = 'delivered'")->fetchColumn();
$lowStockCount   = (int)$db->query("SELECT COUNT(*) FROM products WHERE stock <= 5 AND status = 1")->fetchColumn();
$totalSales      = (float)$db->query("SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid'")->fetchColumn();

// 2. Recent Orders
$recentOrdersStmt = $db->query("
    SELECT o.id, o.total_amount, o.payment_method, o.payment_status, o.order_status, o.created_at,
           u.name AS customer_name, u.email AS customer_email
    FROM orders o
    JOIN users u ON u.id = o.user_id
    ORDER BY o.created_at DESC
    LIMIT 6
");
$recentOrders = $recentOrdersStmt->fetchAll();

// 3. Low Stock Alert Products
$lowStockStmt = $db->query("
    SELECT p.id, p.name, p.stock, p.price, c.name AS category_name
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.stock <= 5 AND p.status = 1
    ORDER BY p.stock ASC
    LIMIT 6
");
$lowStockProducts = $lowStockStmt->fetchAll();

// 4. Recent Customers
$recentCustStmt = $db->query("
    SELECT id, name, email, phone, created_at
    FROM users
    WHERE role = 'customer'
    ORDER BY created_at DESC
    LIMIT 5
");
$recentCustomers = $recentCustStmt->fetchAll();

Response::success([
    'stats' => [
        'total_products'   => $totalProducts,
        'total_customers'  => $totalCustomers,
        'total_orders'     => $totalOrders,
        'pending_orders'   => $pendingOrders,
        'delivered_orders' => $deliveredOrders,
        'low_stock_count'  => $lowStockCount,
        'total_sales'      => round($totalSales, 2)
    ],
    'recent_orders'      => $recentOrders,
    'low_stock_products' => $lowStockProducts,
    'recent_customers'   => $recentCustomers
], 'Admin dashboard metrics retrieved.');
