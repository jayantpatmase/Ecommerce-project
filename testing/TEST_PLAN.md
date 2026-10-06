# Test Plan: E-Commerce Online Shopping Management System

## 1. Introduction & Objectives
This Test Plan describes the testing strategy, testing scope, tools, test environment, and acceptance criteria for the full-stack **E-Commerce Website – Online Shopping Management System** built with React.js, PHP REST APIs, PDO, and MySQL.

The primary objective is to verify that the application satisfies all functional and non-functional requirements, guarantees database transactional integrity, enforces strict authentication and authorization boundaries, and provides an intuitive, responsive user experience.

---

## 2. Test Environment
- **Operating System:** Microsoft Windows 11
- **Web Server:** Apache 2.4 (via XAMPP)
- **Database:** MySQL 10.4 / MariaDB (Port 3306)
- **Backend Runtime:** PHP 8.2 (CLI & Apache SAPI) with PDO Extension
- **Frontend Runtime:** Node.js v20.18 LTS / Vite Development Server (Port 5173)
- **Browsers Tested:** Google Chrome, Microsoft Edge, Mozilla Firefox

---

## 3. Scope of Testing

### 3.1 In-Scope Modules
1. **Authentication & Authorization:** User registration, email uniqueness, bcrypt password verification, session fixation prevention, role-based middleware (`auth.php`, `admin.php`).
2. **Product Catalog & Discovery:** Server-side search, multi-faceted filtering (category, price range, stock availability, ratings, discount), whitelist sorting, and pagination.
3. **Shopping Cart & Wishlist:** Item additions, quantity boundary verification against inventory, server recalculation of order totals, item removals, and wishlist migration.
4. **Checkout & Transactional Order Processing:** Strict ACID transactions with row-locking (`FOR UPDATE`), atomic stock decrementing, cart clearance, and email confirmations.
5. **Order Cancellation & Restock Integrity:** Restocking products on order cancellation and preventing double-restoration.
6. **Payment Gateway Integration:** Payment intent initiation, server-side signature and amount verification, failure simulation, and retry flow.
7. **Reviews & Ratings:** 1-5 star verification, one-review-per-customer enforcement, author ownership validation for edits and deletions.
8. **Invoicing & Notifications:** HTML invoice generation, role-authorized invoice retrieval, and notification logging.
9. **Administrator Dashboard & Controls:** Real-time metrics, product CRUD (with soft deletion), category management, customer visibility (passwords hidden), order status workflows, and inventory restocking.
10. **Security & Vulnerability Defense:** SQL injection defense via PDO prepared statements, XSS defense, ownership validation across customer records, and file upload validation.

---

## 4. Test Strategy & Levels
- **Unit & Integration Testing:** Automated PHP test runner (`testing/run_tests.php`) executing database constraints, business calculations, and transactional operations.
- **API Endpoint Testing:** REST API calls with simulated inputs testing status codes (200, 201, 400, 401, 403, 404, 409, 422, 500).
- **End-to-End System Testing:** Complete user journey from landing page, browsing, wishlist, cart, checkout, payment verification, order tracking, and invoice download.
- **Cross-Browser & Responsiveness:** Desktop (1366x768), Tablet (768x1024), and Mobile (375x667).

---

## 5. Pass/Fail Criteria
- **Pass:** All required business rules enforced; no SQL or path exposure in API responses; transactions roll back on failure; zero broken links or unhandled exceptions.
- **Fail:** Any unauthorized data modification, negative stock occurrence, double cancellation, or price tampering vulnerability.
