-- ==============================================================
-- E-Commerce Website - Online Shopping Management System
-- Database Schema & Realistic Seed Data
-- ==============================================================

CREATE DATABASE IF NOT EXISTS `ecommerce_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ecommerce_db`;

-- Disable foreign key checks for clean recreation
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `notification_logs`;
DROP TABLE IF EXISTS `invoices`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `wishlist`;
DROP TABLE IF EXISTS `cart`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------------
-- 1. USERS TABLE
-- -------------------------------------------------------------
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20),
    `address` TEXT,
    `role` ENUM('customer', 'admin') DEFAULT 'customer',
    `status` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- -------------------------------------------------------------
CREATE TABLE `categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `status` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 3. PRODUCTS TABLE
-- -------------------------------------------------------------
CREATE TABLE `products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `category_id` INT NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT,
    `specifications` TEXT,
    `price` DECIMAL(10,2) NOT NULL,
    `discount` DECIMAL(5,2) DEFAULT 0.00,
    `stock` INT DEFAULT 0,
    `image` VARCHAR(255),
    `status` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_product_category`
        FOREIGN KEY (`category_id`)
        REFERENCES `categories` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 4. CART TABLE
-- -------------------------------------------------------------
CREATE TABLE `cart` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_cart_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE,
    CONSTRAINT `fk_cart_product`
        FOREIGN KEY (`product_id`)
        REFERENCES `products` (`id`)
        ON DELETE CASCADE,
    UNIQUE KEY `unique_user_product` (`user_id`, `product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 5. WISHLIST TABLE
-- -------------------------------------------------------------
CREATE TABLE `wishlist` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_wishlist_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE,
    CONSTRAINT `fk_wishlist_product`
        FOREIGN KEY (`product_id`)
        REFERENCES `products` (`id`)
        ON DELETE CASCADE,
    UNIQUE KEY `unique_wishlist_product` (`user_id`, `product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 6. ORDERS TABLE
-- -------------------------------------------------------------
CREATE TABLE `orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `total_amount` DECIMAL(10,2) NOT NULL,
    `shipping_address` TEXT NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `payment_status` ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    `order_status` ENUM('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_order_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 7. ORDER ITEMS TABLE
-- -------------------------------------------------------------
CREATE TABLE `order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `quantity` INT NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    CONSTRAINT `fk_order_item_order`
        FOREIGN KEY (`order_id`)
        REFERENCES `orders` (`id`)
        ON DELETE CASCADE,
    CONSTRAINT `fk_order_item_product`
        FOREIGN KEY (`product_id`)
        REFERENCES `products` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 8. REVIEWS TABLE
-- -------------------------------------------------------------
CREATE TABLE `reviews` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `rating` TINYINT NOT NULL,
    `review` TEXT,
    `status` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_review_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE,
    CONSTRAINT `fk_review_product`
        FOREIGN KEY (`product_id`)
        REFERENCES `products` (`id`)
        ON DELETE CASCADE,
    UNIQUE KEY `unique_user_product_review` (`user_id`, `product_id`),
    CONSTRAINT `chk_rating_range` CHECK (`rating` >= 1 AND `rating` <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 9. PAYMENTS TABLE
-- -------------------------------------------------------------
CREATE TABLE `payments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `transaction_id` VARCHAR(255),
    `amount` DECIMAL(10,2) NOT NULL,
    `status` ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    `gateway_response` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_payment_order`
        FOREIGN KEY (`order_id`)
        REFERENCES `orders` (`id`)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 10. INVOICES TABLE
-- -------------------------------------------------------------
CREATE TABLE `invoices` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL UNIQUE,
    `invoice_number` VARCHAR(50) NOT NULL UNIQUE,
    `invoice_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `file_path` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_invoice_order`
        FOREIGN KEY (`order_id`)
        REFERENCES `orders` (`id`)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 11. NOTIFICATION LOGS TABLE
-- -------------------------------------------------------------
CREATE TABLE `notification_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `order_id` INT,
    `type` VARCHAR(100) NOT NULL,
    `recipient` VARCHAR(150),
    `status` ENUM('sent', 'failed') DEFAULT 'sent',
    `error_message` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_notification_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE SET NULL,
    CONSTRAINT `fk_notification_order`
        FOREIGN KEY (`order_id`)
        REFERENCES `orders` (`id`)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- INDEXES
-- -------------------------------------------------------------
CREATE INDEX `idx_products_category` ON `products` (`category_id`);
CREATE INDEX `idx_products_status` ON `products` (`status`);
CREATE INDEX `idx_orders_user` ON `orders` (`user_id`);
CREATE INDEX `idx_orders_status` ON `orders` (`order_status`);
CREATE INDEX `idx_reviews_product` ON `reviews` (`product_id`);

-- -------------------------------------------------------------
-- SEED DATA
-- -------------------------------------------------------------

-- Users (passwords: Admin@123 for admin, Customer@123 for customers)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `address`, `role`, `status`) VALUES
(1, 'Administrator', 'admin@eshop.com', '$2y$10$H9oCdfVSPtx.34wqD.r4JeLpvn.thaJ4eXhLgobkD1dRUyeHcfjl.', '+1 800 555 0199', '100 Tech Hub Blvd, Suite 400, Silicon Valley, CA 94025', 'admin', 1),
(2, 'John Doe', 'john.doe@example.com', '$2y$10$sj7A3MBuRvhcHNNI968Ar.oVyKGxmEFAYi/uQeXhhA7rRq.CSmsn6', '+1 555 123 4567', '742 Evergreen Terrace, Springfield, OR 97477', 'customer', 1),
(3, 'Jane Smith', 'jane.smith@example.com', '$2y$10$sj7A3MBuRvhcHNNI968Ar.oVyKGxmEFAYi/uQeXhhA7rRq.CSmsn6', '+1 555 987 6543', '221B Baker Street, New York, NY 10001', 'customer', 1);

-- Categories
INSERT INTO `categories` (`id`, `name`, `description`, `status`) VALUES
(1, 'Electronics', 'Smartphones, Laptops, Audio Gear, Smart Watches & Tech Accessories', 1),
(2, 'Clothing', 'Men and Women Trendy Fashion Apparel, Outerwear and Activewear', 1),
(3, 'Shoes', 'Athletic Running Sneakers, Formal Leather Shoes, and Casual Boots', 1),
(4, 'Home & Kitchen', 'Smart Cookware, Kitchen Appliances, Decor and Organizer Essentials', 1),
(5, 'Books', 'Bestselling Novels, Tech & Programming Guides, and Self-Help Literature', 1),
(6, 'Accessories', 'Luxury Watches, Bags, Leather Wallets, Sunglasses and Belts', 1);

-- Products (16 detailed realistic products)
INSERT INTO `products` (`id`, `category_id`, `name`, `description`, `specifications`, `price`, `discount`, `stock`, `image`, `status`) VALUES
(1, 1, 'Pro Wireless ANC Headphones', 'Premium high-fidelity audio with active noise cancellation, 40-hour battery life, and ultra-plush memory foam cushions.', 'Driver: 40mm Neodymium | Connectivity: Bluetooth 5.3 + 3.5mm Aux | Battery: 40h ANC on | Weight: 250g | Fast Charging: USB-C 10m for 5h', 199.99, 15.00, 28, '/uploads/products/headphones.svg', 1),
(2, 1, 'UltraBook Pro 15.6" Laptop', 'Powerhouse performance equipped with the latest Intel Core i7, 16GB high-speed RAM, and a radiant 4K OLED display.', 'Processor: Intel Core i7-13700H | RAM: 16GB LPDDR5 | Storage: 1TB NVMe SSD | Screen: 15.6" 4K OLED HDR500 | OS: Windows 11 Pro', 1299.00, 10.00, 14, '/uploads/products/laptop.svg', 1),
(3, 1, 'Smart Fitness Watch Series 9', 'Track workouts, blood oxygen, sleep quality, and heart rate with always-on AMOLED touchscreen display and 5 ATM water resistance.', 'Display: 1.43" AMOLED | Water Resistance: 5 ATM (50m) | Sensors: SpO2, Optical PPG, ECG | Battery: Up to 10 days | GPS: Dual-Band GNSS', 249.50, 20.00, 42, '/uploads/products/smartwatch.svg', 1),
(4, 1, 'Mechanical Gaming Keyboard RGB', 'Custom hot-swappable linear switches, aircraft-grade aluminum chassis, per-key RGB backlighting and braided cable.', 'Switches: Custom Red Linear | Keycaps: Double-shot PBT | Connection: USB-C Detachable | Polling Rate: 1000Hz | Layout: Tenkeyless (TKL)', 89.99, 0.00, 35, '/uploads/products/keyboard.svg', 1),
(5, 2, 'Classic Premium Oxford Shirt', 'Handcrafted from 100% long-staple organic cotton. Breathable, wrinkle-resistant and tailored for a modern slim silhouette.', 'Material: 100% Organic Pima Cotton | Fit: Slim / Modern | Collar: Button-down | Care: Machine wash cold | Sizes: S, M, L, XL, XXL', 49.99, 5.00, 50, '/uploads/products/shirt.svg', 1),
(6, 2, 'All-Weather Waterproof Shell Jacket', 'Engineered triple-layer breathable membrane with sealed seams, storm hood, and adjustable cuffs for cold outdoor expeditions.', 'Fabric: 3-Layer GORE Membrane | Waterproof Rating: 20,000mm | Pockets: 4 Waterproof Zippered | Ventilation: Underarm Pit Zips', 129.00, 15.00, 19, '/uploads/products/jacket.svg', 1),
(7, 2, 'Organic Cotton Slim Denim Jeans', 'Authentic selvedge stretch denim crafted for all-day comfort and long-lasting durability.', 'Composition: 98% Cotton, 2% Elastane | Cut: Slim Tapered | Fly: YKK Metal Zipper | Wash: Medium Indigo Vintage Wash', 69.95, 10.00, 30, '/uploads/products/jeans.svg', 1),
(8, 3, 'Air Velocity Running Shoes', 'Engineered mesh upper with responsive carbon-infused foam midsole providing maximum energy return and breathability.', 'Cushioning: NitroFoam Carbon | Drop: 8mm | Weight: 220g (Size 9) | Outsole: High-grip Continental Rubber | Use: Road Marathon / 10K', 139.99, 12.00, 25, '/uploads/products/shoes.svg', 1),
(9, 3, 'Handcrafted Italian Leather Derby', 'Full-grain calfskin leather handcrafted in Italy with Goodyear welted construction for corporate and formal occasions.', 'Upper: Full-Grain Italian Calfskin | Sole: Goodyear Welted Leather | Lining: Soft Cowhide Leather | Color: Dark Cognac Brown', 189.00, 0.00, 12, '/uploads/products/dress-shoes.svg', 1),
(10, 4, 'Barista Touch Espresso Machine', 'Commercial-grade 15-bar Italian pressure pump with integrated conical burr grinder and digital PID temperature stabilization.', 'Pump: 15-Bar Ulka Italian Pump | Bean Hopper: 250g | Water Tank: 2.0L Removable | Steam Wand: Commercial Microfoam Wand | Power: 1600W', 499.00, 10.00, 8, '/uploads/products/espresso.svg', 1),
(11, 4, 'Cast Iron Dutch Oven 6-Quart', 'Heavy-duty enameled cast iron offers uniform heat retention and distribution, safe for gas, induction and ovens up to 500°F.', 'Capacity: 6.0 Quarts | Material: Enameled Cast Iron | Heat Limit: 500°F (260°C) | Finish: Scratch-Resistant Gloss Enamel Red', 84.50, 0.00, 22, '/uploads/products/dutch-oven.svg', 1),
(12, 5, 'Clean Code Architecture & Design Guide', 'Master professional software engineering principles, design patterns, testing strategies, and modular architectural clean practices.', 'Author: Robert C. & Tech Experts | Pages: 464 | Publisher: Tech Media Press | Language: English | Edition: 2nd Updated Edition', 39.99, 5.00, 60, '/uploads/products/book.svg', 1),
(13, 5, 'Full-Stack Modern Web Engineering', 'Comprehensive guide from foundational database architecture to advanced modern cloud deployments and security.', 'Author: Deep Engineering Group | Pages: 520 | Publisher: Software Dev Press | Language: English | Binding: Hardcover', 45.00, 10.00, 40, '/uploads/products/web-book.svg', 1),
(14, 6, 'Automatic Minimalist Sapphire Watch', 'Precision automatic movement with date indicator, anti-reflective sapphire crystal glass, and Italian genuine leather band.', 'Movement: 24-Jewel Japanese Automatic | Glass: Scratch-Proof Sapphire Crystal | Case: 316L Stainless Steel 40mm | Band: 20mm Calfskin', 219.00, 15.00, 15, '/uploads/products/luxury-watch.svg', 1),
(15, 6, 'Full-Grain Leather Commuter Backpack', 'Spacious dual-compartment briefcase backpack with dedicated padded 16-inch laptop sleeve and ergonomic cushioned shoulder straps.', 'Material: Full-grain Waxed Cowhide | Fits: Up to 16" Laptop | Capacity: 22L | Hardware: Antiqued Brass Fasteners | Color: Saddle Tan', 159.00, 10.00, 18, '/uploads/products/backpack.svg', 1),
(16, 6, 'Polarized Aviator Sunglasses UV400', 'Titanium lightweight frame with scratch-resistant polarized lenses that eliminate glare and offer 100% UVA/UVB protection.', 'Frame: Grade 5 Titanium | Lens: Tri-Acetate Cellulose (TAC) Polarized | UV Protection: UV400 | Bridge: Adjustable Silicone Pads', 79.00, 0.00, 4, '/uploads/products/sunglasses.svg', 1);

-- Reviews (Real verified reviews)
INSERT INTO `reviews` (`id`, `user_id`, `product_id`, `rating`, `review`, `status`) VALUES
(1, 2, 1, 5, 'Outstanding sound quality and the noise cancelling is magical during long flights! Very comfortable.', 1),
(2, 3, 1, 4, 'Great battery life and clear highs. Cushions are very soft, though slightly warm after 4 hours.', 1),
(3, 2, 2, 5, 'Extremely fast laptop. Handles development, containers, and rendering without breaking a sweat.', 1),
(4, 3, 3, 5, 'Battery lasts over a week. The screen is bright outdoors and GPS tracking is very accurate.', 1),
(5, 2, 8, 4, 'Very springy cushioning and great propulsion for running. True to size.', 1),
(6, 3, 10, 5, 'Cafe quality espresso right at home! The steam wand produces silky smooth microfoam.', 1);

-- Sample historical order for Customer John Doe (user_id = 2)
INSERT INTO `orders` (`id`, `user_id`, `total_amount`, `shipping_address`, `payment_method`, `payment_status`, `order_status`, `created_at`) VALUES
(1001, 2, 369.98, '742 Evergreen Terrace, Springfield, OR 97477', 'Online Payment', 'paid', 'delivered', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1002, 2, 116.10, '742 Evergreen Terrace, Springfield, OR 97477', 'Cash on Delivery', 'pending', 'confirmed', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- Order Items
-- Order 1001: Headphones (final price: 199.99 - 15.00 = 169.99) + Watch (249.50 - 49.90 = 199.60)? Here price at purchase time:
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(1, 1001, 1, 1, 169.99),
(2, 1001, 3, 1, 199.60),
(3, 1002, 6, 1, 109.65);

-- Payment for 1001
INSERT INTO `payments` (`id`, `order_id`, `payment_method`, `transaction_id`, `amount`, `status`, `gateway_response`, `created_at`) VALUES
(1, 1001, 'Online Payment', 'TXN_SIM_2026100101', 369.98, 'paid', '{"status":"SUCCESS","auth_code":"AUTH_88291","gateway":"SimulatedGateway"}', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Invoice for 1001
INSERT INTO `invoices` (`id`, `order_id`, `invoice_number`, `invoice_date`, `file_path`, `created_at`) VALUES
(1, 1001, 'INV-2026-1001', DATE_SUB(NOW(), INTERVAL 5 DAY), '/uploads/invoices/INV-2026-1001.pdf', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Initial Cart for user 3 (Jane)
INSERT INTO `cart` (`id`, `user_id`, `product_id`, `quantity`) VALUES
(1, 3, 4, 1),
(2, 3, 5, 2);

-- Wishlist for user 2 (John)
INSERT INTO `wishlist` (`id`, `user_id`, `product_id`) VALUES
(1, 2, 10),
(2, 2, 14);

-- Notification log
INSERT INTO `notification_logs` (`id`, `user_id`, `order_id`, `type`, `recipient`, `status`, `error_message`, `created_at`) VALUES
(1, 2, 1001, 'order_confirmation', 'john.doe@example.com', 'sent', NULL, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 2, 1001, 'payment_confirmation', 'john.doe@example.com', 'sent', NULL, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 2, 1001, 'order_delivered', 'john.doe@example.com', 'sent', NULL, DATE_SUB(NOW(), INTERVAL 2 DAY));
