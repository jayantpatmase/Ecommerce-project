# Bug Tracking & Resolution Report (BUGS.md)

This log documents issues identified during initial development and integration testing, their root causes, and how they were resolved.

---

### Bug #001: CLI Execution Warning for REQUEST_METHOD in Database Connection
- **Severity:** Low (Warning)
- **Component:** `backend/config/database.php`
- **Description:** When running automated integration test scripts from the CLI (`php testing/run_tests.php`), a PHP notice was raised: `PHP Warning: Undefined array key "REQUEST_METHOD" on line 52`.
- **Root Cause:** In Command Line Interface (CLI) execution mode, PHP does not populate HTTP request variables such as `$_SERVER['REQUEST_METHOD']`.
- **Resolution:** Added an `isset($_SERVER['REQUEST_METHOD'])` condition before comparing against `'OPTIONS'`.
- **Verification:** Re-ran `php testing/run_tests.php`. Output executed cleanly with zero warnings.

---

### Bug #002: esbuild Subshell Path Resolution during npm install
- **Severity:** Medium
- **Component:** Frontend build environment on Windows
- **Description:** Initial execution of `npm install` for `esbuild` postinstall script failed when calling `cmd.exe /c node install.js` because `node` was not detected in `cmd.exe` PATH before the user environment refreshed.
- **Root Cause:** Windows user environment variable updates are not inherited by active non-elevated shells without explicit PATH session concatenation.
- **Resolution:** Explicitly prepended `C:\Users\jayan\nodejs` to `$env:PATH` in PowerShell execution contexts.
- **Verification:** `npm install` and `npm run build` executed and compiled all 77 React modules into production distribution chunks in 11.4 seconds.

---

### Bug #003: Double-Restoration Prevention on Order Cancellation
- **Severity:** High (Business Logic Vulnerability)
- **Component:** `backend/api/orders/cancel.php` & `backend/api/admin/orders/update-status.php`
- **Description:** Repeated cancellation requests could potentially restore order stock multiple times if status wasn't locked prior to inventory adjustment.
- **Root Cause:** Race condition or redundant requests without verifying current status within a database transaction.
- **Resolution:** Implemented `SELECT ... FOR UPDATE` row locking. Verified `order_status === 'pending'` before restocking. If order is already `cancelled`, the API immediately aborts with an error without touching inventory.
- **Verification:** Tested in `testing/run_tests.php` Test #8. Redundant cancellation attempts yielded 400 Bad Request with unchanged inventory levels.

---

### Bug #004: Rating Value Check Constraint in Database
- **Severity:** Medium
- **Component:** `database/ecommerce.sql` & `backend/api/reviews/add.php`
- **Description:** Potential for out-of-range customer ratings (e.g. 0 stars or > 5 stars) if validation was bypassed.
- **Root Cause:** Missing database-level check constraint.
- **Resolution:** Added `CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5)` to `reviews` table, coupled with server-side validation `Validator::isRating()`.
- **Verification:** Tested in Test #9 of automated test suite. Database rejected out-of-bounds ratings with constraint exception.
