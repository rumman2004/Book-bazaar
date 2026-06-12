-- ==========================================
-- BIBLIOBAZAR DATABASE SCHEMA
-- Run this file to initialize the database:
-- psql -U postgres -d bibliobazar -f Schema.sql
-- ==========================================

-- ==========================================
-- 1. ENUMS (Data Validation)
-- ==========================================
CREATE TYPE user_role AS ENUM ('admin', 'seller', 'buyer');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE book_condition AS ENUM ('new', 'like-new', 'good', 'acceptable');

-- ==========================================
-- 2. CORE AUTHENTICATION & PROFILES
-- ==========================================

-- MAIN USERS TABLE: Strictly for Login & Role Management
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'buyer',
    is_active BOOLEAN DEFAULT TRUE, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- BUYER PROFILE: Specific data for buyers
CREATE TABLE buyer_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    default_shipping_address TEXT
);

-- SELLER PROFILE: Business logic and verification
CREATE TABLE seller_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    store_name VARCHAR(100) UNIQUE NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    business_address TEXT NOT NULL,
    gstin VARCHAR(15) UNIQUE, 
    bank_account_details TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE 
);

-- ==========================================
-- 3. INVENTORY & ADVANCED CATEGORIES
-- ==========================================

-- HIERARCHICAL CATEGORIES: Allows Parent/Child categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE
);

-- BOOKS TABLE: Core inventory
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20),
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    condition book_condition DEFAULT 'new',
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url TEXT, 
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- JUNCTION TABLE (MANY-TO-MANY): Links one book to multiple categories
CREATE TABLE book_categories (
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, category_id) 
);

-- ==========================================
-- 4. TRANSACTIONS & CART
-- ==========================================

-- ORDERS TABLE: The primary receipt
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER REFERENCES users(id) ON DELETE RESTRICT,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    shipping_address TEXT NOT NULL,
    status order_status DEFAULT 'pending',
    payment_method VARCHAR(20) DEFAULT 'cod',
    coupon_id INTEGER REFERENCES coupons(id),
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ORDER ITEMS: Specific books tied to an order, preserving the purchase price
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE RESTRICT,
    seller_id INTEGER REFERENCES users(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL CHECK (price_at_purchase >= 0)
);

-- CART ITEMS: Persistent cart data linked to the database
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    UNIQUE (buyer_id, book_id) 
);

-- Create the reviews table
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  seller_response TEXT, -- Nullable, used when the seller replies
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(book_id, buyer_id) -- A buyer can only leave ONE review per book
);

-- Create a table for review images (max 5 per review enforced via backend)
CREATE TABLE review_images (
  id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
  image_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    valid_until TIMESTAMP
);

CREATE TYPE activity_type AS ENUM ('auth', 'order', 'review', 'system', 'error');

CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    type activity_type NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Who performed the action
    action VARCHAR(255) NOT NULL, -- e.g., 'User Login', 'Order Placed'
    details TEXT, -- Additional JSON context or text description
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_activity_logs_type ON activity_logs(type);


-- ==========================================
-- 5. INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX idx_books_seller_id ON books(seller_id);
CREATE INDEX idx_books_is_active ON books(is_active);
CREATE INDEX idx_books_price ON books(price);
CREATE INDEX idx_book_categories_book_id ON book_categories(book_id);
CREATE INDEX idx_book_categories_category_id ON book_categories(category_id);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_seller_id ON order_items(seller_id);
CREATE INDEX idx_cart_items_buyer_id ON cart_items(buyer_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);