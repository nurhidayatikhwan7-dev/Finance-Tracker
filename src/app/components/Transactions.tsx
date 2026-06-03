import { useState, useMemo } from 'react';
import { Transaction, Category } from '../App';
import { Search, Filter, Trash2, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
}

export default function Transactions({ transactions, categories, onDelete }: TransactionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchQuery, filterType, selectedCategory]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};

    filteredTransactions.forEach(transaction => {
      const date = format(new Date(transaction.date), 'dd MMM yyyy');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });

    return groups;
  }, [filteredTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

 const totalIncome = useMemo(() => {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => {
      const amt = Number(t.amount);
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);
}, [transactions]);

const totalExpense = useMemo(() => {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => {
      const amt = Number(t.amount);
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);
}, [transactions]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Transaksi</h2>
        <p className="text-slate-500 mt-1">Kelola semua transaksi Anda</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm opacity-90">Total Transaksi</h3>
            <Calendar className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-3xl font-bold">{filteredTransactions.length}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm opacity-90">Total Pemasukan</h3>
            <TrendingUp className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(totalIncome)}</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm opacity-90">Total Pengeluaran</h3>
            <TrendingDown className="w-5 h-5 opacity-75" />
          </div>
          <p className="text-3xl font-bold">{formatCurrency(totalExpense)}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filter
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipe</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua</option>
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Kategori</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.emoji} {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {Object.entries(groupedTransactions).length > 0 ? (
          <div className="divide-y divide-slate-200">
            {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
              <div key={date} className="p-6">
                <h3 className="text-sm font-semibold text-slate-500 mb-4">{date}</h3>
                <div className="space-y-3">
                  {dayTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-2xl">
                        {transaction.emoji}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">{transaction.name}</h4>
                        <p className="text-sm text-slate-500">{transaction.category}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                      </div>
                      <button
                        onClick={() => onDelete(transaction.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <p className="text-lg">Tidak ada transaksi ditemukan</p>
            <p className="text-sm mt-2">Coba ubah filter atau tambahkan transaksi baru</p>
          </div>
        )}
      </div>
    </div>
  );
}
