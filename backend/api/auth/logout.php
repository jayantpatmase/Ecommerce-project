<?php
/**
 * User Logout API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';

$_SESSION = [];

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

if (session_id()) {
    session_destroy();
}

Response::success([], 'Logged out successfully!');
