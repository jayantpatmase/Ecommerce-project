<?php
/**
 * Auth Profile Session Check API
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = requireAuth();
$db = Database::getConnection();
$stmt = $db->prepare("SELECT id, name, email, phone, address, role, reward_coins, wallet_balance FROM users WHERE id = ?");
$stmt->execute([(int)$user['id']]);
$fresh = $stmt->fetch();

Response::success([
    'user' => [
        'id'             => (int)$fresh['id'],
        'name'           => $fresh['name'],
        'email'          => $fresh['email'],
        'phone'          => $fresh['phone'],
        'address'        => $fresh['address'],
        'role'           => $fresh['role'],
        'reward_coins'   => (int)($fresh['reward_coins'] ?? 120),
        'wallet_balance' => (float)($fresh['wallet_balance'] ?? 250.00)
    ]
], 'Session verified.');
