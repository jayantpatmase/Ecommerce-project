<?php
/**
 * Customer Categories List API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';

$db = Database::getConnection();

$stmt = $db->query("
    SELECT c.id, c.name, c.description, c.status,
           COUNT(p.id) AS product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id AND p.status = 1
    WHERE c.status = 1
    GROUP BY c.id
    ORDER BY c.name ASC
");

$categories = $stmt->fetchAll();

Response::success($categories, 'Categories loaded successfully.');
