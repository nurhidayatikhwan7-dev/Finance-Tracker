# 📚 Personal Finance Tracker - Backend Documentation

Selamat datang! Project ini sekarang menggunakan **MySQL Database** untuk backend.

---

## 📁 File-File Penting Backend

| File | Deskripsi | Prioritas |
|------|-----------|-----------|
| **`MYSQL_QUICK_START.md`** | ⚡ Panduan cepat setup MySQL (5 menit) | 🔥 **MULAI DI SINI** |
| **`BACKEND_MYSQL_SETUP.md`** | 📖 Dokumentasi lengkap + semua kode backend | ⭐ Penting |
| **`DATABASE_SCHEMA.sql`** | 🗄️ SQL script untuk membuat database & tabel | ⭐ Penting |
| **`MIGRATION_GUIDE.md`** | 🔄 Panduan migrasi dari Google Sheets | 📘 Reference |
| **`BACKEND_MYSQL.env.example`** | ⚙️ Template file .env untuk MySQL | ⭐ Penting |

---

## 🚀 Quick Start (5 Menit)

### 1. Install XAMPP
Download: https://www.apachefriends.org/  
Start **MySQL** di XAMPP Control Panel

### 2. Buat Database
1. Buka: http://localhost/phpmyadmin
2. Klik tab **SQL**
3. Copy semua isi file **`DATABASE_SCHEMA.sql`**
4. Paste & klik **Go**

### 3. Setup Backend
```bash
cd finance-tracker-backend
npm install
cp BACKEND_MYSQL.env.example .env
# Edit .env dengan password MySQL Anda
npm run dev
```

### 4. Verify
Buka: http://localhost:3001/api/health

Jika muncul:
```
✅ MySQL Connected Successfully!
```

**BERHASIL!** 🎉

---

## 📖 Dokumentasi Lengkap

Untuk setup detail, baca file sesuai urutan:

1. **`MYSQL_QUICK_START.md`** - Quick start guide
2. **`BACKEND_MYSQL_SETUP.md`** - Dokumentasi lengkap & kode
3. **`MIGRATION_GUIDE.md`** - Troubleshooting & tips

---

## 🗄️ Database Schema

Database: `finance_tracker`

Tabel:
- **transactions** - Semua transaksi income/expense
- **categories** - Kategori transaksi
- **budgets** - Budget per kategori
- **savings** - Target tabungan

Detail: Lihat **`DATABASE_SCHEMA.sql`**

---

## 🔧 Tech Stack

- **Backend**: Node.js + Express
- **Database**: MySQL 8.0+
- **API**: REST API
- **ORM**: None (Direct SQL queries with mysql2)

---

## 📊 API Endpoints

### Transactions
- `GET /api/transactions` - Get all
- `GET /api/transactions/:id` - Get by ID
- `POST /api/transactions` - Create
- `PUT /api/transactions/:id` - Update
- `DELETE /api/transactions/:id` - Delete

### Categories
- `GET /api/categories` - Get all
- `POST /api/categories` - Create
- `DELETE /api/categories/:id` - Delete

### Budgets
- `GET /api/budgets` - Get all
- `POST /api/budgets` - Create
- `PUT /api/budgets/:id` - Update
- `DELETE /api/budgets/:id` - Delete

### Savings
- `GET /api/savings` - Get all
- `POST /api/savings` - Create
- `PUT /api/savings/:id` - Update
- `DELETE /api/savings/:id` - Delete

---

## ✅ Checklist Setup

- [ ] XAMPP installed
- [ ] MySQL running
- [ ] Database `finance_tracker` created
- [ ] 4 tables created (via schema.sql)
- [ ] Backend dependencies installed (`npm install`)
- [ ] `.env` configured
- [ ] Backend running (`npm run dev`)
- [ ] API test successful

---

## 🆚 Why MySQL?

**MySQL vs Google Sheets:**

| Feature | Google Sheets | MySQL |
|---------|--------------|-------|
| Speed | 1-2 seconds | 5-10 ms |
| Performance | 🐌 Slow | ⚡ **100x faster** |
| Quota | Limited | Unlimited |
| Offline | Need internet | Works offline |
| Setup | Complex | Simple |
| Production | Not recommended | Production-ready |

---

## 🔗 Frontend Integration

API Base URL (untuk frontend):
```typescript
const API_BASE_URL = 'http://localhost:3001/api';
```

File: `src/services/api.ts`

---

## 📞 Support

**Error?** Baca troubleshooting di:
- **`MIGRATION_GUIDE.md`** - Common issues & solutions

**Butuh bantuan?** Check:
- MySQL Documentation: https://dev.mysql.com/doc/
- Express.js Guide: https://expressjs.com/

---

## 🎉 Happy Coding!

Backend MySQL Anda sudah siap digunakan! 🚀

**Next Steps:**
1. Test semua API endpoints dengan Postman
2. Connect frontend ke backend
3. Add authentication (optional)
4. Deploy to production

---

**Version:** 1.0.0 (MySQL)  
**Last Updated:** 2026-05-25
