<?php
/**
 * Authentication Middleware
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/response.php';

function requireAuth(): array {
    if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
        Response::error('Authentication required. Please log in to proceed.', [], 401);
    }

    $userId = (int)$_SESSION['user_id'];
    $db = Database::getConnection();
    $stmt = $db->prepare("SELECT id, name, email, role, phone, address, status FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        // Invalidate corrupt session
        $_SESSION = [];
        if (session_id()) session_destroy();
        Response::error('User session invalid. Please log in again.', [], 401);
    }

    if ((int)$user['status'] !== 1) {
        $_SESSION = [];
        if (session_id()) session_destroy();
        Response::error('Your account has been deactivated. Contact support.', [], 403);
    }

    return $user;
}
