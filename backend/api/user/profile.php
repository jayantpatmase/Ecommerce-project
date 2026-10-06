<?php
/**
 * User Profile Endpoint
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = requireAuth();

Response::success([
    'user' => [
        'id'         => (int)$user['id'],
        'name'       => $user['name'],
        'email'      => $user['email'],
        'phone'      => $user['phone'],
        'address'    => $user['address'],
        'role'       => $user['role'],
        'created_at' => $user['created_at'] ?? null
    ]
], 'Profile loaded successfully.');
