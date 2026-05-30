# 🚀 MySQL Backend - Quick Start Guide

Panduan super cepat untuk setup backend MySQL dalam **5 menit**!

---

## ⚡ Quick Steps

### 1️⃣ Install MySQL (XAMPP - Recommended)

**Windows:**
1. Download XAMPP: https://www.apachefriends.org/
2. Install
3. Buka **XAMPP Control Panel**
4. Klik **Start** pada **MySQL**

**Mac:**
```bash
brew install mysql
brew services start mysql
```

---

### 2️⃣ Buat Database

**Cara Tercepat (phpMyAdmin):**
1. Buka browser: **http://localhost/phpmyadmin**
2. Klik tab **SQL**
3. Buka file **`DATABASE_SCHEMA.sql`** di VS Code
4. **Copy semua isi file**
5. **Paste** di phpMyAdmin
6. Klik **Go** (atau **Kirim**)
7. ✅ Done! Database & tabel sudah terbuat!

---

### 3️⃣ Setup Backend

**Di folder backend, jalankan:**

```bash
# Install dependencies
npm install

# Copy .env example
cp BACKEND_MYSQL.env.example .env

# Edit .env (ganti password MySQL)
code .env
```

**Edit file `.env`:**
```env
PORT=3001

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=         ← ISI PASSWORD MYSQL ANDA DI SINI!
DB_NAME=finance_tracker
```

**Jika pakai XAMPP, biasanya password kosong!**

---

### 4️⃣ Copy Kode Backend

Buka file **`BACKEND_MYSQL_SETUP.md`** dan copy semua kode untuk:

1. ✅ `package.json`
2. ✅ `server.js`
3. ✅ `config/database.js`
4. ✅ `routes/transactions.js`
5. ✅ `routes/categories.js`
6. ✅ `routes/budgets.js`
7. ✅ `routes/savings.js`

**Struktur folder harus seperti ini:**
```
BACKEND_CODE/
├── package.json
├── .env
├── server.js
├── config/
│   └── database.js
└── routes/
    ├── transactions.js
    ├── categories.js
    ├── budgets.js
    └── savings.js
```

---

### 5️⃣ Jalankan Backend

```bash
npm run dev
```

**Expected output:**
```
🚀 Server running on http://localhost:3001
📊 API ready at http://localhost:3001/api
🗄️  Using MySQL Database
✅ MySQL Connected Successfully!
```

**Lihat "✅ MySQL Connected Successfully!" → BERHASIL!** 🎉

---

## 🧪 Test API

### Test 1: Browser

Buka browser: **http://localhost:3001/api/health**

Should see:
```json
{
  "status": "OK",
  "message": "Finance Tracker API is running with MySQL"
}
```

### Test 2: Get Categories

**http://localhost:3001/api/categories**

Should return 8 default categories.

### Test 3: Postman (Create Transaction)

**Method:** POST  
**URL:** `http://localhost:3001/api/transactions`  
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{
  "name": "Test Makan Siang",
  "amount": 50000,
  "category": "Food & Beverage",
  "type": "expense",
  "date": "2026-05-24",
  "emoji": "🍔"
}
```

**Response:**
```json
{
  "id": "uuid-generated",
  "name": "Test Makan Siang",
  "amount": 50000,
  ...
}
```

### Test 4: Verify in Database

**Di phpMyAdmin:**
1. Buka **http://localhost/phpmyadmin**
2. Klik database **finance_tracker**
3. Klik tabel **transactions**
4. Klik **Browse**
5. ✅ Lihat data yang baru ditambahkan!

---

## 📁 File-File Penting

| File | Deskripsi |
|------|-----------|
| `BACKEND_MYSQL_SETUP.md` | 📖 Dokumentasi lengkap + semua kode backend |
| `DATABASE_SCHEMA.sql` | 🗄️ SQL untuk membuat database & tabel |
| `MIGRATION_GUIDE.md` | 🔄 Panduan migrasi dari Google Sheets |
| `MYSQL_QUICK_START.md` | ⚡ Quick start guide (file ini) |
| `BACKEND_MYSQL.env.example` | ⚙️ Template .env untuk MySQL |

---

## 🆚 Google Sheets vs MySQL

| Feature | Google Sheets | MySQL |
|---------|--------------|-------|
| Setup | Complex (Service Account) | Simple (Install & Run) |
| Speed | 1-2 seconds | 5-10 ms |
| Performance | 🐌 **100x slower** | ⚡ **100x faster** |
| Offline | ❌ Need internet | ✅ Works offline |
| Quota | ⚠️ Limited API calls | ✅ Unlimited |
| Scalability | ⚠️ Not scalable | ✅ Production-ready |

**MySQL is 100-200x FASTER!** 🚀

---

## 🔧 Common Issues

### ❌ "Can't connect to MySQL server"

**Fix:**
- Pastikan MySQL running di XAMPP Control Panel
- Start MySQL service

### ❌ "Access denied for user 'root'"

**Fix:**
- Cek password di `.env`
- Jika pakai XAMPP, password biasanya kosong:
  ```env
  DB_PASSWORD=
  ```

### ❌ "Unknown database 'finance_tracker'"

**Fix:**
- Database belum dibuat
- Jalankan `DATABASE_SCHEMA.sql` di phpMyAdmin

### ❌ Backend running tapi data tidak masuk

**Fix:**
1. Cek console log (ada error?)
2. Test API dengan Postman
3. Verify MySQL connection
4. Cek phpMyAdmin - apakah data muncul?

---

## ✅ Success Checklist

- [ ] XAMPP installed
- [ ] MySQL running (green di XAMPP)
- [ ] Database `finance_tracker` created
- [ ] 4 tables exist (transactions, categories, budgets, savings)
- [ ] 8 default categories inserted
- [ ] `.env` configured with MySQL credentials
- [ ] All backend files created
- [ ] `npm install` completed
- [ ] Backend running without errors
- [ ] "✅ MySQL Connected Successfully!" message appears
- [ ] API health check works
- [ ] Can create transaction via Postman
- [ ] Data appears in phpMyAdmin

---

## 🎯 Next Steps

1. ✅ Backend MySQL sudah jalan
2. 🔜 Test semua API endpoints
3. 🔜 Connect frontend ke backend
4. 🔜 Add user authentication (optional)
5. 🔜 Deploy to production

---

## 📚 Full Documentation

Untuk detail lengkap, baca:
- **`BACKEND_MYSQL_SETUP.md`** - Dokumentasi lengkap
- **`MIGRATION_GUIDE.md`** - Panduan migrasi dari Google Sheets

---

## 🎉 Done!

Backend MySQL Anda siap digunakan!

**Happy coding!** 💻🚀
