# 🔄 Migration Guide: Google Sheets → MySQL

Panduan lengkap untuk migrasi dari Google Sheets API ke MySQL.

---

## 🎯 Kenapa Migrasi ke MySQL?

### Masalah dengan Google Sheets API:
- ❌ **Lambat** - Setiap operasi butuh HTTP request
- ❌ **Quota terbatas** - Google API memiliki rate limits
- ❌ **Butuh internet** - Tidak bisa offline
- ❌ **Kompleks setup** - Service account, OAuth, sharing permissions
- ❌ **Tidak scalable** - Susah untuk banyak user concurrent

### Keuntungan MySQL:
- ✅ **Super cepat** - Query langsung ke database
- ✅ **Unlimited** - Tidak ada quota
- ✅ **Works offline** - Database lokal
- ✅ **Simple setup** - Install & run
- ✅ **Production-ready** - Used by millions of apps
- ✅ **Better security** - User roles, permissions
- ✅ **Data integrity** - Foreign keys, constraints

---

## 📋 Langkah-Langkah Migrasi

### STEP 1: Install MySQL

**Windows (XAMPP):**
1. Download [XAMPP](https://www.apachefriends.org/)
2. Install XAMPP
3. Buka XAMPP Control Panel
4. Start **Apache** dan **MySQL**

**Windows (Standalone MySQL):**
1. Download [MySQL Installer](https://dev.mysql.com/downloads/installer/)
2. Install dengan setup wizard
3. Set root password saat instalasi

**Mac:**
```bash
brew install mysql
brew services start mysql
```

**Linux:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

---

### STEP 2: Buat Database

**Menggunakan phpMyAdmin (XAMPP):**
1. Buka browser: http://localhost/phpmyadmin
2. Klik tab **SQL** di bagian atas
3. Buka file `DATABASE_SCHEMA.sql` di VS Code
4. Copy **semua isi** file
5. Paste di phpMyAdmin SQL tab
6. Klik **Go** (atau **Kirim**)
7. Database dan tabel akan terbuat otomatis!

**Menggunakan MySQL Command Line:**
```bash
# Login ke MySQL
mysql -u root -p

# Atau langsung execute SQL file
mysql -u root -p < DATABASE_SCHEMA.sql
```

**Menggunakan MySQL Workbench:**
1. Download [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)
2. Connect ke localhost
3. File → Run SQL Script
4. Pilih `DATABASE_SCHEMA.sql`
5. Click Execute

---

### STEP 3: Verify Database Terbuat

**Di phpMyAdmin:**
1. Klik database `finance_tracker` di sidebar kiri
2. Pastikan ada 4 tabel:
   - `categories` ✅
   - `transactions` ✅
   - `budgets` ✅
   - `savings` ✅

**Di Command Line:**
```bash
mysql -u root -p
USE finance_tracker;
SHOW TABLES;
```

Output harus:
```
+---------------------------+
| Tables_in_finance_tracker |
+---------------------------+
| budgets                   |
| categories                |
| savings                   |
| transactions              |
+---------------------------+
```

---

### STEP 4: Update Backend Code

#### A. Hapus File Google Sheets (tidak diperlukan lagi)

Delete files:
```
❌ config/googleSheets.js
❌ services/sheetsService.js
```

#### B. Install MySQL Dependencies

```bash
npm uninstall googleapis
npm install mysql2
```

#### C. Update `package.json`

Ganti dependencies:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "mysql2": "^3.6.0",
    "uuid": "^9.0.1"
  }
}
```

#### D. Buat File Baru

Buat file-file sesuai **BACKEND_MYSQL_SETUP.md**:

1. `config/database.js` ← Database connection
2. `routes/transactions.js` ← MySQL version
3. `routes/categories.js` ← MySQL version
4. `routes/budgets.js` ← MySQL version
5. `routes/savings.js` ← MySQL version
6. Update `server.js`

#### E. Update `.env`

Ganti dari Google Sheets config:
```env
# HAPUS INI (Google Sheets):
# GOOGLE_SHEETS_ID=...
# GOOGLE_SERVICE_ACCOUNT_EMAIL=...
# GOOGLE_PRIVATE_KEY=...

# GANTI DENGAN INI (MySQL):
PORT=3001

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=finance_tracker
```

**PENTING:** Ganti `your_mysql_password` dengan password MySQL Anda!

Jika pakai XAMPP dan password kosong:
```env
DB_PASSWORD=
```

---

### STEP 5: Test Backend

```bash
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:3001
📊 API ready at http://localhost:3001/api
🗄️  Using MySQL Database
✅ MySQL Connected Successfully!
```

Jika muncul "✅ MySQL Connected Successfully!" → **BERHASIL!** 🎉

---

### STEP 6: Test API

**Test 1: Health Check**
```bash
curl http://localhost:3001/api/health
```

Response:
```json
{
  "status": "OK",
  "message": "Finance Tracker API is running with MySQL",
  "timestamp": "2026-05-24T..."
}
```

**Test 2: Get Categories**
```bash
curl http://localhost:3001/api/categories
```

Should return 8 default categories.

**Test 3: Create Transaction**
```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"name":"Test MySQL","amount":100000,"category":"Food & Beverage","type":"expense","date":"2026-05-24","emoji":"🍔"}'
```

**Test 4: Verify in Database**

Di phpMyAdmin:
1. Buka tabel `transactions`
2. Klik **Browse**
3. Lihat data yang baru ditambahkan ✅

---

## 📊 Migrasi Data (Jika Ada Data di Google Sheets)

Jika Anda sudah punya data di Google Sheets dan ingin dipindahkan ke MySQL:

### Manual Migration (Recommended)

1. **Export dari Google Sheets:**
   - Buka Google Sheets
   - File → Download → CSV
   - Download semua sheets (Transactions, Categories, dll)

2. **Import ke MySQL via phpMyAdmin:**
   - Buka phpMyAdmin
   - Pilih tabel yang sesuai
   - Klik tab **Import**
   - Choose file CSV
   - Match columns dengan database columns
   - Click **Go**

3. **Atau gunakan MySQL LOAD DATA:**
   ```sql
   LOAD DATA INFILE '/path/to/transactions.csv'
   INTO TABLE transactions
   FIELDS TERMINATED BY ','
   ENCLOSED BY '"'
   LINES TERMINATED BY '\n'
   IGNORE 1 ROWS;
   ```

---

## 🔧 Troubleshooting

### Error: "Can't connect to MySQL server"

**Solusi:**
1. Pastikan MySQL server running (cek di XAMPP Control Panel)
2. Cek port di `.env` (default 3306)
3. Test connection:
   ```bash
   mysql -u root -p -h localhost
   ```

### Error: "Access denied for user 'root'"

**Solusi:**
1. Cek password di `.env`
2. Reset password MySQL:
   ```bash
   mysqladmin -u root password newpassword
   ```
3. Atau hapus password (untuk development):
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY '';
   ```

### Error: "Unknown database 'finance_tracker'"

**Solusi:**
Database belum dibuat. Jalankan `DATABASE_SCHEMA.sql`:
```bash
mysql -u root -p < DATABASE_SCHEMA.sql
```

### Error: "ER_NOT_SUPPORTED_AUTH_MODE"

**Solusi:**
Change authentication method:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

### Frontend masih pakai Google Sheets

**Solusi:**
Update `src/services/api.ts` - pastikan `API_BASE_URL` pointing ke backend MySQL:
```typescript
const API_BASE_URL = 'http://localhost:3001/api';
```

---

## ✅ Migration Checklist

- [ ] MySQL installed & running
- [ ] Database `finance_tracker` created
- [ ] All tables created (4 tables)
- [ ] Default categories inserted (8 categories)
- [ ] File `config/database.js` created
- [ ] All routes updated to MySQL version
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` updated with MySQL config
- [ ] Backend running without errors
- [ ] Connection to MySQL successful
- [ ] API test successful
- [ ] Data appears in MySQL database

---

## 📈 Performance Comparison

**Before (Google Sheets):**
- Create transaction: ~1-2 seconds ⏱️
- Get all transactions: ~0.5-1 second
- API quota: 500 requests/100 seconds

**After (MySQL):**
- Create transaction: ~5-10 milliseconds ⚡
- Get all transactions: ~2-5 milliseconds
- No quota limits! 🚀

**100x - 200x FASTER!** 🎯

---

## 🎉 Migration Complete!

Selamat! Backend Anda sekarang menggunakan MySQL yang jauh lebih cepat dan reliable!

**Next Steps:**
1. Test semua fitur (create, read, update, delete)
2. Backup database secara berkala
3. Consider adding user authentication
4. Deploy ke production server

---

**Need Help?**
- MySQL Documentation: https://dev.mysql.com/doc/
- MySQL Tutorial: https://www.mysqltutorial.org/
- Stack Overflow: Tag `mysql` + `node.js`
