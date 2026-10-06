<?php
/**
 * Standardized API Response Utilities
 * E-Commerce Website - Online Shopping Management System
 */

class Response {
    /**
     * Send a standardized JSON success response
     */
    public static function success($data = [], string $message = 'Operation successful', int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data'    => $data
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Send a standardized JSON error response
     */
    public static function error(string $message = 'Something went wrong', array $errors = [], int $statusCode = 400): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'message' => $message,
            'errors'  => $errors
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * Parse and sanitize incoming JSON or POST request data
     */
    public static function getRequestData(): array {
        $raw = file_get_contents('php://input');
        $json = json_decode($raw, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($json)) {
            return $json;
        }
        return $_POST;
    }
}
