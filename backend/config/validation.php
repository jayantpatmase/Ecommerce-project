<?php
/**
 * Validation and Sanitization Helper Library
 * E-Commerce Website - Online Shopping Management System
 */

class Validator {
    /**
     * Check if required fields exist and are non-empty
     */
    public static function required(array $data, array $fields): array {
        $missing = [];
        foreach ($fields as $field) {
            if (!isset($data[$field]) || trim((string)$data[$field]) === '') {
                $missing[] = "Field '{$field}' is required.";
            }
        }
        return $missing;
    }

    /**
     * Validate email format
     */
    public static function isEmail(string $email): bool {
        return (bool)filter_var($email, FILTER_VALIDATE_EMAIL);
    }

    /**
     * Validate password minimum length (8 chars)
     */
    public static function isPasswordValid(string $password, int $minLength = 8): bool {
        return strlen($password) >= $minLength;
    }

    /**
     * Validate positive integer (for IDs, stock, quantities)
     */
    public static function isPositiveInt($value): bool {
        return filter_var($value, FILTER_VALIDATE_INT) !== false && (int)$value > 0;
    }

    /**
     * Validate non-negative integer (e.g. stock >= 0)
     */
    public static function isNonNegativeInt($value): bool {
        return filter_var($value, FILTER_VALIDATE_INT) !== false && (int)$value >= 0;
    }

    /**
     * Validate monetary price or decimal (>= 0)
     */
    public static function isPrice($value): bool {
        return is_numeric($value) && (float)$value >= 0;
    }

    /**
     * Validate rating between 1 and 5
     */
    public static function isRating($value): bool {
        return filter_var($value, FILTER_VALIDATE_INT) !== false && (int)$value >= 1 && (int)$value <= 5;
    }

    /**
     * Clean and sanitize input string to prevent XSS
     */
    public static function sanitize(string $input): string {
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }

    /**
     * Validate phone number
     */
    public static function isPhone(string $phone): bool {
        // Allows digits, spaces, plus, hyphens, parentheses (7 to 20 chars)
        return (bool)preg_match('/^[0-9+\(\)#\.\s\/-]{7,20}$/', trim($phone));
    }

    /**
     * Validate and normalize pagination parameters
     */
    public static function paginate($page, $limit, int $defaultLimit = 12, int $maxLimit = 50): array {
        $p = (int)$page;
        $l = (int)$limit;

        if ($p < 1) $p = 1;
        if ($l < 1) $l = $defaultLimit;
        if ($l > $maxLimit) $l = $maxLimit;

        $offset = ($p - 1) * $l;
        return [
            'page' => $p,
            'limit' => $l,
            'offset' => $offset
        ];
    }
}
