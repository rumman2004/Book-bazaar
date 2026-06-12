# Bibliobazar Updates & Features Changelog

This document summarizes the significant new features, schema updates, and bug fixes implemented during the recent development session.

## 🗄️ Database Changes (Schema.sql)

Several new tables and enumerations were added to support platform-wide features:

```sql
-- 1. Activity Types ENUM
CREATE TYPE activity_type AS ENUM ('auth', 'order', 'review', 'system', 'error');

-- 2. Global Activity Logs Table
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    type activity_type NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Discount Coupons Table
CREATE TABLE coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 New Features & Enhancements

### 1. Global Activity Tracking System
*   **Backend (`activityLogger.js`)**: A new utility was created to log events across the entire platform. This was instrumented directly into authentication (`authController.js`), order processing (`buyerController.js`), and reviews (`reviewController.js`). Global server errors (500) are also automatically tracked.
*   **Admin Panel (`ActivityLog.jsx`)**: Built a fully responsive timeline UI to track events in real-time. Added chip filters allowing admins to isolate `auth`, `order`, `review`, and `error` events seamlessly.

### 2. Admin Leaderboard Redesign
*   **Backend Aggregations**: Created `getLeaderboard` endpoint. It features heavy SQL joins to determine the "Top Sellers" by calculating the sum of quantities sold and total revenue. It also calculates the "Top Books" across the platform.
*   **Premium Frontend (`Leaderboard.jsx`)**: Designed a brand-new UI with a "Champions" podium highlighting the top 3 sellers using beautiful gradients, rank badges, and avatars. Below the podium, standard statistics pills and a comprehensive Top Books grid layout were implemented.

### 3. Coupon Management Overhaul
*   **Record Retention (`toggleCouponStatus`)**: Replaced the destructive `deleteCoupon` endpoint with a toggle system. Admins can now flip the `is_active` status of a coupon instead of permanently deleting it, maintaining historical order records.
*   **Admin UI (`Coupons.jsx`)**: Overhauled the design with modern cards, dynamic visual tags (Green for Active, Red/Faded for Expired), and a dropdown to filter between All/Current/Expired coupons.
*   **Checkout Integration (`Checkout.jsx`)**: Fixed a data extraction bug so that buyers can correctly validate their coupons during checkout and see their subtotal recalculate in real time before placing the order.

### 4. Admin Dashboard Metrics
*   Updated the core admin dashboard page to accurately pull total counts (Total Buyers, Sellers, Books, Completed Orders) and aggregate the "Total Platform Revenue" generated from all sellers. Note: Reviews were removed from the immediate dashboard view to focus on metric charts.

## 🐛 Bug Fixes

*   **Vite HMR Case-Sensitivity Fix**: Unified the import string `import api from './api.js';` across all Service files (`AdminService.js`, `BuyerService.js`, `SellerService.js`, etc.). This resolves critical hot-reloading crashes on Windows/Linux environments where `Api.js` (capital A) caused Vite dependency mismatch errors.
*   **Coupon Filter Bug**: Resolved an issue where array methods failed against object-wrapped API responses (`coupons.filter is not a function`).
*   **Routing Case Issues**: Patched the `LeaderBoard` vs `Leaderboard` casing collision in `AppRoutes.jsx`.

## 📁 Key Files Touched
*   `Server/src/utils/activityLogger.js` **(New)**
*   `Server/src/controllers/adminController.js`
*   `Server/src/controllers/couponController.js`
*   `Client/src/pages/admin/ActivityLog.jsx`
*   `Client/src/pages/admin/Leaderboard.jsx`
*   `Client/src/pages/admin/Coupons.jsx`
*   `Client/src/pages/buyer/Checkout.jsx`
*   `Client/src/services/*.js` (All services)
