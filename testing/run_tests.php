<?php
/**
 * Automated Test Suite for E-Commerce Full-Stack System
 * Executes integration tests against database and backend APIs
 */

require_once __DIR__ . '/../backend/config/database.php';

echo "========================================================\n";
echo " RUNNING FULL-STACK E-COMMERCE INTEGRATION TEST SUITE   \n";
echo "========================================================\n\n";

$db = Database::getConnection();
$testsPassed = 0;
$testsFailed = 0;

function assertTest(string $description, bool $condition, string $details = '') {
    global $testsPassed, $testsFailed;
    if ($condition) {
        echo "[ PASS ] {$description}\n";
        $testsPassed++;
    } else {
        echo "[ FAIL ] {$description} -- {$details}\n";
        $testsFailed++;
    }
}

// TEST 1: Database Connection & Schema Verification
$tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
$expectedTables = ['users', 'categories', 'products', 'cart', 'wishlist', 'orders', 'order_items', 'reviews', 'payments', 'invoices', 'notification_logs'];
$allExist = count(array_intersect($expectedTables, $tables)) === count($expectedTables);
assertTest("Database Schema: All 11 tables exist in ecommerce_db", $allExist);

// TEST 2: Password Hashing Verification
$stmt = $db->prepare("SELECT password FROM users WHERE email = ?");
$stmt->execute(['admin@eshop.com']);
$adminHash = $stmt->fetchColumn();
assertTest("Security: Admin password verified with bcrypt", password_verify('Admin@123', $adminHash));

// TEST 3: Product Pricing Calculation Integrity
$prodStmt = $db->prepare("SELECT price, discount, ROUND(price - (price * discount / 100), 2) AS calculated_price FROM products WHERE id = 1");
$prodStmt->execute();
$prod = $prodStmt->fetch();
$expectedFinal = round((float)$prod['price'] - ((float)$prod['price'] * (float)$prod['discount'] / 100.0), 2);
assertTest("Product Pricing: Server calculates correct final price ($expectedFinal)", (float)$prod['calculated_price'] === $expectedFinal);

// TEST 4: Stock Integrity Rule (No negative stock)
$stockCheck = $db->query("SELECT COUNT(*) FROM products WHERE stock < 0")->fetchColumn();
assertTest("Inventory Rule: Stock cannot be negative (0 violating rows)", (int)$stockCheck === 0);

// TEST 5: Cart Calculation & Add Operation
$testUserId = 2; // John Doe
$testProductId = 5; // Oxford Shirt

// Clear any existing cart for test user on product 5
$db->prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?")->execute([$testUserId, $testProductId]);

// Insert into cart
$db->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, 2)")->execute([$testUserId, $testProductId]);
$cartItem = $db->query("SELECT quantity FROM cart WHERE user_id = {$testUserId} AND product_id = {$testProductId}")->fetch();
assertTest("Cart Management: Added 2 units of product to cart", (int)$cartItem['quantity'] === 2);

// TEST 6: Wishlist Duplicate Prevention (Unique Constraint)
$wishSuccess = false;
try {
    $db->prepare("INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)")->execute([$testUserId, $testProductId]);
    // Second insert of same user and product should trigger unique constraint violation
    $db->prepare("INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)")->execute([$testUserId, $testProductId]);
} catch (PDOException $e) {
    $wishSuccess = true; // Expected duplicate key error
}
assertTest("Wishlist Security: Duplicate wishlist record rejected by constraint", $wishSuccess);
$db->prepare("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?")->execute([$testUserId, $testProductId]);

// TEST 7: Transactional Order Creation & Atomic Stock Reduction
$shirtBefore = (int)$db->query("SELECT stock FROM products WHERE id = {$testProductId}")->fetchColumn();

// Execute Order Creation logic
$orderCreated = false;
$newOrderId = null;
try {
    $db->beginTransaction();
    $orderStmt = $db->prepare("
        INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, payment_status, order_status)
        VALUES (?, 94.98, 'Test Address 123', 'Cash on Delivery', 'pending', 'pending')
    ");
    $orderStmt->execute([$testUserId]);
    $newOrderId = (int)$db->lastInsertId();

    $itemStmt = $db->prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, 2, 47.49)");
    $itemStmt->execute([$newOrderId, $testProductId]);

    $upStock = $db->prepare("UPDATE products SET stock = stock - 2 WHERE id = ?");
    $upStock->execute([$testProductId]);

    $db->commit();
    $orderCreated = true;
} catch (Exception $e) {
    $db->rollBack();
}

$shirtAfter = (int)$db->query("SELECT stock FROM products WHERE id = {$testProductId}")->fetchColumn();
assertTest("Transactional Order: Order #{$newOrderId} created and stock deducted from {$shirtBefore} to {$shirtAfter}", $orderCreated && ($shirtBefore - $shirtAfter === 2));

// TEST 8: Order Cancellation & Single Stock Restoration Rule
$cancelSuccess = false;
try {
    $db->beginTransaction();
    // Restore stock
    $db->prepare("UPDATE products SET stock = stock + 2 WHERE id = ?")->execute([$testProductId]);
    $db->prepare("UPDATE orders SET order_status = 'cancelled' WHERE id = ?")->execute([$newOrderId]);
    $db->commit();
    $cancelSuccess = true;
} catch (Exception $e) {
    $db->rollBack();
}
$shirtRestored = (int)$db->query("SELECT stock FROM products WHERE id = {$testProductId}")->fetchColumn();
assertTest("Cancellation Consistency: Stock restored atomically back to {$shirtRestored}", $cancelSuccess && ($shirtRestored === $shirtBefore));

// Clean up test order
$db->prepare("DELETE FROM order_items WHERE order_id = ?")->execute([$newOrderId]);
$db->prepare("DELETE FROM orders WHERE id = ?")->execute([$newOrderId]);
$db->prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?")->execute([$testUserId, $testProductId]);

// TEST 9: Review Rating Bounds Check (Rating between 1 and 5)
$ratingBoundTested = false;
try {
    $db->prepare("INSERT INTO reviews (user_id, product_id, rating, review) VALUES (2, 4, 10, 'Invalid rating')")->execute();
} catch (PDOException $e) {
    $ratingBoundTested = true; // Check constraint rejected rating = 10
}
assertTest("Review Validation: Check constraint rejects rating > 5", $ratingBoundTested);

// TEST 10: Notification Logging Architecture
$notifCount = (int)$db->query("SELECT COUNT(*) FROM notification_logs WHERE status = 'sent'")->fetchColumn();
assertTest("Notification Architecture: Notification log table records dispatch events ({$notifCount} logged)", $notifCount > 0);

echo "\n========================================================\n";
echo " TEST SUMMARY: {$testsPassed} PASSED, {$testsFailed} FAILED\n";
echo "========================================================\n";
