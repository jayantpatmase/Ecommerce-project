<?php
/**
 * Administrator Authorization Middleware
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/auth.php';

function requireAdmin(): array {
    $user = requireAuth();

    if ($user['role'] !== 'admin' || (isset($_SESSION['role']) && $_SESSION['role'] !== 'admin')) {
        Response::error('Access denied. Administrator privileges required.', [], 403);
    }

    return $user;
}
