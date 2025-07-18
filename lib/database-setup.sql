-- PostgreSQL Database Schema
-- Run this to set up your database tables

CREATE DATABASE expense_tracker;

-- Connect to the database
\c expense_tracker;

-- Users table (for future authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags table
CREATE TABLE tags (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers table
CREATE TABLE suppliers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    contact_person VARCHAR(255),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Currencies table
CREATE TABLE currencies (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    exchange_rate DECIMAL(10, 4) NOT NULL DEFAULT 1.0,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE expenses (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    category_id VARCHAR(50) REFERENCES categories(id),
    currency_code VARCHAR(3) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    tags JSONB DEFAULT '[]',
    supplier_id VARCHAR(50) REFERENCES suppliers(id),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_currency_code ON expenses(currency_code);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX idx_currencies_user_id ON currencies(user_id);

-- Insert default categories
INSERT INTO categories (id, name, color, icon, is_default) VALUES
('transportation', 'Transportation', '#3B82F6', 'Car', TRUE),
('healthcare', 'Healthcare', '#10B981', 'Heart', TRUE),
('food', 'Food', '#F59E0B', 'UtensilsCrossed', TRUE),
('entertainment', 'Entertainment', '#8B5CF6', 'Gamepad2', TRUE),
('utilities', 'Utilities', '#6B7280', 'Zap', TRUE),
('shopping', 'Shopping', '#EC4899', 'ShoppingBag', TRUE),
('education', 'Education', '#6366F1', 'GraduationCap', TRUE),
('travel', 'Travel', '#06B6D4', 'Plane', TRUE),
('other', 'Other', '#F97316', 'MoreHorizontal', TRUE);

-- Insert default currencies
INSERT INTO currencies (id, code, name, symbol, exchange_rate, is_default, is_active) VALUES
('usd', 'USD', 'US Dollar', '$', 1.0, FALSE, TRUE),
('egp', 'EGP', 'Egyptian Pound', 'LE', 30.5, TRUE, TRUE),
('eur', 'EUR', 'Euro', '€', 0.85, FALSE, TRUE),
('gbp', 'GBP', 'British Pound', '£', 0.73, FALSE, TRUE),
('inr', 'INR', 'Indian Rupee', '₹', 83.2, FALSE, TRUE);
