import { useState, useMemo } from 'react';
import { BudgetItem, Category, Transaction } from '../App';
import { Plus, Edit2, Trash2, TrendingUp, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2'; // 🛡️ SUNTIKAN REVISI: Import SweetAlert2

interface BudgetProps {
  budgets: BudgetItem[];
  categories: Category[];
  transactions: Transaction[];
  onAdd: (budget: Omit<BudgetItem, 'id'>) => void;
  onUpdate: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
}

export default function Budget({ budgets, categories, transactions, onAdd, onUpdate, onDelete }: BudgetProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newBudget, setNewBudget] = useState({ categoryId: '', amount: '' });
  const [editAmount, setEditAmount] = useState('');

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // 🧠 OTAK UTAMA: Pemetaan data budget dengan transaksi & kategori dari database cloud
  const budgetData = useMemo(() => {
    return budgets.map(budget => {
      // 🛡️ AMANKAN ID: Deteksi camelCase ataupun format underscore dari database MySQL
      const bCategoryId = budget.categoryId || (budget as any).category_id;
      
      // PERBAIKAN: Trim string ID agar pencarian uuidv4 database murni akurat 100%
      const category = categories.find(c => String(c.id).trim() === String(bCategoryId).trim());

      // Hitung total pengeluaran transaksi berdasarkan kategori ini di bulan berjalan
      const spent = transactions
        .filter(t => {
          const date = new Date(t.date);
          const isSameMonth = date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          
          // SINKRONISASI RELASI: Amankan cek nama lowercase + antisipasi ID category_id di baris transaksi
          const isSameCategory = 
            (t.category && category && t.category.toLowerCase().trim() === category.name.toLowerCase().trim()) ||
            String((t as any).categoryId || (t as any).category_id || '').trim() === String(bCategoryId).trim();

          return isSameCategory && t.type === 'expense' && isSameMonth;
        })
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const remaining = budget.amount - spent;

      return {
        ...budget,
        categoryId: bCategoryId, 
        category,
        spent,
        remaining,
        percentage: Math.min(percentage, 100),
        isOverBudget: spent > budget.amount,
      };
    });
  }, [budgets, categories, transactions, currentMonth, currentYear]);

  const availableCategories = useMemo(() => {
    const budgetedCategoryIds = budgets.map(b => String(b.categoryId || (b as any).category_id).trim());
    return categories.filter(c => c.type === 'expense' && !budgetedCategoryIds.includes(String(c.id).trim()));
  }, [categories, budgets]);

  // 🛡️ SUNTIKAN REVISI: Validasi SweetAlert2 jika ada kolom form tambah yang kosong
  const handleAddBudget = () => {
    if (!newBudget.categoryId || !newBudget.amount || Number(newBudget.amount) <= 0) {
      Swal.fire({
        title: 'Kolom Belum Lengkap!',
        text: 'Silakan pilih Kategori dan isi Jumlah Budget dengan angka valid (lebih dari 0) ya!',
        icon: 'warning',
        confirmButtonColor: '#3b82f6',
        background: '#ffffff',
        customClass: { title: 'text-slate-800 font-bold', popup: 'rounded-xl' }
      });
      return; // Hadang data kosong agar tidak tembus ke backend Clever Cloud
    }

    onAdd({
      categoryId: newBudget.categoryId,
      amount: parseFloat(newBudget.amount),
      period: 'monthly',
    });
    setNewBudget({ categoryId: '', amount: '' });
    setShowAddForm(false);
  };

  // 🛡️ SUNTIKAN REVISI: Validasi SweetAlert2 jika nominal edit kosong atau minus
  const handleUpdateBudget = (id: string) => {
    if (!editAmount || Number(editAmount) <= 0) {
      Swal.fire({
        title: 'Nominal Tidak Valid!',
        text: 'Jumlah perubahan budget wajib diisi dengan angka di atas 0!',
        icon: 'warning',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    const currentBudget = budgetData.find(b => b.id === id);
    if (!currentBudget) return;
    onUpdate(id, parseFloat(editAmount));
    setEditingId(null);
    setEditAmount('');
  };

  const startEdit = (budget: typeof budgetData[0]) => {
    setEditingId(budget.id);
    setEditAmount(budget.amount.toString());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  const totalBudget = budgets.reduce((sum, b) => {
    const amount = Number(b.amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const totalSpent = budgetData.reduce((sum, b) => {
    const spent = Number(b.spent || 0);
    return sum + (isNaN(spent) ? 0 : spent);
  }, 0);

  const totalRemaining = totalBudget - totalSpent;
  
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Budget Bulanan</h2>
          <p className="text-slate-500 mt-1">Atur dan pantau budget untuk setiap kategori</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Tambah Budget
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm text-slate-500">Total Budget</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalBudget)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-sm text-slate-500">Terpakai</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalSpent)}</p>
          <p className="text-sm text-slate-500 mt-1">
            {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% dari budget
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 ${totalRemaining >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-lg flex items-center justify-center`}>
              {totalRemaining >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <h3 className="text-sm text-slate-500">Sisa</h3>
          </div>
          <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalRemaining)}
          </p>
        </div>
      </div>

      {/* Add Budget Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Tambah Budget Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
              <select
                value={newBudget.categoryId}
                onChange={(e) => setNewBudget({ ...newBudget, categoryId: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Kategori</option>
                {availableCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.emoji} {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Jumlah Budget</label>
              <input
                type="number"
                value={newBudget.amount}
                onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddBudget}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Simpan
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgetData.map((budget) => {
          const currentCategory = budget.category;

          return (
            <div
              key={budget.id}
              className={`bg-white rounded-xl p-6 shadow-sm border-2 ${
                budget.isOverBudget ? 'border-red-300' : 'border-slate-200'
              } hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-2xl">
                    {currentCategory ? currentCategory.emoji : '📊'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {currentCategory ? currentCategory.name : 'Lainnya'}
                    </h3>
                    <p className="text-xs text-slate-500">Per bulan</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(budget)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(budget.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {editingId === budget.id ? (
                <div className="mb-4">
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleUpdateBudget(budget.id)}
                      className="flex-1 px-4 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 px-4 py-1 bg-slate-200 text-slate-700 rounded text-sm hover:bg-slate-300"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-sm text-slate-500">Terpakai</span>
                    <span className="text-lg font-semibold text-slate-800">
                      {formatCurrency(budget.spent)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-slate-500">Budget</span>
                    <span className="text-sm text-slate-600">{formatCurrency(budget.amount)}</span>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      budget.isOverBudget
                        ? 'bg-gradient-to-r from-red-500 to-rose-500'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500'
                    }`}
                    style={{ width: `${budget.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1 text-right">
                  {Math.round(budget.percentage)}% terpakai
                </p>
              </div>

              {/* Remaining */}
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                budget.isOverBudget ? 'bg-red-50' : 'bg-slate-50'
              }`}>
                <span className="text-sm font-medium text-slate-700">Sisa</span>
                <span className={`font-semibold ${
                  budget.isOverBudget ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatCurrency(budget.remaining)}
                </span>
              </div>

              {budget.isOverBudget && (
                <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Melebihi budget!</span>
                </div>
              )}
            </div>
          );
        })}

        {budgetData.length === 0 && (
          <div className="col-span-full bg-white rounded-xl p-12 shadow-sm border border-slate-200 text-center">
            <p className="text-slate-400 text-lg">Belum ada budget yang diatur</p>
            <p className="text-slate-400 text-sm mt-2">Klik tombol "Tambah Budget" untuk mulai</p>
          </div>
        )}
      </div>
    </div>
  );
}