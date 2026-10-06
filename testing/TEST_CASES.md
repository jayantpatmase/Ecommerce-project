# Test Cases: E-Commerce System

| Test ID | Module | Test Scenario | Input Data | Expected Result | Status |
|---|---|---|---|---|---|
| **TC-AUTH-01** | Auth | Customer Registration with valid data | Name: "Alice", Email: "alice@test.com", Password: "Password@123" | 201 Created, user logged in, welcome email queued | **PASS** |
| **TC-AUTH-02** | Auth | Registration with duplicate email | Email: "admin@eshop.com" | 409 Conflict, user-friendly error message | **PASS** |
| **TC-AUTH-03** | Auth | Password under 8 characters | Password: "123" | 422 Unprocessable Entity, minimum 8 characters error | **PASS** |
| **TC-AUTH-04** | Auth | Login with valid credentials | "admin@eshop.com" / "Admin@123" | 200 OK, Session regenerated, role 'admin' stored | **PASS** |
| **TC-AUTH-05** | Auth | Login with incorrect password | "admin@eshop.com" / "WrongPass" | 401 Unauthorized, generic credential error | **PASS** |
| **TC-AUTH-06** | Auth | Unauthenticated access to protected API | GET `/api/orders/list.php` without session | 401 Unauthorized | **PASS** |
| **TC-AUTH-07** | Auth | Customer accessing admin API | Role 'customer' accessing `/api/admin/dashboard.php` | 403 Forbidden | **PASS** |
| **TC-PROD-01** | Products | Filter products by Category | category_id = 1 (Electronics) | Returns only Electronics products | **PASS** |
| **TC-PROD-02** | Products | Server-side text search | search = "Headphones" | Prepared statement matches name and description | **PASS** |
| **TC-PROD-03** | Products | Whitelist sorting | sort = "price_low" | Products ordered by computed final price ascending | **PASS** |
| **TC-PROD-04** | Products | Invalid SQL Injection in sort param | sort = "id; DROP TABLE users;" | Whitelist rejects and falls back to default sorting | **PASS** |
| **TC-CART-01** | Cart | Add product to cart within stock limits | product_id = 1, quantity = 2 | Cart item created with correct subtotal | **PASS** |
| **TC-CART-02** | Cart | Add product exceeding stock | quantity = 9999 | 400 Bad Request: "Exceeds available stock" | **PASS** |
| **TC-CART-03** | Cart | Server price calculation | React sends price = $0.01 | Backend ignores React price, uses database final price | **PASS** |
| **TC-WISH-01** | Wishlist | Add product to wishlist | user_id = 2, product_id = 1 | Item saved to user's wishlist | **PASS** |
| **TC-WISH-02** | Wishlist | Duplicate wishlist entry | Re-adding product_id = 1 | Unique constraint / backend prevents duplicate | **PASS** |
| **TC-WISH-03** | Wishlist | Move wishlist item to cart | product_id = 1 | Product added to cart and deleted from wishlist | **PASS** |
| **TC-ORD-01** | Orders | Place transactional order (COD) | Shipping address + COD payment | 201 Created, stock deducted, cart emptied | **PASS** |
| **TC-ORD-02** | Orders | Order cancellation by customer | Pending order cancellation | Status set to 'cancelled', stock atomically restored | **PASS** |
| **TC-ORD-03** | Orders | Prevent double cancellation | Re-attempting cancellation | 400 Bad Request: Order already cancelled; no double restock | **PASS** |
| **TC-ORD-04** | Orders | Customer access isolation | User 2 accessing User 3's order | 403 Forbidden | **PASS** |
| **TC-PAY-01** | Payments | Online payment initiation | order_id = 1001 | Payment intent and transaction ID generated | **PASS** |
| **TC-PAY-02** | Payments | Server payment verification | Valid transaction_id & amount | Payment verified, order confirmed, invoice generated | **PASS** |
| **TC-PAY-03** | Payments | Amount mismatch tampering | Client modifies amount | Server detects mismatch with order total, declines | **PASS** |
| **TC-PAY-04** | Payments | Simulated payment decline & retry | simulate_failure = true | Payment status marked 'failed', order stays unpaid | **PASS** |
| **TC-REV-01** | Reviews | Submit 1-5 star review | rating = 5, review text | 201 Created, review published | **PASS** |
| **TC-REV-02** | Reviews | Duplicate customer review on same product | Second review by same customer | 409 Conflict: One review allowed per user per product | **PASS** |
| **TC-REV-03** | Reviews | Out-of-bounds rating | rating = 7 or rating = 0 | 422 Unprocessable Entity / Check constraint violation | **PASS** |
| **TC-REV-04** | Reviews | Edit/Delete authorization | User 2 attempts to delete User 3 review | 403 Forbidden | **PASS** |
| **TC-ADM-01** | Admin | Dashboard KPI summary | GET `/api/admin/dashboard.php` | Real-time counts, sales, and low-stock alerts returned | **PASS** |
| **TC-ADM-02** | Admin | Product Soft Deletion | DELETE `/api/admin/products/delete.php` | Status updated to 0, historical order references intact | **PASS** |
| **TC-ADM-03** | Admin | Inventory stock update | Update stock to 25 | Stock updated, status badge adjusts dynamically | **PASS** |
| **TC-ADM-04** | Admin | Prevent negative stock in inventory | Stock = -5 | 422 Unprocessable Entity: Non-negative stock required | **PASS** |
| **TC-INV-01** | Invoices | Customer accesses own invoice | Valid customer session | Printable HTML invoice returned with order breakdown | **PASS** |
| **TC-INV-02** | Invoices | Customer accesses other's invoice | Customer accesses unauthorized order | 403 Forbidden | **PASS** |
