import { useState } from 'react';
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

const initialTransactions: Transaction[] = [
  { id: '1', name: 'Gaji Bulanan', amount: 8000000, category: 'Pemasukan', type: 'income', date: '2026-05-01', emoji: '💰' },
  { id: '2', name: 'Makan Siang', amount: 50000, category: 'Food & Beverage', type: 'expense', date: '2026-05-23', emoji: '🍔' },
  { id: '3', name: 'Bensin', amount: 100000, category: 'Transport', type: 'expense', date: '2026-05-22', emoji: '🚗' },
  { id: '4', name: 'Netflix', amount: 186000, category: 'Entertainment', type: 'expense', date: '2026-05-20', emoji: '🎮' },
  { id: '5', name: 'Belanja Bulanan', amount: 1500000, category: 'Shopping', type: 'expense', date: '2026-05-15', emoji: '🛍️' },
];

const initialBudgets: BudgetItem[] = [
  { id: '1', categoryId: '2', amount: 2000000, period: 'monthly' },
  { id: '2', categoryId: '3', amount: 500000, period: 'monthly' },
  { id: '3', categoryId: '4', amount: 800000, period: 'monthly' },
  { id: '4', categoryId: '5', amount: 200000, period: 'monthly' },
];

const initialSavingsGoals: SavingsGoal[] = [
  { id: '1', name: 'Liburan Bali', targetAmount: 10000000, currentAmount: 3500000, emoji: '🏖️', deadline: '2026-12-31' },
  { id: '2', name: 'Emergency Fund', targetAmount: 30000000, currentAmount: 15000000, emoji: '🚨', deadline: '2027-06-30' },
  { id: '3', name: 'Laptop Baru', targetAmount: 15000000, currentAmount: 8000000, emoji: '💻', deadline: '2026-09-30' },
];

const API_TRANSACTIONS_URL = 'https://finance-tracker-cl66.onrender.com/api/transactions';
const API_SAVINGS_URL = 'https://finance-tracker-cl66.onrender.com/api/savings';
const API_BUDGETS_URL = 'https://finance-tracker-cl66.onrender.com/api/budgets';
const API_CATEGORIES_URL = 'https://finance-tracker-cl66.onrender.com/api/categories';

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'transactions' | 'budget' | 'savings' | 'categories'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [budgets, setBudgets] = useState<BudgetItem[]>(initialBudgets);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(initialSavingsGoals);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'transactions', label: 'Transaksi', icon: Receipt },
    { id: 'budget', label: 'Budget', icon: PieChart },
    { id: 'savings', label: 'Target Tabungan', icon: Target },
    { id: 'categories', label: 'Kategori', icon: FolderOpen },
  ];

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const response = await axios.post(API_TRANSACTIONS_URL, transaction);
      if (response.status === 201) {
        setTransactions([response.data, ...transactions]);
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
      customClass: {
        title: 'text-slate-800 font-bold',
        popup: 'rounded-xl'
      }
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axios.delete(`${API_TRANSACTIONS_URL}/${id}`);
      if (response.status === 200) {
        setTransactions(transactions.filter(t => t.id !== id));
        Swal.fire({ title: 'Terhapus!', text: 'Transaksi berhasil dihapus.', icon: 'success', confirmButtonColor: '#3b82f6' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const response = await axios.put(`${API_TRANSACTIONS_URL}/${id}`, updates);
      if (response.status === 200) {
        setTransactions(transactions.map(t => t.id === id ? { ...t, ...updates } : t));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const response = await axios.post(API_CATEGORIES_URL, category);
      if (response.status === 201) {
        setCategories([...categories, response.data]);
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
      customClass: {
        title: 'text-slate-800 font-bold',
        popup: 'rounded-xl'
      }
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axios.delete(`${API_CATEGORIES_URL}/${id}`);
      if (response.status === 200) {
        setCategories(categories.filter(c => c.id !== id));
        Swal.fire({ title: 'Terhapus!', text: 'Kategori berhasil dihapus.', icon: 'success', confirmButtonColor: '#3b82f6' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addBudget = async (budget: Omit<BudgetItem, 'id'>) => {
    try {
      const response = await axios.post(API_BUDGETS_URL, budget);
      if (response.status === 201) {
        setBudgets([...budgets, response.data]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateBudget = async (id: string, amount: number) => {
    try {
      const response = await axios.put(`${API_BUDGETS_URL}/${id}`, { amount });
      if (response.status === 200) {
        setBudgets(budgets.map(b => b.id === id ? { ...b, amount } : b));
      }
    } catch (error) {
      console.error(error);
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
      customClass: {
        title: 'text-slate-800 font-bold',
        popup: 'rounded-xl'
      }
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axios.delete(`${API_BUDGETS_URL}/${id}`);
      if (response.status === 200) {
        setBudgets(budgets.filter(b => b.id !== id));
        Swal.fire({ title: 'Terhapus!', text: 'Budget berhasil dihapus.', icon: 'success', confirmButtonColor: '#3b82f6' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id'>) => {
    try {
      const response = await axios.post(API_SAVINGS_URL, goal);
      if (response.status === 201) {
        setSavingsGoals([...savingsGoals, response.data]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    try {
      const response = await axios.put(`${API_SAVINGS_URL}/${id}`, updates);
      if (response.status === 200) {
        setSavingsGoals(savingsGoals.map(g => g.id === id ? { ...g, ...updates } : g));
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
      customClass: {
        title: 'text-slate-800 font-bold',
        popup: 'rounded-xl'
      }
    });

    if (!result.isConfirmed) return;

    try {
      const response = await axios.delete(`${API_SAVINGS_URL}/${id}`);
      if (response.status === 200) {
        setSavingsGoals(savingsGoals.filter(g => g.id !== id));
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