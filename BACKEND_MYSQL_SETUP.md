# 🚀 Personal Finance Tracker - Backend MySQL Setup

Ini adalah kode backend lengkap untuk Personal Finance Tracker menggunakan **Node.js**, **Express**, dan **MySQL**.

---

## 📁 Struktur Folder Backend

```
finance-tracker-backend/
├── package.json
├── .env
├── server.js
├── config/
│   └── database.js
├── routes/
│   ├── transactions.js
│   ├── categories.js
│   ├── budgets.js
│   └── savings.js
├── services/
│   └── dbService.js
└── database/
    └── schema.sql
```

---

## 📦 File 1: `package.json`

```json
{
  "name": "finance-tracker-backend",
  "version": "1.0.0",
  "description": "Backend API untuk Personal Finance Tracker dengan MySQL",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "keywords": ["finance", "tracker", "mysql", "express"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "mysql2": "^3.6.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## 🔧 File 2: `.env`

```env
PORT=3001

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=finance_tracker
```

**Catatan:**
- Ganti `your_mysql_password` dengan password MySQL Anda
- Jika menggunakan XAMPP, password default biasanya kosong (hapus saja)

---

## 🗄️ File 3: `database/schema.sql`

**PENTING:** Jalankan SQL ini di MySQL untuk membuat database dan tabel!

```sql
-- Create Database
CREATE DATABASE IF NOT EXISTS finance_tracker;
USE finance_tracker;

-- Table: categories
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10),
  type ENUM('income', 'expense') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: transactions
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  date DATE NOT NULL,
  emoji VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: budgets
CREATE TABLE IF NOT EXISTS budgets (
  id VARCHAR(36) PRIMARY KEY,
  category_id VARCHAR(36),
  amount DECIMAL(15,2) NOT NULL,
  period VARCHAR(20) DEFAULT 'monthly',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Table: savings
CREATE TABLE IF NOT EXISTS savings (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  emoji VARCHAR(10),
  deadline DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (id, name, emoji, type) VALUES
('1', 'Pemasukan', '💰', 'income'),
('2', 'Food & Beverage', '🍔', 'expense'),
('3', 'Entertainment', '🎮', 'expense'),
('4', 'Transport', '🚗', 'expense'),
('5', 'Laundry', '🧺', 'expense'),
('6', 'Shopping', '🛍️', 'expense'),
('7', 'Bills & Utilities', '📄', 'expense'),
('8', 'Health & Fitness', '🍎', 'expense');
```

---

## 🔌 File 4: `config/database.js`

```javascript
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'finance_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL Connected Successfully!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ MySQL Connection Error:', err.message);
  });

export default pool;
```

---

## 🖥️ File 5: `server.js`

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transactionsRouter from './routes/transactions.js';
import categoriesRouter from './routes/categories.js';
import budgetsRouter from './routes/budgets.js';
import savingsRouter from './routes/savings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/transactions', transactionsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/savings', savingsRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Finance Tracker API is running with MySQL',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API ready at http://localhost:${PORT}/api`);
  console.log(`🗄️  Using MySQL Database`);
});
```

---

## 🛣️ File 6: `routes/transactions.js`

```javascript
import express from 'express';
import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET all transactions
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM transactions ORDER BY date DESC, created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// GET single transaction
router.get('/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM transactions WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST create transaction
router.post('/', async (req, res, next) => {
  try {
    const { name, amount, category, type, date, emoji } = req.body;
    const id = uuidv4();
    
    await pool.query(
      'INSERT INTO transactions (id, name, amount, category, type, date, emoji) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, amount, category, type, date, emoji]
    );
    
    res.status(201).json({
      id,
      name,
      amount,
      category,
      type,
      date,
      emoji
    });
  } catch (error) {
    next(error);
  }
});

// PUT update transaction
router.put('/:id', async (req, res, next) => {
  try {
    const { name, amount, category, type, date, emoji } = req.body;
    
    const [result] = await pool.query(
      'UPDATE transactions SET name = ?, amount = ?, category = ?, type = ?, date = ?, emoji = ? WHERE id = ?',
      [name, amount, category, type, date, emoji, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({
      id: req.params.id,
      name,
      amount,
      category,
      type,
      date,
      emoji
    });
  } catch (error) {
    next(error);
  }
});

// DELETE transaction
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM transactions WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
```

---

## 📂 File 7: `routes/categories.js`

```javascript
import express from 'express';
import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET all categories
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// POST create category
router.post('/', async (req, res, next) => {
  try {
    const { name, emoji, type } = req.body;
    const id = uuidv4();
    
    await pool.query(
      'INSERT INTO categories (id, name, emoji, type) VALUES (?, ?, ?, ?)',
      [id, name, emoji, type]
    );
    
    res.status(201).json({ id, name, emoji, type });
  } catch (error) {
    next(error);
  }
});

// DELETE category
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM categories WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
```

---

## 💰 File 8: `routes/budgets.js`

```javascript
import express from 'express';
import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET all budgets
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM budgets');
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// POST create budget
router.post('/', async (req, res, next) => {
  try {
    const { categoryId, amount, period } = req.body;
    const id = uuidv4();
    
    await pool.query(
      'INSERT INTO budgets (id, category_id, amount, period) VALUES (?, ?, ?, ?)',
      [id, categoryId, amount, period || 'monthly']
    );
    
    res.status(201).json({ id, categoryId, amount, period: period || 'monthly' });
  } catch (error) {
    next(error);
  }
});

// PUT update budget
router.put('/:id', async (req, res, next) => {
  try {
    const { categoryId, amount, period } = req.body;
    
    const [result] = await pool.query(
      'UPDATE budgets SET category_id = ?, amount = ?, period = ? WHERE id = ?',
      [categoryId, amount, period, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    res.json({ id: req.params.id, categoryId, amount, period });
  } catch (error) {
    next(error);
  }
});

// DELETE budget
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM budgets WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
```

---

## 🎯 File 9: `routes/savings.js`

```javascript
import express from 'express';
import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET all savings goals
router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM savings ORDER BY deadline');
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// POST create savings goal
router.post('/', async (req, res, next) => {
  try {
    const { name, targetAmount, currentAmount, emoji, deadline } = req.body;
    const id = uuidv4();
    
    await pool.query(
      'INSERT INTO savings (id, name, target_amount, current_amount, emoji, deadline) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, targetAmount, currentAmount || 0, emoji, deadline]
    );
    
    res.status(201).json({
      id,
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      emoji,
      deadline
    });
  } catch (error) {
    next(error);
  }
});

// PUT update savings goal
router.put('/:id', async (req, res, next) => {
  try {
    const { name, targetAmount, currentAmount, emoji, deadline } = req.body;
    
    const [result] = await pool.query(
      'UPDATE savings SET name = ?, target_amount = ?, current_amount = ?, emoji = ?, deadline = ? WHERE id = ?',
      [name, targetAmount, currentAmount, emoji, deadline, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }
    
    res.json({
      id: req.params.id,
      name,
      targetAmount,
      currentAmount,
      emoji,
      deadline
    });
  } catch (error) {
    next(error);
  }
});

// DELETE savings goal
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM savings WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }
    
    res.json({ message: 'Savings goal deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
```

---

## 🚀 Cara Setup MySQL Backend

### 1. Install MySQL

**Windows:**
- Download [XAMPP](https://www.apachefriends.org/) atau [MySQL Installer](https://dev.mysql.com/downloads/installer/)
- Install dan jalankan MySQL Server

**Mac:**
```bash
brew install mysql
brew services start mysql
```

**Linux:**
```bash
sudo apt install mysql-server
sudo systemctl start mysql
```

---

### 2. Buat Database

**Opsi A: Menggunakan phpMyAdmin (XAMPP)**
1. Buka http://localhost/phpmyadmin
2. Klik tab **SQL**
3. Copy-paste semua isi dari `database/schema.sql`
4. Klik **Go**

**Opsi B: Menggunakan MySQL Command Line**
```bash
mysql -u root -p < database/schema.sql
```

**Opsi C: MySQL Workbench**
1. Buka MySQL Workbench
2. Connect ke localhost
3. File → Run SQL Script
4. Pilih file `schema.sql`
5. Execute

---

### 3. Setup Project

```bash
# Masuk ke folder backend
cd finance-tracker-backend

# Install dependencies
npm install

# Copy .env.example ke .env
cp .env.example .env

# Edit .env dan isi dengan konfigurasi MySQL Anda
```

Edit file `.env`:
```env
PORT=3001

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=finance_tracker
```

---

### 4. Jalankan Backend

```bash
npm run dev
```

Jika berhasil, Anda akan melihat:
```
🚀 Server running on http://localhost:3001
📊 API ready at http://localhost:3001/api
🗄️  Using MySQL Database
✅ MySQL Connected Successfully!
```

---

## 🧪 Testing API

### Test dengan Postman

**1. Health Check**
- Method: GET
- URL: `http://localhost:3001/api/health`

**2. Get All Transactions**
- Method: GET
- URL: `http://localhost:3001/api/transactions`

**3. Create Transaction**
- Method: POST
- URL: `http://localhost:3001/api/transactions`
- Body (JSON):
```json
{
  "name": "Makan Siang",
  "amount": 50000,
  "category": "Food & Beverage",
  "type": "expense",
  "date": "2026-05-24",
  "emoji": "🍔"
}
```

---

## 📊 Keuntungan MySQL vs Google Sheets

| Feature | MySQL | Google Sheets |
|---------|-------|---------------|
| **Kecepatan** | ⚡ Sangat cepat | 🐌 Lambat (API calls) |
| **Relasi Data** | ✅ Foreign keys | ❌ Tidak ada |
| **Concurrent Users** | ✅ Banyak user | ⚠️ Terbatas |
| **Offline** | ✅ Works offline | ❌ Butuh internet |
| **Scalability** | ✅ Unlimited | ⚠️ Quota API |
| **Security** | ✅ Role-based | ⚠️ Share-based |
| **Backup** | ✅ Automated | ⚠️ Manual |

---

## 🔧 Troubleshooting

### Error: ER_NOT_SUPPORTED_AUTH_MODE

**Solusi:**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

### Error: ECONNREFUSED

**Solusi:**
- Pastikan MySQL server sedang berjalan
- Cek port di `.env` (default 3306)

### Error: Access denied for user

**Solusi:**
- Cek username dan password di `.env`
- Pastikan user memiliki akses ke database

---

## ✅ Checklist Setup

- [ ] MySQL sudah terinstall
- [ ] Database `finance_tracker` sudah dibuat
- [ ] Semua tabel sudah dibuat (transactions, categories, budgets, savings)
- [ ] File `.env` sudah diisi dengan benar
- [ ] Dependencies sudah terinstall (`npm install`)
- [ ] Backend berjalan tanpa error
- [ ] Test API dengan Postman berhasil

---

## 🎉 Selesai!

Backend MySQL Anda siap digunakan! Jauh lebih cepat dan reliable dibanding Google Sheets API! 🚀
