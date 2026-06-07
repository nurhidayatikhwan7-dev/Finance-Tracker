import { useState, useMemo } from 'react';
import { BudgetItem, Category, Transaction } from '../App';
import { Plus, Trash2, Edit2, PieChart, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2'; // 🛡️ Import SweetAlert2

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
  const [editAmount, setEditAmount] = useState('');
  
  const [newBudget, setNewBudget] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly' as 'monthly',
  });

  // Filter hanya kategori pengeluaran (expense) yang bisa di-set budget-nya
  const expenseCategories = categories.filter(c => c.type === 'expense');

  // 🛡️ VALIDASI TAMBAH BUDGET BARU
  const handleAddBudget = () => {
    if (!newBudget.categoryId || !newBudget.amount || Number(newBudget.amount) <= 0) {
      Swal.fire({
        title: 'Kolom Belum Lengkap!',
        text: 'Silakan pilih Kategori dan masukkan Nominal Budget yang valid (lebih dari 0) ya!',
        icon: 'warning',
        confirmButtonColor: '#3b82f6',
        background: '#ffffff',
        customClass: { title: 'text-slate-800 font-bold', popup: 'rounded-xl' }
      });
      return; // Stop eksekusi, kunci data kosong agar tidak lolos ke database
    }

    onAdd({
      categoryId: newBudget.categoryId,
      amount: parseFloat(newBudget.amount),
      period: newBudget.period,
    });

    setNewBudget({ categoryId: '', amount: '', period: 'monthly' });
    setShowAddForm(false);
  };

  // 🛡️ VALIDASI EDIT BUDGET LAMA
  const handleUpdateBudget = (id: string) => {
    if (!editAmount || Number(editAmount) <= 0) {
      Swal.fire({
        title: 'Nominal Tidak Valid!',
        text: 'Nominal budget harus diisi dengan angka yang valid (lebih dari 0)!',
        icon: 'warning',
        confirmButtonColor: '#3b82f6',
        background: '#ffffff',
        customClass: { title: 'text-slate-800 font-bold', popup: 'rounded-xl' }
      });
      return;
    }

    onUpdate(id, parseFloat(editAmount));
    setEditingId(null);
    setEditAmount('');
  };

  const startEdit = (budget: BudgetItem) => {
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

  // Kalkulasi data pemakaian budget secara dinamis berdasarkan data transaksi bulanan
  const budgetDetails = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return budgets.map(budget => {
      const category = categories.find(c => String(c.id) === String(budget.categoryId));
      
      // Hitung total pengeluaran ril bulan ini pada kategori terkait
      const spent = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          const isSameMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
          const isSameCategory = (t.category && category && t.category.toLowerCase() === category.name.toLowerCase()) || 
                                 String((t as any).categoryId || (t as any).category_id) === String(budget.categoryId);
          return t.type === 'expense' && isSameMonth && isSameCategory;
        })
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      const remaining = budget.amount - spent;
      const percentage = Math.min((spent / budget.amount) * 100, 100);

      return {
        ...budget,
        categoryName: category ? category.name : 'Lainnya',
        categoryEmoji: category ? category.emoji : '📊',
        spent,
        remaining,
        percentage,
      };
    });
  }, [budgets, categories, transactions]);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Budgeting</h2>
          <p className="text-slate-500 mt-1">Atur batasan pengeluaran bulanan kategori Anda</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Atur Budget Kategori
        </button>
      </div>

      {/* Form Tambah Target Budget */}
      {showAddForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6 max-w-xl">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Atur Limit Budget</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Kategori Pengeluaran</label>
              <select
                value={newBudget.categoryId}
                onChange={(e) => setNewBudget({ ...newBudget, categoryId: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Kategori --</option>
                {expenseCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nominal Batas Bulanan (Rp)</label>
              <input
                type="number"
                value={newBudget.amount}
                onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                placeholder="e.g. 500000"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddBudget}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Simpan Budget
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List Progress Kartu Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {budgetDetails.map((b) => (
          <div
            key={b.id}
            className={`bg-white rounded-xl p-6 shadow-sm border-2 ${
              b.remaining < 0 ? 'border-red-300 bg-red-50/10' : 'border-slate-200'
            } hover:shadow-md transition-all`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl">
                  {b.categoryEmoji}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{b.categoryName}</h3>
                  <p className="text-xs text-slate-400 capitalize">{b.period} Limit</p>
                </div>
              </div>
              
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(b)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(b.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {editingId === b.id ? (
              /* PANEL EDIT NOMINAL BUDGET INLINE */
              <div className="flex gap-2 mb-4 bg-slate-50 p-3 rounded-lg border">
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none"
                />
                <button onClick={() => handleUpdateBudget(b.id)} className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600">
                  Simpan
                </button>
                <button onClick={() => setEditingId(null)} className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-300">
                  Batal
                </button>
              </div>
            ) : (
              /* BARIS PROGRESS VISUAL */
              <div className="mb-4">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs text-slate-400">Pemakaian</span>
                  <span className={`text-sm font-bold ${b.remaining < 0 ? 'text-red-600' : 'text-slate-700'}`}>
                    {Math.round(b.percentage)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      b.remaining < 0 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                    }`}
                    style={{ width: `${b.percentage}%` }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Terpakai</span>
                <span className="text-sm font-semibold text-slate-700">{formatCurrency(b.spent)}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Limit</span>
                <span className="text-sm font-semibold text-slate-700">{formatCurrency(b.amount)}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Sisa</span>
                <span className={`text-sm font-bold ${b.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {b.remaining < 0 ? `-${formatCurrency(Math.abs(b.remaining))}` : formatCurrency(b.remaining)}
                </span>
              </div>
            </div>

            {b.remaining < 0 && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Peringatan: Pengeluaran telah melampaui limit budget!</span>
              </div>
            )}
          </div>
        ))}

        {budgets.length === 0 && (
          <div className="col-span-full bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-400">
            <PieChart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-lg">Belum ada limit budget kategori bulanan</p>
            <p className="text-sm mt-1">Klik tombol "Atur Budget Kategori" untuk memulai</p>
          </div>
        )}
      </div>
    </div>
  );
}