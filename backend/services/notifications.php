<?php
/**
 * Notification Logging Service
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../config/database.php';

class NotificationService {
    /**
     * Log a notification dispatch attempt
     */
    public static function log(?int $userId, ?int $orderId, string $type, ?string $recipient, string $status = 'sent', ?string $errorMessage = null): int {
        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("
                INSERT INTO notification_logs (user_id, order_id, type, recipient, status, error_message, created_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([$userId, $orderId, $type, $recipient, $status, $errorMessage]);
            return (int)$db->lastInsertId();
        } catch (Exception $e) {
            error_log("Notification log failed: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Check if a notification for a particular order and event type was already dispatched
     */
    public static function hasBeenSent(int $orderId, string $type): bool {
        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("
                SELECT id FROM notification_logs 
                WHERE order_id = ? AND type = ? AND status = 'sent' 
                LIMIT 1
            ");
            $stmt->execute([$orderId, $type]);
            return (bool)$stmt->fetch();
        } catch (Exception $e) {
            return false;
        }
    }
}
