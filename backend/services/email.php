<?php
/**
 * Email Service Architecture
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/notifications.php';

class EmailService {
    /**
     * Send email and safely log output without raising uncaught exceptions
     */
    public static function send(string $toEmail, string $subject, string $htmlBody, string $type, ?int $userId = null, ?int $orderId = null): bool {
        $fromEmail = getenv('MAIL_FROM_EMAIL') ?: 'noreply@eshop.com';
        $fromName  = getenv('MAIL_FROM_NAME') ?: 'E-Shop Support';

        // Headers for HTML Mail
        $headers  = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "From: {$fromName} <{$fromEmail}>\r\n";
        $headers .= "Reply-To: {$fromEmail}\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();

        $success = false;
        $errorMsg = null;

        try {
            // Attempt standard PHP mail()
            // In local/sandbox development or XAMPP, mail() might write to mailoutput or succeed/fail gracefully
            $sent = @mail($toEmail, $subject, $htmlBody, $headers);
            if ($sent) {
                $success = true;
            } else {
                // If mail server is not configured locally, mark simulation success in development log
                $env = getenv('APP_ENV') ?: 'development';
                if ($env === 'development') {
                    $success = true; // Simulated delivery for local testing environment
                    $errorMsg = 'Simulated delivery in local development environment';
                } else {
                    $errorMsg = 'Mail transport agent failed to deliver message.';
                }
            }
        } catch (Throwable $e) {
            $errorMsg = $e->getMessage();
            $success = false;
        }

        // Always log notification attempt
        NotificationService::log(
            $userId,
            $orderId,
            $type,
            $toEmail,
            $success ? 'sent' : 'failed',
            $errorMsg
        );

        return $success;
    }

    /**
     * Welcome Email Template
     */
    public static function sendWelcomeEmail(string $email, string $name, int $userId): bool {
        $subject = "Welcome to E-Shop, {$name}!";
        $body = "
        <div style='font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:8px;'>
            <h2 style='color:#0d6efd;'>Welcome to E-Shop!</h2>
            <p>Hi {$name},</p>
            <p>Thank you for creating an account with us. You can now explore thousands of premium products, track your orders, and manage your wishlist.</p>
            <p style='margin-top:20px;'><a href='http://localhost:5173/products' style='background:#0d6efd;color:#fff;padding:10px 18px;text-decoration:none;border-radius:4px;'>Start Shopping</a></p>
            <hr style='border:none;border-top:1px solid #e2e8f0;margin:25px 0;'/>
            <p style='font-size:12px;color:#64748b;'>E-Commerce Online Shopping Management System</p>
        </div>";
        return self::send($email, $subject, $body, 'registration_welcome', $userId);
    }

    /**
     * Order Confirmation Email
     */
    public static function sendOrderConfirmation(string $email, string $name, int $orderId, float $total, string $method, int $userId): bool {
        if (NotificationService::hasBeenSent($orderId, 'order_confirmation')) {
            return true;
        }

        $subject = "Order #{$orderId} Confirmation - E-Shop";
        $formattedTotal = number_format($total, 2);
        $body = "
        <div style='font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:8px;'>
            <h2 style='color:#198754;'>Order Placed Successfully!</h2>
            <p>Dear {$name},</p>
            <p>Your order <strong>#{$orderId}</strong> has been received and is currently being processed.</p>
            <table style='width:100%;margin:15px 0;border-collapse:collapse;'>
                <tr><td style='padding:8px;border-bottom:1px solid #eee;'><strong>Order Total:</strong></td><td style='padding:8px;border-bottom:1px solid #eee;'>\${$formattedTotal}</td></tr>
                <tr><td style='padding:8px;border-bottom:1px solid #eee;'><strong>Payment Method:</strong></td><td style='padding:8px;border-bottom:1px solid #eee;'>{$method}</td></tr>
            </table>
            <p><a href='http://localhost:5173/orders/{$orderId}' style='background:#0d6efd;color:#fff;padding:10px 18px;text-decoration:none;border-radius:4px;'>Track Order Details</a></p>
            <hr style='border:none;border-top:1px solid #e2e8f0;margin:25px 0;'/>
            <p style='font-size:12px;color:#64748b;'>Thank you for choosing E-Shop!</p>
        </div>";
        return self::send($email, $subject, $body, 'order_confirmation', $userId, $orderId);
    }

    /**
     * Order Status Update Email
     */
    public static function sendOrderStatusUpdate(string $email, string $name, int $orderId, string $status, int $userId): bool {
        $notificationType = 'order_status_' . strtolower($status);
        if (NotificationService::hasBeenSent($orderId, $notificationType)) {
            return true;
        }

        $subject = "Order #{$orderId} Update: " . ucfirst($status) . " - E-Shop";
        $body = "
        <div style='font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:8px;'>
            <h2 style='color:#0d6efd;'>Order Status Update</h2>
            <p>Dear {$name},</p>
            <p>Your order <strong>#{$orderId}</strong> status has been updated to: <span style='font-weight:bold;color:#0d6efd;'>" . strtoupper($status) . "</span>.</p>
            <p><a href='http://localhost:5173/orders/{$orderId}' style='background:#0d6efd;color:#fff;padding:10px 18px;text-decoration:none;border-radius:4px;'>View Order</a></p>
            <hr style='border:none;border-top:1px solid #e2e8f0;margin:25px 0;'/>
            <p style='font-size:12px;color:#64748b;'>E-Shop Automated Order Service</p>
        </div>";
        return self::send($email, $subject, $body, $notificationType, $userId, $orderId);
    }
}
