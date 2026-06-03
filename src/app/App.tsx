import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Home, Receipt, PieChart, Target, FolderOpen, Plus } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Budget from './components/Budget';
import SavingsGoals from './components/SavingsGoals';
import Categories from './components/Categories';
import AddTransactionModal from './components/AddTransactionModal';

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  emoji: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  type: 'income' | 'expense';
}

export interface BudgetItem {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly';
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  emoji: string;
  deadline: string;
}

const initialCategories: Category[] = [
  { id: '1', name: 'Pemasukan', emoji: '💰', type: 'income' },
  { id: '2', name: 'Food & Beverage', emoji: '🍔', type: 'expense' },
  { id: '3', name: 'Entertainment', emoji: '🎮', type: 'expense' },
  { id: '4', name: 'Transport', emoji: '🚗', type: 'expense' },
  { id: '5', name: 'Laundry', emoji: '🧺', type: 'expense' },
  { id: '6', name: 'Shopping', emoji: '🛍️', type: 'expense' },
  { id: '7', name: 'Bills & Utilities', emoji: '📄', type: 'expense' },
  { id: '8', name: 'Health & Fitness', emoji: '🍎', type: 'expense' },
];

const BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001/api';

const API_TRANSACTIONS_URL = `${BASE_URL}/transactions`;
const API_SAVINGS_URL = `${BASE_URL}/savings`;
const API_BUDGETS_URL = `${BASE_URL}/budgets`;
const API_CATEGORIES_URL = `${BASE_URL}/categories`;

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'transactions' | 'budget' | 'savings' | 'categories'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'transactions', label: 'Transaksi', icon: Receipt },
    { id: 'budget', label: 'Budget', icon: PieChart },
    { id: 'savings', label: 'Target Tabungan', icon: Target },
    { id: 'categories', label: 'Kategori', icon: FolderOpen },
  ];

  // 🔄 FUNGSI UTAMA SINKRONISASI DATA DINAMIS DENGAN DATABASE DATABASE CLOUD
  const fetchAllCloudData = async () => {
    try {
      const [resTransactions, resSavings, resBudgets, resCategories] = await Promise.all([
        axios.get(API_TRANSACTIONS_URL),
        axios.get(API_SAVINGS_URL),
        axios.get(API_BUDGETS_URL),
        axios.get(API_CATEGORIES_URL).catch(() => ({ data: initialCategories }))
      ]);

      if (resTransactions.data) setTransactions(resTransactions.data);
      if (resSavings.data) setSavingsGoals(resSavings.data);
      if (resBudgets.data) setBudgets(resBudgets.data);
      if (resCategories.data && resCategories.data.length > 0) setCategories(resCategories.data);
    } catch (error) {
      console.error("Gagal sinkronisasi data dengan database cloud:", error);
    }
  };

  // Menjalankan fetch data otomatis saat web pertama kali dibuka oleh siapa pun
  useEffect(() => {
    fetchAllCloudData();
  }, []);

  // 💰 MANAJEMEN AKSI TRANSAKSI
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const response = await axios.post(API_TRANSACTIONS_URL, transaction);
      if (response.status === 200 || response.status === 201) {
        await fetchAllCloudData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTransaction = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Transaksi?',
      text: 'Data transaksi yang dihapus tidak bisa dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      background: '#ffffff',
      customClass: { title: 'text-slate-800 font-bold', popup: 'rounded-xl' }
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axios.delete(`${API_TRANSACTIONS_URL}/${id}`);
      if (response.status === 200 || response.status === 201) {
        await fetchAllCloudData();
        Swal.fire({ title: 'Terhapus!', text: 'Transaksi berhasil dihapus.', icon: 'success', confirmButtonColor: '#3b82f6' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const response = await axios.put(`${API_TRANSACTIONS_URL}/${id}`, updates);
      if (response.status === 200 || response.status === 201) {
        await fetchAllCloudData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 📂 MANAJEMEN AKSI KATEGORI
  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const response = await axios.post(API_CATEGORIES_URL, category);
      if (response.status === 200 || response.status === 201) {
        await fetchAllCloudData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCategory = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Kategori?',
      text: 'Apakah Anda yakin ingin menghapus kategori ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      background: '#ffffff',
      customClass: { title: 'text-slate-800 font-bold', popup: 'rounded-xl' }
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axios.delete(`${API_CATEGORIES_URL}/${id}`);
      if (response.status === 200 || response.status === 201) {
        await fetchAllCloudData();
        Swal.fire({ title: 'Terhapus!', text: 'Kategori berhasil dihapus.', icon: 'success', confirmButtonColor: '#3b82f6' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 📊 MANAJEMEN AKSI BUDGETING
  const addBudget = async (budget: Omit<BudgetItem, 'id'>) => {
    try {
      const response = await axios.post(API_BUDGETS_URL, budget);
      if (response.status === 200 || response.status === 201) {
        await fetchAllCloudData();
      }
    } catch (error) {
      console.error(error);
    }
  };

 const updateBudget = async (id: string, amount: number) => {
    try {
      // 1. Cari data budget lama di dalam state agar properti kategorinya tidak hilang
      const currentB = budgets.find(b => String(b.id) === String(id));
      if (!currentB) return;

      // 2. Ambil categoryId lama, toleran terhadap camelCase maupun underscore database
      const oldCategoryId = currentB.categoryId || (currentB as any).category_id;

      // 3. Susun payload secara utuh agar MySQL tidak mengosongkan kolom lain
      const fullPayload = {
        categoryId: oldCategoryId,
        amount: Number(amount),
        period: currentB.period || 'monthly'
      };

      console.log("Mengirim update budget ke cloud:", fullPayload);

     
      const response = await axios.put(`${API_BUDGETS_URL}/${id}`, fullPayload);
      
      if (response.status === 200 || response.status === 201) {
        
        await fetchAllCloudData();
      }
    } catch (error) {
      console.error("Gagal melakukan update nominal budget:", error);
    }
  };

  const deleteBudget = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Budget?',
      text: 'Apakah Anda yakin ingin menghapus target budget ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      background: '#ffffff',
      customClass: { title: 'text-slate-800 font-bold', popup: 'rounded-xl' }
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axios.delete(`${API_BUDGETS_URL}/${id}`);
      if (response.status === 200 || response.status === 201) {
        await fetchAllCloudData();
        Swal.fire({ title: 'Terhapus!', text: 'Budget berhasil dihapus.', icon: 'success', confirmButtonColor: '#3b82f6' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 🎯 MANAJEMEN AKSI TARGET TABUNGAN
  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id'>) => {
    try {
      const response = await axios.post(API_SAVINGS_URL, goal);
      if (response.status === 200 || response.status === 201) {
        await fetchAllCloudData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    try {
      const currentGoal = savingsGoals.find(g => g.id === id);
      if (!currentGoal) return;

      const fullData = {
        name: updates.name !== undefined ? updates.name : currentGoal.name,
        targetAmount: updates.targetAmount !== undefined ? Number(updates.targetAmount) : Number(currentGoal.targetAmount),
        currentAmount: updates.currentAmount !== undefined ? Number(updates.currentAmount) : Number(currentGoal.currentAmount),
        emoji: updates.emoji !== undefined ? updates.emoji : currentGoal.emoji,
        deadline: updates.deadline !== undefined ? updates.deadline : currentGoal.deadline
      };

      if (fullData.deadline && typeof fullData.deadline === 'string') {
        fullData.deadline = fullData.deadline.includes('T') ? fullData.deadline.split('T')[0] : fullData.deadline.slice(0, 10);
      }

      const response = await axios.put(`${API_SAVINGS_URL}/${id}`, fullData);
      if (response.status === 200 || response.status === 201) {
        await fetchAllCloudData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    const result = await Swal.fire({
      title: 'Hapus Target Tabungan?',
      text: 'Apakah Anda yakin ingin menghapus target tabungan ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      background: '#ffffff',
      customClass: { title: 'text-slate-800 font-bold', popup: 'rounded-xl' }
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axios.delete(`${API_SAVINGS_URL}/${id}`);
      if (response.status === 200 || response.status === 201) {
        await fetchAllCloudData();
        Swal.fire({ title: 'Terhapus!', text: 'Target tabungan berhasil dihapus.', icon: 'success', confirmButtonColor: '#3b82f6' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Finance Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-1">Kelola keuangan Anda</p>
        </div>

        <nav className="flex-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  activeView === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => setShowAddTransaction(true)}
          className="m-4 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Tambah Transaksi</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {activeView === 'dashboard' && (
          <Dashboard
            transactions={transactions}
            categories={categories}
            budgets={budgets}
            savingsGoals={savingsGoals}
          />
        )}
        {activeView === 'transactions' && (
          <Transactions
            transactions={transactions}
            categories={categories}
            onDelete={deleteTransaction}
            onUpdate={updateTransaction}
          />
        )}
        {activeView === 'budget' && (
          <Budget
            budgets={budgets}
            categories={categories}
            transactions={transactions}
            onAdd={addBudget}
            onUpdate={updateBudget}
            onDelete={deleteBudget}
          />
        )}
        {activeView === 'savings' && (
          <SavingsGoals
            goals={savingsGoals}
            onAdd={addSavingsGoal}
            onUpdate={updateSavingsGoal}
            onDelete={deleteSavingsGoal}
          />
        )}
        {activeView === 'categories' && (
          <Categories
            categories={categories}
            onAdd={addCategory}
            onDelete={deleteCategory}
          />
        )}
      </div>

      {showAddTransaction && (
        <AddTransactionModal
          categories={categories}
          onAdd={addTransaction}
          onClose={() => setShowAddTransaction(false)}
        />
      )}
    </div>
  );
}