<?php
/**
 * Customer Products List API with Server-Side Search, Filtering, Sorting & Pagination
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/validation.php';

$db = Database::getConnection();

// Query Parameters
$search       = isset($_GET['search']) ? trim($_GET['search']) : '';
$categoryId   = isset($_GET['category']) && is_numeric($_GET['category']) ? (int)$_GET['category'] : null;
$minPrice     = isset($_GET['min_price']) && is_numeric($_GET['min_price']) ? (float)$_GET['min_price'] : null;
$maxPrice     = isset($_GET['max_price']) && is_numeric($_GET['max_price']) ? (float)$_GET['max_price'] : null;
$availability = isset($_GET['availability']) ? $_GET['availability'] : null; // 'in_stock'
$ratingMin    = isset($_GET['rating']) && is_numeric($_GET['rating']) ? (float)$_GET['rating'] : null;
$minDiscount  = isset($_GET['discount']) && is_numeric($_GET['discount']) ? (float)$_GET['discount'] : null;
$sort         = isset($_GET['sort']) ? trim($_GET['sort']) : 'newest';
$featured     = isset($_GET['featured']) && $_GET['featured'] == '1';

// Pagination
$pageParam  = $_GET['page'] ?? 1;
$limitParam = $_GET['limit'] ?? 12;
$paging = Validator::paginate($pageParam, $limitParam, 12, 50);

// Base Conditions
$conditions = ["p.status = 1"];
$params     = [];

// Server-side Search
if ($search !== '') {
    $searchTerm = "%{$search}%";
    $conditions[] = "(p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)";
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $params[] = $searchTerm;
}

// Category Filter
if ($categoryId !== null && $categoryId > 0) {
    $conditions[] = "p.category_id = ?";
    $params[] = $categoryId;
}

// Discount Filter
if ($minDiscount !== null && $minDiscount > 0) {
    $conditions[] = "p.discount >= ?";
    $params[] = $minDiscount;
}

// Stock Availability
if ($availability === 'in_stock') {
    $conditions[] = "p.stock > 0";
}

$whereClause = implode(" AND ", $conditions);

// Sorting Whitelist
$sortMap = [
    'price_low'  => "final_price ASC, p.id ASC",
    'price_high' => "final_price DESC, p.id DESC",
    'name_az'    => "p.name ASC",
    'name_za'    => "p.name DESC",
    'newest'     => "p.created_at DESC",
    'discount'   => "p.discount DESC, p.id DESC",
    'rating'     => "avg_rating DESC, review_count DESC"
];
$orderBy = $sortMap[$sort] ?? "p.created_at DESC";

// Price calculation expression: price - (price * discount / 100)
$calcExpr = "ROUND(p.price - (p.price * (p.discount / 100.0)), 2)";

// Having clause for aggregated or computed fields (min/max price on final_price and min rating)
$havingConditions = [];
$havingParams     = [];

if ($minPrice !== null && $minPrice >= 0) {
    $havingConditions[] = "final_price >= ?";
    $havingParams[] = $minPrice;
}
if ($maxPrice !== null && $maxPrice > 0) {
    $havingConditions[] = "final_price <= ?";
    $havingParams[] = $maxPrice;
}
if ($ratingMin !== null && $ratingMin > 0) {
    $havingConditions[] = "avg_rating >= ?";
    $havingParams[] = $ratingMin;
}

$havingClause = !empty($havingConditions) ? "HAVING " . implode(" AND ", $havingConditions) : "";

// Count Total matching records
$countSql = "
    SELECT COUNT(*) AS total FROM (
        SELECT p.id,
               {$calcExpr} AS final_price,
               COALESCE(AVG(r.rating), 0) AS avg_rating
        FROM products p
        JOIN categories c ON p.category_id = c.id
        LEFT JOIN reviews r ON r.product_id = p.id AND r.status = 1
        WHERE {$whereClause}
        GROUP BY p.id
        {$havingClause}
    ) AS count_subquery
";

$countStmt = $db->prepare($countSql);
$countParams = array_merge($params, $havingParams);
$countStmt->execute($countParams);
$total = (int)$countStmt->fetchColumn();

// Fetch Products
$querySql = "
    SELECT p.id, p.category_id, p.name, p.description, p.specifications,
           p.price, p.discount, {$calcExpr} AS final_price,
           p.stock, p.image, p.status, p.created_at,
           c.name AS category_name,
           ROUND(COALESCE(AVG(r.rating), 0), 1) AS avg_rating,
           COUNT(r.id) AS review_count
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN reviews r ON r.product_id = p.id AND r.status = 1
    WHERE {$whereClause}
    GROUP BY p.id
    {$havingClause}
    ORDER BY {$orderBy}
    LIMIT ? OFFSET ?
";

$stmt = $db->prepare($querySql);
$execParams = array_merge($params, $havingParams, [$paging['limit'], $paging['offset']]);
$stmt->execute($execParams);
$products = $stmt->fetchAll();

// Format numbers
foreach ($products as &$item) {
    $item['id']           = (int)$item['id'];
    $item['category_id']  = (int)$item['category_id'];
    $item['price']        = (float)$item['price'];
    $item['discount']     = (float)$item['discount'];
    $item['final_price']  = (float)$item['final_price'];
    $item['stock']        = (int)$item['stock'];
    $item['avg_rating']   = (float)$item['avg_rating'];
    $item['review_count'] = (int)$item['review_count'];
}

$totalPages = $paging['limit'] > 0 ? (int)ceil($total / $paging['limit']) : 1;

Response::success([
    'products'   => $products,
    'pagination' => [
        'page'        => $paging['page'],
        'limit'       => $paging['limit'],
        'total'       => $total,
        'total_pages' => $totalPages
    ]
], 'Products loaded successfully.');
