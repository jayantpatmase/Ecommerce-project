<?php
/**
 * Create Order API - Strict Transactional Implementation
 * E-Commerce Website - Online Shopping Management System
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/response.php';
require_once __DIR__ . '/../../config/validation.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../services/email.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method Not Allowed', [], 405);
}

$user   = requireAuth();
$userId = (int)$user['id'];
$data   = Response::getRequestData();

$errors = Validator::required($data, ['shipping_address', 'payment_method']);
if (!empty($errors)) {
    Response::error('Validation failed', $errors, 422);
}

$shippingAddress = Validator::sanitize($data['shipping_address']);
$paymentMethod   = Validator::sanitize($data['payment_method']);

$allowedMethods = [
    'Cash on Delivery',
    'Online Payment',
    'UPI (Google Pay / PhonePe / Paytm / BHIM)',
    'Credit/Debit Card (RuPay/Visa/Mastercard)',
    'Net Banking'
];
if (!in_array($paymentMethod, $allowedMethods, true)) {
    Response::error('Invalid payment method selected.', ['payment_method' => 'Allowed: Cash on Delivery, UPI, Cards, Net Banking, or Online Payment'], 400);
}

$db = Database::getConnection();

try {
    // 1. START TRANSACTION
    $db->beginTransaction();

    // 2. Fetch User Cart
    $cartStmt = $db->prepare("SELECT id, product_id, quantity FROM cart WHERE user_id = ? FOR UPDATE");
    $cartStmt->execute([$userId]);
    $cartItems = $cartStmt->fetchAll();

    if (empty($cartItems)) {
        $db->rollBack();
        Response::error('Your cart is empty. Please add products before checking out.', [], 400);
    }

    $subtotal = 0.00;
    $orderItemsData = [];

    // 3. Lock products & Validate Stock & Calculate True Prices
    $prodStmt = $db->prepare("
        SELECT id, name, price, discount, stock, status 
        FROM products 
        WHERE id = ? 
        FOR UPDATE
    ");

    foreach ($cartItems as $cItem) {
        $prodId = (int)$cItem['product_id'];
        $qty    = (int)$cItem['quantity'];

        $prodStmt->execute([$prodId]);
        $product = $prodStmt->fetch();

        if (!$product || (int)$product['status'] !== 1) {
            $db->rollBack();
            $pName = $product['name'] ?? "Item #{$prodId}";
            Response::error("Product '{$pName}' is currently inactive or unavailable.", [], 400);
        }

        $currentStock = (int)$product['stock'];
        if ($qty > $currentStock) {
            $db->rollBack();
            Response::error("Insufficient stock for '{$product['name']}'. Requested: {$qty}, Available: {$currentStock}.", [], 400);
        }

        // True server-calculated final price at purchase time
        $unitPrice = (float)$product['price'];
        $discount  = (float)$product['discount'];
        $purchasePrice = round($unitPrice - ($unitPrice * ($discount / 100.0)), 2);
        $itemTotal = round($purchasePrice * $qty, 2);

        $subtotal += $itemTotal;

        $orderItemsData[] = [
            'product_id'     => $prodId,
            'quantity'       => $qty,
            'purchase_price' => $purchasePrice,
            'new_stock'      => $currentStock - $qty
        ];
    }

    // Coupon discount calculation
    $couponCode = strtoupper(trim(Validator::sanitize($data['coupon_code'] ?? '')));
    $couponDiscount = 0.00;
    if (!empty($couponCode)) {
        $cpStmt = $db->prepare("SELECT * FROM coupons WHERE code = ? AND status = 1");
        $cpStmt->execute([$couponCode]);
        $coupon = $cpStmt->fetch();
        if ($coupon && $subtotal >= (float)$coupon['min_order_amount']) {
            if ($coupon['discount_type'] === 'percentage') {
                $couponDiscount = ($subtotal * (float)$coupon['discount_value']) / 100;
                if ($coupon['max_discount'] !== null && $couponDiscount > (float)$coupon['max_discount']) {
                    $couponDiscount = (float)$coupon['max_discount'];
                }
            } else {
                $couponDiscount = min((float)$coupon['discount_value'], $subtotal);
            }
            $couponDiscount = round($couponDiscount, 2);
        }
    }

    // Reward coins redemption (1 coin = ₹1 off)
    $coinsRedeemed = max(0, (int)($data['coins_redeemed'] ?? 0));
    $coinsDiscount = 0.00;
    if ($coinsRedeemed > 0) {
        $coinStmt = $db->prepare("SELECT reward_coins FROM users WHERE id = ?");
        $coinStmt->execute([$userId]);
        $userCoins = (int)$coinStmt->fetchColumn();
        $coinsRedeemed = min($coinsRedeemed, $userCoins, 50);
        $coinsDiscount = (float)$coinsRedeemed;
        $db->prepare("UPDATE users SET reward_coins = reward_coins - ? WHERE id = ?")->execute([$coinsRedeemed, $userId]);
    }

    // Shipping fee rule: Free delivery for orders >= ₹999, otherwise ₹49 flat
    $shippingFee = ($subtotal >= 999.00) ? 0.00 : 49.00;
    $grandTotal  = max(0.00, round($subtotal - $couponDiscount - $coinsDiscount + $shippingFee, 2));

    $paymentStatus = 'pending';
    $orderStatus   = ($paymentMethod === 'Cash on Delivery') ? 'confirmed' : 'pending';

    // 4. Create Order Header with tracking AWB and coupon details
    $expAwb = 'EXP-' . time() . '-IN';
    $orderInsert = $db->prepare("
        INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, payment_status, order_status, coupon_code, coupon_discount, coins_redeemed, courier_name, tracking_number, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Blue Dart Express', ?, NOW())
    ");
    $orderInsert->execute([
        $userId, $grandTotal, $shippingAddress, $paymentMethod, $paymentStatus, $orderStatus,
        $couponCode ?: null, $couponDiscount, $coinsRedeemed, $expAwb
    ]);
    $orderId = (int)$db->lastInsertId();

    // Reward +25 coins to user for completing a purchase (Flipkart SuperCoins style)
    $db->prepare("UPDATE users SET reward_coins = reward_coins + 25 WHERE id = ?")->execute([$userId]);

    // 5. Insert Order Items & 6. Reduce Stock
    $itemInsert = $db->prepare("
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
    ");
    $stockUpdate = $db->prepare("UPDATE products SET stock = ? WHERE id = ?");

    foreach ($orderItemsData as $oi) {
        $itemInsert->execute([$orderId, $oi['product_id'], $oi['quantity'], $oi['purchase_price']]);
        $stockUpdate->execute([$oi['new_stock'], $oi['product_id']]);
    }

    // 7. Clear User Cart
    $clearCart = $db->prepare("DELETE FROM cart WHERE user_id = ?");
    $clearCart->execute([$userId]);

    // 8. If Cash on Delivery, record payment pending transaction and create invoice
    if ($paymentMethod === 'Cash on Delivery') {
        $payStmt = $db->prepare("
            INSERT INTO payments (order_id, payment_method, transaction_id, amount, status, gateway_response, created_at)
            VALUES (?, 'Cash on Delivery', ?, ?, 'pending', '{\"method\":\"COD\",\"status\":\"PENDING_ON_DELIVERY\"}', NOW())
        ");
        $payStmt->execute([$orderId, 'COD_' . $orderId . '_' . time(), $grandTotal]);

        // Create Invoice
        $invNumber = 'INV-' . date('Y') . '-' . str_pad((string)$orderId, 5, '0', STR_PAD_LEFT);
        $invStmt = $db->prepare("
            INSERT INTO invoices (order_id, invoice_number, invoice_date, file_path, created_at)
            VALUES (?, ?, NOW(), ?, NOW())
        ");
        $invStmt->execute([$orderId, $invNumber, "/uploads/invoices/{$invNumber}.html"]);
    }

    // 9. COMMIT TRANSACTION
    $db->commit();

    // 10. Send Email notification (outside transaction so failure doesn't roll back)
    EmailService::sendOrderConfirmation($user['email'], $user['name'], $orderId, $grandTotal, $paymentMethod, $userId);

    Response::success([
        'order_id'       => $orderId,
        'total_amount'   => $grandTotal,
        'payment_method' => $paymentMethod,
        'payment_status' => $paymentStatus,
        'order_status'   => $orderStatus
    ], 'Order placed successfully!', 201);

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    error_log("Order checkout failed: " . $e->getMessage());
    Response::error('Failed to create order: ' . $e->getMessage(), [], 500);
}
