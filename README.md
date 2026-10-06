# E-Commerce Website — Online Shopping Management System

[![React](https://img.shields.io/badge/Frontend-React%2018-blue.svg)](https://react.dev/)
[![Bootstrap](https://img.shields.io/badge/UI-Bootstrap%205-purple.svg)](https://getbootstrap.com/)
[![PHP](https://img.shields.io/badge/Backend-PHP%208.2%20REST-777BB4.svg)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%20%2F%20PDO-4479A1.svg)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A production-structured, full-stack E-Commerce Web Application built from scratch using **React.js 18**, **Bootstrap 5**, **PHP REST APIs**, **PDO**, and **MySQL**. The system features a public customer storefront and a protected administrator dashboard, backed by transactional database operations, stock management, and server-side payment verification.

---

## 🌟 Key Features

### 🛍️ Customer Storefront
- **Dynamic Homepage:** Hero banner, interactive department cards, top-rated products, time-limited discounts, new arrivals, and customer trust guarantees.
- **Product Discovery:** Server-side search, multi-faceted filtering (category, price range, stock availability, star ratings, minimum discounts), whitelist sorting, and pagination.
- **Product Details:** High-resolution product images, technical specifications table, verified customer ratings breakdown, and related product recommendations.
- **Shopping Cart & Wishlist:** Real-time quantity adjustments, free shipping calculation threshold, persistent wishlist with one-click migration to cart.
- **Checkout & Transactional Orders:** Strict ACID transactions with row-locking (`SELECT ... FOR UPDATE`), atomic inventory reduction, and automatic cart clearance.
- **Payment Options:** Support for Cash on Delivery (COD) and simulated online gateway payment with server-side transaction verification and decline simulation for retry testing.
- **Order Management:** Customer order history, live order fulfillment status badges, atomic order cancellation with inventory replenishment.
- **Invoices:** Official printable tax invoice generation with order breakdown.
- **Customer Reviews:** 1–5 star ratings, review submission, edit/delete controls restricted strictly to the review author.
- **Customer Profile:** Manage shipping address, phone number, and secure password changes.

### 🛡️ Administrator Management Console
- **Analytics Dashboard:** Real-time KPI summary (Total Sales Revenue, Total Orders, Pending Orders, Delivered Orders, Catalog Products, Active Customers, Low-Stock items), recent order logs, and inventory alerts.
- **Product Management:** Full CRUD with multipart image uploads (format and MIME validation), pricing, discounts, stock quantities, and soft-delete protection.
- **Category Management:** Department creation, description editing, and category activation/deactivation.
- **Customer Directory:** View customer accounts, total orders, and lifetime spend (passwords never exposed).
- **Order Fulfillment:** Step-by-step order lifecycle transitions (`Pending` ➔ `Confirmed` ➔ `Packed` ➔ `Shipped` ➔ `Delivered`), order cancellation with automated restock, and payment refund processing.
- **Inventory Control:** Warehouse stock monitoring with status badges (`Out of Stock`, `Low Stock`, `In Stock`) and non-negative stock validation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, React Router v6, Bootstrap 5, Bootstrap Icons, jQuery, CSS3, HTML5 |
| **Build Tool** | Vite 5 |
| **Backend** | PHP 8.2 (REST-style API architecture), PHP Sessions, Exception Handling |
| **Database** | MySQL 8.0 / MariaDB 10.4 via PDO (Prepared Statements, Transactions) |
| **Web Server** | Apache 2.4 (via XAMPP) |
| **Testing** | Automated PHP Test Suite (`testing/run_tests.php`) |

---

## 📐 Architecture Overview

```
                      USER / CLIENT BROWSER
                                │
                                ▼
                       React.js 18 Frontend
               HTML5 + CSS3 + Bootstrap 5 + JS + jQuery
                                │
                         HTTP / JSON APIs
                 with credentials: 'include' (Cookies)
                                │
                                ▼
                         PHP REST API Tier
                Authentication, Validation, Business Logic,
                Middleware (auth.php, admin.php)
                                │
                                ▼
                         PDO Database Layer
                 Parametrized Queries, utf8mb4,
                 ACID Transactions (FOR UPDATE)
                                │
                                ▼
                       MySQL Database Engine
                  users, categories, products, cart,
               orders, payments, reviews, invoices
```

---

## 📂 Project Structure

```
ecommerce/
│
├── frontend/                     # React.js Single Page Application
│   ├── public/                   # Static assets & favicons
│   ├── src/
│   │   ├── assets/css/style.css  # Global responsive styling
│   │   ├── components/           # Navbar, Footer, ProductCard, Reviews, Filters...
│   │   ├── pages/                # Home, Products, Cart, Checkout, Orders, Profile...
│   │   ├── admin/                # AdminDashboard, AdminProducts, AdminOrders...
│   │   ├── context/              # AuthContext.jsx (session source-of-truth)
│   │   ├── services/             # api.js (Centralized HTTP client)
│   │   ├── App.jsx               # Route definitions & guards
│   │   └── main.jsx              # React mounting & Bootstrap/jQuery loader
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # PHP REST API Backend
│   ├── config/
│   │   ├── database.php          # Singleton PDO connection & CORS headers
│   │   ├── response.php          # Standard JSON response wrappers
│   │   └── validation.php        # Reusable validator & sanitizer
│   ├── middleware/
│   │   ├── auth.php              # Customer authentication check (401)
│   │   └── admin.php             # Administrator role authorization (403)
│   ├── api/
│   │   ├── auth/                 # register, login, logout, profile
│   │   ├── products/             # list, get, related
│   │   ├── categories/           # list
│   │   ├── cart/                 # list, add, update, delete
│   │   ├── wishlist/             # list, add, delete, move-to-cart
│   │   ├── orders/               # create, list, get, cancel
│   │   ├── reviews/              # list, add, update, delete
│   │   ├── payments/             # create, verify, status, refund
│   │   ├── invoices/             # generate, get
│   │   ├── user/                 # profile, update-profile, change-password
│   │   └── admin/                # dashboard, products, categories, orders, inventory
│   ├── services/
│   │   ├── email.php             # Email notification delivery architecture
│   │   └── notifications.php     # Notification logging service
│   └── uploads/                  # Product photography & HTML invoices
│
├── database/
│   └── ecommerce.sql             # Complete schema, foreign keys & sample data
│
├── testing/
│   ├── run_tests.php             # Automated backend & database test suite
│   ├── TEST_PLAN.md
│   ├── TEST_CASES.md
│   ├── BUGS.md
│   └── TEST_REPORT.md
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   └── API_DOCUMENTATION.md
│
├── project-report/
│   └── PROJECT_REPORT.md         # Full Academic Project Report (12 chapters)
│
├── README.md
├── LICENSE
├── .env.example
└── .gitignore
```

---

## 🚀 Setup & Installation Instructions

### 1. Prerequisites
- [XAMPP](https://www.apachefriends.org/) (Apache & MySQL)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)

### 2. Database Setup
1. Start **Apache** and **MySQL** in the XAMPP Control Panel.
2. Open phpMyAdmin (`http://localhost/phpmyadmin`) or MySQL CLI.
3. Import the SQL file:
   ```powershell
   mysql -u root -e "source C:/Users/jayan/Downloads/ecommerce/database/ecommerce.sql"
   ```
   *(This creates `ecommerce_db` and seeds categories, 16 realistic products, test accounts, and sample orders).*

### 3. Backend Setup
1. Link or place the `ecommerce` folder inside XAMPP's `htdocs`:
   ```powershell
   cmd /c mklink /J "C:\xampp\htdocs\ecommerce" "C:\Users\jayan\Downloads\ecommerce"
   ```
2. Verify backend availability by navigating to:
   `http://localhost/ecommerce/backend/api/categories/list.php`
   *(Should return JSON `{ "success": true, ... }`)*.

### 4. Frontend Setup
1. Open PowerShell and navigate to the frontend directory:
   ```powershell
   cd C:\Users\jayan\Downloads\ecommerce\frontend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the development server:
   ```powershell
   npm run dev
   ```
4. Access the web application at:
   `http://localhost:5173`

---

## 🔑 Test Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@eshop.com` | `Admin@123` | Full Admin Console (`/admin`) + Customer Store |
| **Customer 1** | `john.doe@example.com` | `Customer@123` | Storefront, Cart, Wishlist, Order History |
| **Customer 2** | `jane.smith@example.com` | `Customer@123` | Storefront, Cart, Wishlist, Order History |

*(The login page includes convenient 1-click **Quick Fill** buttons for rapid demonstration during presentations).*

---

## 🧪 Automated Testing

An automated integration test runner is included to verify database schema constraints, bcrypt hashes, row-level locking, atomic stock reduction, duplicate rejection, and order cancellations:

```powershell
php C:\Users\jayan\Downloads\ecommerce\testing\run_tests.php
```

**Expected Result:** `TEST SUMMARY: 10 PASSED, 0 FAILED`.

---

## 🔒 Security Implementations
- **Strict Password Hashing:** Using `password_hash()` and `password_verify()` with bcrypt algorithm.
- **Session Protection:** Session ID regeneration upon login (`session_regenerate_id(true)`) to prevent fixation.
- **SQL Injection Prevention:** 100% parametrized queries via PDO prepared statements; sorting whitelists.
- **XSS Mitigation:** HTML entity sanitation on backend and native string escaping in React virtual DOM.
- **Authorization Enforcement:** Customer ownership validation prevents users from accessing or modifying orders, carts, and invoices of other users.
- **File Upload Safeguards:** Validation of file extensions, MIME types, and file size limits (5MB) with randomized filenames.

---

## 📄 License
This project is open-source and distributed under the [MIT License](LICENSE).
