<?php
/**
 * Database Connection & Environment Configuration
 * E-Commerce Website - Online Shopping Management System
 */

// Enable error logging while disabling display in production
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

// Configure Secure Session Parameters
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_samesite', 'Lax');
    
    // Set cookie parameters before session_start
    session_set_cookie_params([
        'lifetime' => 86400 * 7, // 7 days
        'path' => '/',
        'domain' => '',
        'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

// Global CORS Handling for React Frontend
function handleCors() {
    $allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost'
    ];
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        // Fallback for direct browser calls or default dev
        header("Access-Control-Allow-Origin: http://localhost:5173");
    }
    
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
    
    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}
handleCors();

// Helper to load .env file
function loadEnv($envPath) {
    if (!file_exists($envPath)) {
        return;
    }
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || str_starts_with($line, '#')) {
            continue;
        }
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value, " \t\n\r\0\x0B\"'");
            if (!array_key_exists($key, $_SERVER) && !array_key_exists($key, $_ENV)) {
                putenv("$key=$value");
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }
    }
}

// Load backend .env or root .env
loadEnv(__DIR__ . '/../.env');
loadEnv(__DIR__ . '/../../.env');

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $host = getenv('DB_HOST') ?: 'localhost';
            $db   = getenv('DB_NAME') ?: 'ecommerce_db';
            $user = getenv('DB_USER') ?: 'root';
            $pass = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : '';
            $charset = 'utf8mb4';

            $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$instance = new PDO($dsn, $user, $pass, $options);
            } catch (PDOException $e) {
                error_log("Database connection failure: " . $e->getMessage());
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Database connection failed. Please ensure MySQL service is running.',
                    'errors' => []
                ]);
                exit;
            }
        }
        return self::$instance;
    }
}
