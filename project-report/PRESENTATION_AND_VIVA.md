# PROJECT PRESENTATION & VIVA VOCE EXAMINATION GUIDE
## E-Commerce Website — Online Shopping Management System
**Full-Stack Single Page Application: React.js 18 + PHP 8.2 REST API + PDO + MySQL**

---

## PART 1: PROJECT PRESENTATION SLIDE DECK (12-SLIDE OUTLINE)

### Slide 1: Title & Project Overview
- **Title:** E-Commerce Website – Online Shopping Management System
- **Subtitle:** A Decoupled, Transaction-Safe Full-Stack Platform
- **Presenter:** Full-Stack Software Engineering Team
- **Key Objective:** Deliver an enterprise-grade shopping platform with zero client-side pricing trust, ACID-compliant checkouts, and complete administrative control.

### Slide 2: Problem Statement & Motivation
- **Legacy Bottlenecks:**
  - Monolithic spaghetti PHP tightly coupling HTML generation and database queries.
  - Client-side price calculation vulnerabilities allowing checkout total tampering.
  - Race conditions during flash sales leading to inventory overselling (negative stock).
  - Lack of audit trails for order status progression and notification delivery.
- **The Solution:** A decoupled architecture where React handles client-side rendering while PHP enforces all pricing, authorization, stock locking, and transactions.

### Slide 3: Technology Stack Justification
- **Frontend:** React 18 (fast virtual DOM, component modularity), Bootstrap 5 (responsive grid & accessible components), jQuery (integrated per spec for plugin compatibility), Vite (sub-second HMR & optimized production bundling).
- **Backend:** PHP 8.2 (robust, native session handling, broad hosting support), PDO (strictly parametrized queries, database abstraction, prepared statement caching).
- **Database:** MySQL 8.0 / MariaDB 10.4 (ACID transaction engines, InnoDB row-level locking, foreign key integrity).
- **Security:** Bcrypt hashing, `session_regenerate_id(true)`, HTTP-only cookies, MIME-checked file uploads.

### Slide 4: System Architecture & Data Flow
- **Architecture Diagram:**
  - Client Browser (React SPA) $\leftrightarrow$ JSON over HTTP with Cookie Credentials $\leftrightarrow$ PHP REST Endpoints $\leftrightarrow$ PDO Prepared Statements $\leftrightarrow$ MySQL InnoDB.
- **Key Tenet:** React never talks directly to MySQL. All business logic and financial mathematics reside exclusively on the server.

### Slide 5: Database Schema & Entity Relationships
- **11 Normalized Tables:** `users`, `categories`, `products`, `cart`, `wishlist`, `orders`, `order_items`, `reviews`, `payments`, `invoices`, `notification_logs`.
- **Relational Integrity:**
  - Foreign key cascades on user carts and wishlists.
  - Restrict constraints on categories and ordered products to preserve historical financial records.
  - Unique composite keys preventing duplicate items in carts, wishlists, or duplicate reviews per product.

### Slide 6: Core Customer Features
- Responsive product browsing with instant search, multi-facet filtering (category, price range, availability, ratings, discounts), and whitelist sorting.
- Real-time shopping cart with inventory checks and dynamic shipping fee calculations ($15 flat, free over $150).
- Wishlist with 1-click move-to-cart functionality.
- Customer order history with order tracking, status timeline, and downloadable HTML/PDF invoices.
- Verified customer reviews with 1–5 star ratings and edit/delete permissions.

### Slide 7: Administrator Control Panel
- Real-time KPI dashboard: Total Products, Customers, Orders, Delivered Count, Total Sales Volume, Low-Stock items.
- Product CRUD with multipart image uploads, category assignment, price, and discount management.
- Dynamic inventory monitoring with quick stock adjustments and color-coded stock alerts.
- Order fulfillment lifecycle management: `pending -> confirmed -> packed -> shipped -> delivered` or `cancelled`.
- Customer account monitoring with account activation toggles (passwords never exposed).

### Slide 8: Transactional Checkout Engine (ACID in Action)
1. Customer initiates checkout with shipping address and payment method.
2. `START TRANSACTION` initiated in PDO.
3. User cart rows fetched and products locked using `SELECT ... FOR UPDATE`.
4. Real-time stock validation prevents race conditions.
5. Server recalculates true unit prices ($price - discount$) and subtotal.
6. Order header inserted; line items created in `order_items`.
7. Stock deducted atomically in `products`.
8. User's cart cleared.
9. Initial payment record and invoice generated.
10. `COMMIT` transaction (or `ROLLBACK` on any error).
11. Notification logged and customer email dispatched asynchronously.

### Slide 9: Resilient Order Cancellation & Stock Restoration
- Customers can cancel eligible pending orders directly from their account dashboard.
- Cancellation executes inside an atomic database transaction.
- Product quantities from `order_items` are automatically restored back to `products.stock`.
- Order status marked `cancelled`. Delivered or already-cancelled orders are protected from re-cancellation.

### Slide 10: Security & OWASP Top 10 Mitigation
- **A01: Broken Access Control:** Customer APIs enforce user ID from `$_SESSION`, never from client payload. Admin APIs protected by `requireAdmin()` middleware.
- **A02: Cryptographic Failures:** Passwords hashed with `PASSWORD_BCRYPT`. Sessions regenerated on login.
- **A03: Injection:** 100% PDO prepared statements. Whitelisted column names for `ORDER BY`.
- **A04: Insecure Design:** All pricing, discounts, shipping fees, and taxes calculated exclusively by PHP.
- **A07: Identification and Authentication Failures:** Inactive accounts blocked; session destroyed on logout.

### Slide 11: Testing & Quality Assurance
- Automated PHP integration test suite (`testing/run_tests.php`):
  - 10 automated test suites verifying schema integrity, password hashing, price calculations, non-negative inventory rules, cart operations, wishlist duplicate keys, transaction checkouts, stock restoration, and review constraints.
  - **Result: 10 Passed, 0 Failed (100% Pass Rate).**

### Slide 12: Conclusion & Future Roadmap
- **Accomplishments:** Delivered a fully working, robust full-stack e-commerce system matching every technical and architectural specification.
- **Future Enhancements:**
  - Stripe and PayPal live webhook integrations.
  - Redis caching for high-traffic catalog browsing.
  - React Native mobile application reusing the existing PHP REST APIs.
  - AI-powered personalized recommendation engine.

---

## PART 2: COMPREHENSIVE VIVA VOCE QUESTIONS & EXPERT ANSWERS (50 Q&A)

### Section A: Architecture & Full-Stack Fundamentals

#### Q1: Explain the high-level architecture of this application.
**Answer:** The application follows a modern decoupled Single Page Application (SPA) architecture. The client-side layer is built with React 18, Bootstrap 5, and JavaScript, communicating asynchronously with the backend via HTTP/JSON requests. The backend is an enterprise-patterned PHP 8.2 REST API using PDO for database operations, connected to a MySQL relational database. The client and server are completely separated: React never queries the database directly, and PHP does not render HTML pages (except for printable invoices).

#### Q2: Why is a decoupled React + PHP REST API architecture superior to a monolithic PHP web app?
**Answer:** In traditional monolithic PHP, view generation and database logic are mixed, leading to tight coupling, high server rendering overhead, and difficult maintenance. In a decoupled architecture:
1. React runs in the client browser, offloading UI rendering and state management from the server.
2. The PHP backend acts solely as a stateless business logic and data service layer, returning compact JSON payloads.
3. The same REST APIs can be reused in the future by mobile applications (React Native/Flutter) or third-party integrations without rewriting backend logic.

#### Q3: How do the React frontend and PHP backend communicate securely across different ports during development?
**Answer:** React runs on Vite (`http://localhost:5173`) while PHP is served via Apache on port 80 (`http://localhost`). Communication is secured via:
1. **CORS Headers:** PHP emits `Access-Control-Allow-Origin: http://localhost:5173` and `Access-Control-Allow-Credentials: true`.
2. **Fetch Credentials:** React `fetch` requests include `credentials: 'include'`, allowing the browser to automatically attach PHP session cookies (`PHPSESSID`) to cross-origin API calls.
3. **Pre-flight Handling:** PHP inspects `OPTIONS` requests and immediately returns 200 OK with allowed headers and methods.

#### Q4: Why is jQuery included in the tech stack, and what is its role compared to React?
**Answer:** jQuery is included per the project specification requirements. However, React retains full authority over the application state and virtual DOM rendering. React declarative rendering is strictly preserved to prevent DOM conflicts. jQuery is available for specialized third-party utility integrations without interfering with React's virtual DOM tree.

---

### Section B: Database Design, Schema & Concurrency

#### Q5: How many tables are in the database, and what normal form does the schema follow?
**Answer:** The database consists of 11 tables (`users`, `categories`, `products`, `cart`, `wishlist`, `orders`, `order_items`, `reviews`, `payments`, `invoices`, `notification_logs`). The schema conforms to Third Normal Form (3NF):
- **1NF:** Every column contains atomic values, and each record has a primary key.
- **2NF:** All non-key attributes are fully functionally dependent on the primary key (no partial dependencies).
- **3NF:** No non-key attribute is transitively dependent on the primary key. For example, order line items store product references and the snapshot purchase price rather than duplicating full product descriptions.

#### Q6: Why do we store the price in `order_items` when it is already in the `products` table?
**Answer:** This is a crucial e-commerce design requirement. Product prices in the `products` table fluctuate over time due to sales, discounts, or price increases. If `order_items` only referenced `products.id`, viewing past orders would display the *current* price rather than the *historical price at the moment of purchase*. Storing the purchase price in `order_items` guarantees financial auditing accuracy and contractual immutability.

#### Q7: What are the foreign key constraints used, and why did you choose `CASCADE` vs `RESTRICT`?
**Answer:**
- `CASCADE` is used on transient tables like `cart` and `wishlist` where deleting a user or product should automatically clean up associated cart/wishlist items.
- `RESTRICT` is used on historical and financial records like `orders -> users`, `products -> categories`, and `order_items -> products`. This prevents deleting a product or category that has existing orders, ensuring database integrity and preventing orphaned order records.

#### Q8: Explain how race conditions during checkout are prevented in this system.
**Answer:** If multiple customers attempt to purchase the last available item simultaneously, a race condition could result in overselling (negative stock). We prevent this using MySQL ACID transactions combined with pessimistic row-level locking:
```sql
START TRANSACTION;
SELECT stock FROM products WHERE id = ? FOR UPDATE;
-- Validate stock >= requested quantity
UPDATE products SET stock = stock - ? WHERE id = ?;
COMMIT;
```
`FOR UPDATE` acquires an exclusive lock on the product row. Any concurrent transaction attempting to read or update that row must wait until the current transaction commits or rolls back.

#### Q9: What happens if an error occurs halfway through order creation?
**Answer:** Order creation runs inside a `try ... catch` block wrapping a database transaction. If any validation fails (e.g., insufficient stock, inactive product, or database write failure), PHP invokes `$db->rollBack()`. This reverts all changes made during the transaction (no partial orders, no deducted stock without an order header), leaving the database in a completely consistent state.

#### Q10: How does order cancellation work, and how is stock integrity maintained?
**Answer:** When an order is cancelled:
1. The backend verifies the order is in `pending` status (delivered or already-cancelled orders cannot be cancelled).
2. Inside an atomic transaction, all line items in `order_items` for that order are fetched.
3. For each item, the stock is credited back: `UPDATE products SET stock = stock + quantity WHERE id = ?`.
4. The order status is set to `cancelled`.
5. The transaction commits, ensuring stock is restored exactly once.

---

### Section C: Backend Development, PHP & PDO

#### Q11: What is PDO, and why is it preferred over `mysqli`?
**Answer:** PDO (PHP Data Objects) is a lightweight, consistent interface for accessing databases in PHP. Advantages over `mysqli`:
1. **Database Agnostic:** Works with MySQL, PostgreSQL, SQLite, Oracle, etc., by changing the DSN connection string.
2. **Named & Positional Placeholders:** Supports clean prepared statements.
3. **Advanced Error Modes:** Can be set to `PDO::ERRMODE_EXCEPTION` to cleanly integrate with PHP `try-catch` exception handling.
4. **Prepared Statement Emulation Disabled:** `PDO::ATTR_EMULATE_PREPARES => false` ensures true database-level prepared statements, completely neutralizing SQL injection.

#### Q12: How are passwords stored and authenticated?
**Answer:** Plaintext passwords are never stored. Passwords are hashed using PHP's native `password_hash($password, PASSWORD_BCRYPT)`. During authentication, `password_verify($password, $user['password'])` evaluates the entered plaintext password against the stored bcrypt hash, incorporating salt and cost factor automatically.

#### Q13: How is session fixation prevented during login?
**Answer:** When a user successfully authenticates, PHP immediately calls `session_regenerate_id(true)`. This generates a brand-new cryptographic session ID and deletes the old session file on the server. If an attacker had pre-seeded a session cookie in the user's browser, that pre-seeded ID becomes completely invalid upon login.

#### Q14: Explain the difference between `requireAuth()` and `requireAdmin()`.
**Answer:**
- `requireAuth()` checks if `$_SESSION['user_id']` exists, queries the database to ensure the user exists and is active (`status = 1`), and returns the authenticated user object. If not authenticated, it sends a `401 Unauthorized` response.
- `requireAdmin()` calls `requireAuth()` first, and then verifies that `$user['role'] === 'admin'` and `$_SESSION['role'] === 'admin'`. If the user is a customer, it sends a `403 Forbidden` response.

#### Q15: Why must the backend never trust prices or user IDs sent from the frontend?
**Answer:** In client-side applications, an attacker can open browser developer tools or use Postman/curl to manipulate any request payload. If the server accepted `price: 1.00` or `user_id: 1` from the request body, an attacker could buy a $1,000 laptop for $1, or access and cancel other users' orders. In our implementation, prices are always queried directly from the `products` table, and `user_id` is always extracted from the server-validated `$_SESSION['user_id']`.

---

### Section D: React Frontend & State Management

#### Q16: How is global authentication state managed in React?
**Answer:** Global authentication state is managed via `AuthContext.jsx` using React's Context API and `useContext` hook. On initial load, the context calls `api.getProfile()`. The backend session is the single source of truth. The context exposes `user`, `loading`, `login`, `logout`, and `refreshUser` throughout the entire component tree without prop drilling.

#### Q17: How are protected routes implemented in React?
**Answer:** Protected routes are implemented using wrapper components such as `AdminProtectedRoute.jsx`. It checks the `user` state from `AuthContext`:
- If authentication is still loading, it renders a loading spinner.
- If no user is logged in, it redirects to `/login`.
- If the user is logged in but not an admin (`user.role !== 'admin'`), it redirects to `/` or shows an access-denied view.
- Note: Frontend routing is for user experience only; real security is strictly enforced by PHP middleware on every API call.

#### Q18: What is the purpose of `ErrorBoundary.jsx`?
**Answer:** In React 16+, an uncaught JavaScript error inside a component unmounts the entire React component tree, resulting in a blank white screen. `ErrorBoundary` is a class component implementing `componentDidCatch` and `getDerivedStateFromError`. It catches rendering errors in child components and displays a clean, user-friendly fallback UI with a "Try Again" or "Return Home" button without crashing the entire app.

#### Q19: Explain the purpose of `api.js`.
**Answer:** `api.js` is a centralized API client module encapsulating all HTTP communication. Benefits:
1. Centralized base URL configuration (`API_BASE`).
2. Automatic `credentials: 'include'` on every request to pass session cookies.
3. Unified JSON serialization and header management.
4. Consistent error parsing and standardized error object handling across all components.

---

### Section E: E-Commerce Business Logic & Workflows

#### Q20: Explain the complete shopping cart lifecycle.
**Answer:**
1. A customer clicks "Add to Cart" on a product card or details page.
2. React dispatches `POST /cart/add.php` with `{ product_id, quantity }`.
3. Backend validates product exists, is active, and has sufficient stock.
4. If the item already exists in the user's cart, the quantity is incremented (clamped to available stock); otherwise, a new cart record is inserted.
5. Cart page displays line items, unit prices, discounts, subtotal, shipping fee calculation ($15 flat, or free above $150), and total.
6. Customers can adjust quantities or remove items.

#### Q21: How does the wishlist move-to-cart operation work?
**Answer:** `backend/api/wishlist/move-to-cart.php`:
1. Validates the product exists in the user's wishlist.
2. Checks stock availability in the `products` table.
3. Inserts or increments the item in the user's `cart`.
4. Removes the item from the user's `wishlist`.
5. Returns updated cart count to the frontend.

#### Q22: What are the allowed order status transitions?
**Answer:**
- Standard Fulfillment Flow: `pending -> confirmed -> packed -> shipped -> delivered`.
- Customer Cancellation Flow: `pending -> cancelled` (only pending orders can be cancelled by customers).
- Delivered orders cannot be cancelled.
- Cancelled orders cannot be reopened or edited.

#### Q23: How are product reviews validated and protected?
**Answer:**
- Reviews require customer authentication.
- Rating must be an integer between 1 and 5 (enforced in PHP and by MySQL `CHECK(rating >= 1 AND rating <= 5)`).
- A customer can only write one review per product (enforced by `UNIQUE KEY unique_user_product_review(user_id, product_id)`).
- Customers can only update or delete their own reviews; administrators have moderating privileges.

#### Q24: How does invoice generation work?
**Answer:**
- Invoices are created upon order confirmation.
- Each invoice has a unique formatted identifier (e.g., `INV-2026-01005`).
- The invoice includes store branding, tax ID, order ID, customer information, shipping address, line items with quantities and snapshot purchase prices, subtotals, shipping fees, grand total, and payment status.
- It generates a clean, printable HTML document with print stylesheets and a "Print / Save as PDF" button.

#### Q25: How does the notification architecture handle email delivery failures?
**Answer:** E-commerce best practices dictate that email transport failures must **never** roll back a successful order transaction. In our system, the order transaction commits first. Then `EmailService::send()` is invoked. The attempt is logged in `notification_logs` with recipient, event type, status (`sent` or `failed`), and any error message. Even if the SMTP server is temporarily unreachable, the customer's order remains secure.

---

### Section F: Security & Quality Assurance

#### Q26: What is SQL Injection, and how does this application prevent it?
**Answer:** SQL Injection occurs when malicious SQL fragments are concatenated into database queries. In this project, SQL injection is completely prevented because:
1. 100% of dynamic queries use PDO prepared statements with parameter binding (`?` placeholders).
2. Query structures are pre-compiled by MySQL before parameter values are transmitted, rendering parameters incapable of altering the SQL syntax tree.
3. Whitelists are strictly used for non-bindable SQL tokens like `ORDER BY` column names and sort directions.

#### Q27: What is Cross-Site Scripting (XSS), and how is it mitigated?
**Answer:** XSS occurs when malicious scripts are injected into web pages viewed by other users. Mitigation in this project:
1. React automatically escapes all string expressions rendered in JSX, preventing script execution.
2. Any server-rendered HTML (such as invoices) uses `htmlspecialchars($data, ENT_QUOTES, 'UTF-8')`.
3. Backend input sanitization trims and strips illegal tags before processing.

#### Q28: How does file upload security work for product images?
**Answer:** In `backend/api/admin/products/create.php` and `update.php`:
1. Checks `$_FILES['image']['error'] === UPLOAD_ERR_OK`.
2. Validates file extension against an allowed whitelist: `['jpg', 'jpeg', 'png', 'webp', 'svg']`.
3. Validates MIME type using `finfo_file(FILEINFO_MIME_TYPE)`.
4. Enforces a maximum file size limit (e.g., 2 MB).
5. Sanitizes file names using cryptographic random hashes (`uniqid() . bin2hex(random_bytes(8))`) to prevent directory traversal attacks (`../../evil.php`).

#### Q29: What HTTP status codes are used across the REST APIs?
**Answer:**
- `200 OK`: Request succeeded and returned data.
- `201 Created`: Resource successfully created (e.g., new order, registered user).
- `400 Bad Request`: Malformed request or business logic violation (e.g., cart is empty).
- `401 Unauthorized`: Missing or invalid authentication session.
- `403 Forbidden`: Authenticated user lacks permission (e.g., customer attempting admin API).
- `404 Not Found`: Requested product, order, or category does not exist.
- `409 Conflict`: Resource already exists (e.g., duplicate email registration).
- `422 Unprocessable Entity`: Validation failure (e.g., invalid email format, weak password).
- `500 Internal Server Error`: Unhandled server or database exception.

#### Q30: How did you test the application, and what were the results?
**Answer:** Testing was conducted on two levels:
1. **Automated Integration Testing:** A custom PHP test runner (`testing/run_tests.php`) executed 10 automated test suites verifying database tables, bcrypt verification, pricing calculations, inventory constraints, cart additions, wishlist constraints, transactional checkouts, stock restorations, and notification logging. All 10 passed (100% pass rate).
2. **End-to-End Manual Testing:** Verified the complete customer and administrator workflows across multiple viewports (Desktop 1366px, Tablet 768px, Mobile 375px).

---

### Section G: Advanced Technical & Viva Questions

#### Q31: What is the purpose of the `UNIQUE KEY unique_user_product(user_id, product_id)` in the `cart` table?
**Answer:** It enforces database-level integrity so that a customer cannot have multiple separate rows for the exact same product in their cart. If a customer clicks "Add to Cart" on a product they already have in their cart, the application executes an `ON DUPLICATE KEY UPDATE quantity = quantity + ?` or handles it in PHP logic, maintaining a single row per product.

#### Q32: How is pagination implemented efficiently?
**Answer:** Using `LIMIT` and `OFFSET` in SQL queries:
`OFFSET = (page - 1) * limit`.
Along with the paginated results, the query executes a `SELECT COUNT(*)` to return `total_records`, allowing the React frontend to calculate `total_pages = Math.ceil(total / limit)` and render pagination controls.

#### Q33: What is the difference between client-side validation and server-side validation?
**Answer:** Client-side validation improves user experience by providing immediate feedback (e.g., checking password length or valid email format before form submission). However, client-side validation can easily be bypassed by disabling JavaScript or using curl/Postman. Server-side validation is mandatory for security, guaranteeing that no invalid or malicious data ever reaches the database.

#### Q34: What is the difference between optimistic and pessimistic locking? Why did you choose pessimistic locking for checkout?
**Answer:**
- **Optimistic Locking:** Assumes conflicts are rare. It uses a version column and checks if the version changed before writing. If it changed, the transaction aborts and retries.
- **Pessimistic Locking (`SELECT ... FOR UPDATE`):** Locks the rows immediately upon reading, preventing any concurrent transaction from updating them until the current transaction commits.
- **Choice:** For financial e-commerce checkouts with limited inventory stock, pessimistic locking prevents overselling and avoids repeated aborted retries during peak shopping bursts.

#### Q35: How does the administrative dashboard calculate Total Sales?
**Answer:** The dashboard executes an aggregate query on completed orders:
`SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid' OR order_status IN ('confirmed', 'packed', 'shipped', 'delivered')`. Cancelled orders are excluded from revenue totals to maintain accurate accounting.

---

### Part 3: Quick Reference Cheat Sheet for Examiners

| Concept | Implementation in Project |
|---|---|
| **Frontend Framework** | React.js 18.3 (with Vite 5.2 bundler) |
| **CSS & Design System** | Bootstrap 5.3 + Custom CSS + Bootstrap Icons |
| **Backend Language** | PHP 8.2 with PDO extension |
| **Database Engine** | MySQL 8.0 / MariaDB 10.4 (InnoDB engine) |
| **Authentication** | PHP Sessions + Bcrypt (`password_hash`) + `session_regenerate_id(true)` |
| **Authorization** | Middleware-based Role Enforcement (`customer` vs `admin`) |
| **Transactions** | PDO `beginTransaction()`, `commit()`, `rollBack()` with `FOR UPDATE` |
| **Pricing Calculation** | Server-calculated: $price - (price \times discount / 100)$ |
| **Invoice System** | Automated HTML invoice with printable styling & PDF export |
| **Audit Logs** | Dedicated `notification_logs` table for all system communications |
| **Integration Tests** | 10 Automated Suites (`testing/run_tests.php`) — 100% Pass Rate |
