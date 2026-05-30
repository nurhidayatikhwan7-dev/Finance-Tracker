import { Transaction, Category, BudgetItem, SavingsGoal } from '../App';
import { TrendingUp, TrendingDown, Wallet, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

interface DashboardProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: BudgetItem[];
  savingsGoals: SavingsGoal[];
}

export default function Dashboard({ transactions, categories, budgets, savingsGoals }: DashboardProps) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
  }, [transactions, currentMonth, currentYear]);

  const totalIncome = useMemo(() => {
    return monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthlyTransactions]);

  const totalExpense = useMemo(() => {
    return monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthlyTransactions]);

  const balance = totalIncome - totalExpense;

  const expenseByCategory = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    monthlyTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    return Object.entries(categoryTotals).map(([name, value]) => {
      const category = categories.find(c => c.name === name);
      return {
        name,
        value,
        emoji: category?.emoji || '📊',
      };
    }).sort((a, b) => b.value - a.value);
  }, [monthlyTransactions, categories]);

  const savingsProgress = useMemo(() => {
    return savingsGoals.map(goal => ({
      name: goal.name,
      current: goal.currentAmount,
      target: goal.targetAmount,
      percentage: Math.round((goal.currentAmount / goal.targetAmount) * 100),
    }));
  }, [savingsGoals]);

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500 mt-1">Ringkasan keuangan bulan ini</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-green-600 flex items-center gap-1 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-sm text-slate-500 mb-1">Total Pemasukan</h3>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalIncome)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-red-600 flex items-center gap-1 text-sm font-medium">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <h3 className="text-sm text-slate-500 mb-1">Total Pengeluaran</h3>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalExpense)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm text-slate-500 mb-1">Saldo</h3>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm text-slate-500 mb-1">Target Tabungan</h3>
          <p className="text-2xl font-bold text-slate-800">{savingsGoals.length} aktif</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Expense by Category - Pie Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Pengeluaran per Kategori</h3>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${Math.round((entry.value / totalExpense) * 100)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              Belum ada data pengeluaran
            </div>
          )}
        </div>

        {/* Savings Progress */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Progress Target Tabungan</h3>
          <div className="space-y-4">
            {savingsProgress.slice(0, 3).map((goal, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{goal.name}</span>
                  <span className="text-sm text-slate-500">{goal.percentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-slate-500">{formatCurrency(goal.current)}</span>
                  <span className="text-xs text-slate-500">{formatCurrency(goal.target)}</span>
                </div>
              </div>
            ))}
            {savingsProgress.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                Belum ada target tabungan
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Rincian Kategori</h3>
        {expenseByCategory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseByCategory.map((category, index) => (
              <div
                key={category.name}
                className="p-4 rounded-lg border-2 border-slate-100 hover:border-purple-200 transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{category.emoji}</span>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">{category.name}</h4>
                    <p className="text-xs text-slate-500">
                      {Math.round((category.value / totalExpense) * 100)}% dari total
                    </p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-slate-800">{formatCurrency(category.value)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-8">
            Belum ada data pengeluaran
          </div>
        )}
      </div>
    </div>
  );
}
