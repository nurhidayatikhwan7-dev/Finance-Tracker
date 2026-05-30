-- ================================================
-- Personal Finance Tracker - MySQL Database Schema
-- ================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS finance_tracker;
USE finance_tracker;

-- ================================================
-- Table: categories
-- Menyimpan kategori transaksi (income/expense)
-- ================================================
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10),
  type ENUM('income', 'expense') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- Table: transactions
-- Menyimpan semua transaksi keuangan
-- ================================================
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  date DATE NOT NULL,
  emoji VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_date (date),
  INDEX idx_type (type),
  INDEX idx_category (category)
);

-- ================================================
-- Table: budgets
-- Menyimpan budget per kategori
-- ================================================
CREATE TABLE IF NOT EXISTS budgets (
  id VARCHAR(36) PRIMARY KEY,
  category_id VARCHAR(36),
  amount DECIMAL(15,2) NOT NULL,
  period VARCHAR(20) DEFAULT 'monthly',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- ================================================
-- Table: savings
-- Menyimpan target tabungan/savings goals
-- ================================================
CREATE TABLE IF NOT EXISTS savings (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  emoji VARCHAR(10),
  deadline DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_deadline (deadline)
);

-- ================================================
-- Insert Default Categories
-- ================================================
INSERT INTO categories (id, name, emoji, type) VALUES
('1', 'Pemasukan', '💰', 'income'),
('2', 'Food & Beverage', '🍔', 'expense'),
('3', 'Entertainment', '🎮', 'expense'),
('4', 'Transport', '🚗', 'expense'),
('5', 'Laundry', '🧺', 'expense'),
('6', 'Shopping', '🛍️', 'expense'),
('7', 'Bills & Utilities', '📄', 'expense'),
('8', 'Health & Fitness', '🍎', 'expense')
ON DUPLICATE KEY UPDATE name=name;

-- ================================================
-- Insert Sample Data (Optional - untuk testing)
-- ================================================

-- Sample Transactions
INSERT INTO transactions (id, name, amount, category, type, date, emoji) VALUES
('tx-1', 'Gaji Bulanan', 8000000, 'Pemasukan', 'income', '2026-05-01', '💰'),
('tx-2', 'Makan Siang', 50000, 'Food & Beverage', 'expense', '2026-05-23', '🍔'),
('tx-3', 'Bensin', 100000, 'Transport', 'expense', '2026-05-22', '🚗'),
('tx-4', 'Netflix', 186000, 'Entertainment', 'expense', '2026-05-20', '🎮'),
('tx-5', 'Belanja Bulanan', 1500000, 'Shopping', 'expense', '2026-05-15', '🛍️')
ON DUPLICATE KEY UPDATE name=name;

-- Sample Budgets
INSERT INTO budgets (id, category_id, amount, period) VALUES
('bg-1', '2', 2000000, 'monthly'),
('bg-2', '3', 500000, 'monthly'),
('bg-3', '4', 800000, 'monthly'),
('bg-4', '5', 200000, 'monthly')
ON DUPLICATE KEY UPDATE amount=amount;

-- Sample Savings Goals
INSERT INTO savings (id, name, target_amount, current_amount, emoji, deadline) VALUES
('sv-1', 'Liburan Bali', 10000000, 3500000, '🏖️', '2026-12-31'),
('sv-2', 'Emergency Fund', 30000000, 15000000, '🚨', '2027-06-30'),
('sv-3', 'Laptop Baru', 15000000, 8000000, '💻', '2026-09-30')
ON DUPLICATE KEY UPDATE name=name;

-- ================================================
-- Useful Queries for Analytics
-- ================================================

-- Total Income vs Expense (This Month)
-- SELECT
--   type,
--   SUM(amount) as total
-- FROM transactions
-- WHERE YEAR(date) = YEAR(CURDATE())
--   AND MONTH(date) = MONTH(CURDATE())
-- GROUP BY type;

-- Top 5 Expense Categories
-- SELECT
--   category,
--   SUM(amount) as total_spent
-- FROM transactions
-- WHERE type = 'expense'
-- GROUP BY category
-- ORDER BY total_spent DESC
-- LIMIT 5;

-- Budget vs Actual Spending
-- SELECT
--   c.name as category,
--   b.amount as budget,
--   COALESCE(SUM(t.amount), 0) as actual,
--   (b.amount - COALESCE(SUM(t.amount), 0)) as remaining
-- FROM budgets b
-- JOIN categories c ON b.category_id = c.id
-- LEFT JOIN transactions t ON t.category = c.name
--   AND t.type = 'expense'
--   AND YEAR(t.date) = YEAR(CURDATE())
--   AND MONTH(t.date) = MONTH(CURDATE())
-- GROUP BY b.id, c.name, b.amount;

-- Savings Progress
-- SELECT
--   name,
--   target_amount,
--   current_amount,
--   (current_amount / target_amount * 100) as progress_percentage,
--   (target_amount - current_amount) as remaining,
--   deadline
-- FROM savings
-- ORDER BY deadline;
