# REST API Reference Documentation

**Base API URL:** `http://localhost/ecommerce/backend/api`  
**Data Format:** `application/json`  
**Authentication Scheme:** Cookie-based Session (`PHPSESSID`) with `credentials: 'include'`

---

## 1. Authentication & Profile APIs

### 1.1 Register User
- **Endpoint:** `POST /auth/register.php`
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1 555 123 4567",
    "address": "123 Main St",
    "password": "Password@123",
    "confirm_password": "Password@123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Account registered successfully!",
    "data": { "user": { "id": 4, "name": "Jane Doe", "email": "jane@example.com", "role": "customer" } }
  }
  ```

### 1.2 User Login
- **Endpoint:** `POST /auth/login.php`
- **Request Body:**
  ```json
  { "email": "admin@eshop.com", "password": "Admin@123" }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged in successfully!",
    "data": { "user": { "id": 1, "name": "Administrator", "email": "admin@eshop.com", "role": "admin" } }
  }
  ```

### 1.3 User Logout
- **Endpoint:** `POST /auth/logout.php`
- **Response (200 OK):**
  ```json
  { "success": true, "message": "Logged out successfully!", "data": [] }
  ```

### 1.4 Get Current Session User
- **Endpoint:** `GET /auth/profile.php`
- **Requires Auth:** Yes

---

## 2. Product Catalog APIs

### 2.1 List Products
- **Endpoint:** `GET /products/list.php`
- **Query Parameters:**
  - `search` (string): Text query matching name/description
  - `category` (int): Category ID
  - `min_price` (float): Minimum final price
  - `max_price` (float): Maximum final price
  - `availability` (string): `'in_stock'`
  - `rating` (int): Minimum stars (1 to 5)
  - `discount` (int): Minimum discount percentage
  - `sort` (string): Whitelist (`price_low`, `price_high`, `name_az`, `name_za`, `newest`, `discount`, `rating`)
  - `page` (int, default: 1), `limit` (int, default: 12)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Products loaded successfully.",
    "data": {
      "products": [{ "id": 1, "name": "Pro Wireless ANC Headphones", "final_price": 169.99, "stock": 28, "avg_rating": 4.5 }],
      "pagination": { "page": 1, "limit": 12, "total": 16, "total_pages": 2 }
    }
  }
  ```

### 2.2 Get Single Product
- **Endpoint:** `GET /products/get.php?id={id}`
- **Response (200 OK):** Full product details with array of customer reviews.

### 2.3 Related Products
- **Endpoint:** `GET /products/related.php?product_id={id}`
- **Response (200 OK):** Returns up to 4 related products in same category.

---

## 3. Shopping Cart & Wishlist APIs

### 3.1 Get Cart
- **Endpoint:** `GET /cart/list.php`
- **Requires Auth:** Yes
- **Response (200 OK):** Returns items list, subtotal, discount, shipping, and grand total.

### 3.2 Add to Cart
- **Endpoint:** `POST /cart/add.php`
- **Requires Auth:** Yes
- **Body:** `{ "product_id": 1, "quantity": 1 }`

### 3.3 Update Cart Quantity
- **Endpoint:** `POST /cart/update.php`
- **Requires Auth:** Yes
- **Body:** `{ "cart_id": 5, "quantity": 3 }`

### 3.4 Remove from Cart
- **Endpoint:** `POST /cart/delete.php`
- **Requires Auth:** Yes
- **Body:** `{ "cart_id": 5 }`

### 3.5 Wishlist APIs
- `GET /wishlist/list.php` — Get saved items
- `POST /wishlist/add.php` — `{ "product_id": 1 }`
- `POST /wishlist/delete.php` — `{ "product_id": 1 }`
- `POST /wishlist/move-to-cart.php` — `{ "product_id": 1 }`

---

## 4. Checkout & Order APIs

### 4.1 Create Order (Checkout)
- **Endpoint:** `POST /orders/create.php`
- **Requires Auth:** Yes
- **Body:**
  ```json
  {
    "shipping_address": "742 Evergreen Terrace, Springfield, OR 97477",
    "payment_method": "Cash on Delivery"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Order placed successfully!",
    "data": { "order_id": 1005, "total_amount": 169.99, "payment_method": "Cash on Delivery", "order_status": "confirmed" }
  }
  ```

### 4.2 List Orders
- **Endpoint:** `GET /orders/list.php`
- **Requires Auth:** Yes

### 4.3 Get Single Order
- **Endpoint:** `GET /orders/get.php?id={id}`
- **Requires Auth:** Yes (Strict customer ownership enforced)

### 4.4 Cancel Order
- **Endpoint:** `POST /orders/cancel.php`
- **Requires Auth:** Yes (Only pending orders; atomically restocks products)
- **Body:** `{ "order_id": 1005 }`

---

## 5. Payments & Invoices

### 5.1 Create Payment Intent
- **Endpoint:** `POST /payments/create.php`
- **Body:** `{ "order_id": 1005 }`

### 5.2 Server Payment Verification
- **Endpoint:** `POST /payments/verify.php`
- **Body:** `{ "order_id": 1005, "transaction_id": "TXN_..." }`

### 5.3 Retrieve / Generate Invoice
- **Endpoint:** `GET /invoices/get.php?order_id={id}`
- **Requires Auth:** Yes (Order owner or Admin only)

---

## 6. Administrator Endpoints

All admin endpoints require `role === 'admin'` via `backend/middleware/admin.php`.

- `GET /admin/dashboard.php` — Summary KPI counts, sales volume, recent orders, and low-stock alerts.
- `GET /admin/products/list.php` — Full product list including inactive status.
- `POST /admin/products/create.php` — Create product (accepts `multipart/form-data` image upload).
- `POST /admin/products/update.php` — Update product.
- `POST /admin/products/delete.php` — Soft delete product (`status = 0`).
- `GET /admin/categories/list.php` — All categories with product counts.
- `POST /admin/categories/create.php` — Add category.
- `POST /admin/categories/update.php` — Edit category / toggle status.
- `GET /admin/customers/list.php` — Customer directory with order metrics (passwords hidden).
- `GET /admin/orders/list.php` — Search and filter orders.
- `GET /admin/orders/get.php?id={id}` — Complete order inspection.
- `POST /admin/orders/update-status.php` — Update fulfillment & payment status with workflow rules.
- `GET /admin/inventory/list.php` — Warehouse stock overview with status badges.
- `POST /admin/inventory/update.php` — Update product stock level (non-negative constraint).
