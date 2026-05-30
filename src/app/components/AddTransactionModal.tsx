import { useState } from 'react';
import { Category, Transaction } from '../App';
import { X, TrendingUp, TrendingDown } from 'lucide-react';

interface AddTransactionModalProps {
  categories: Category[];
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}

export default function AddTransactionModal({ categories, onAdd, onClose }: AddTransactionModalProps) {
  const [transaction, setTransaction] = useState({
    name: '',
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transaction.name && transaction.amount && transaction.category) {
      const category = categories.find(c => c.name === transaction.category);
      onAdd({
        name: transaction.name,
        amount: parseFloat(transaction.amount),
        category: transaction.category,
        type: transaction.type,
        date: transaction.date,
        emoji: category?.emoji || '📊',
      });
      onClose();
    }
  };

  const filteredCategories = categories.filter(c => c.type === transaction.type);

  const selectedCategory = categories.find(c => c.name === transaction.category);
  const formattedAmount = transaction.amount ? parseFloat(transaction.amount).toLocaleString('id-ID') : '0';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Tambah Transaksi Baru</h2>
            <p className="text-slate-500 mt-1">Catat pemasukan atau pengeluaran Anda</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Tipe Transaksi</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTransaction({ ...transaction, type: 'income', category: '' })}
                    className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all ${
                      transaction.type === 'income'
                        ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 shadow-md'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400'
                    }`}
                  >
                    <TrendingUp className="w-6 h-6" />
                    <span className="font-semibold text-lg">Pemasukan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransaction({ ...transaction, type: 'expense', category: '' })}
                    className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all ${
                      transaction.type === 'expense'
                        ? 'border-red-500 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 shadow-md'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400'
                    }`}
                  >
                    <TrendingDown className="w-6 h-6" />
                    <span className="font-semibold text-lg">Pengeluaran</span>
                  </button>
                </div>
              </div>

              {/* Name and Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nama Transaksi
                  </label>
                  <input
                    type="text"
                    value={transaction.name}
                    onChange={(e) => setTransaction({ ...transaction, name: e.target.value })}
                    placeholder="e.g. Makan Siang, Gaji Bulanan"
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Jumlah (IDR)
                  </label>
                  <input
                    type="number"
                    value={transaction.amount}
                    onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
                    placeholder="0"
                    min="0"
                    step="1000"
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Category and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={transaction.category}
                    onChange={(e) => setTransaction({ ...transaction, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {filteredCategories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.emoji} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={transaction.date}
                    onChange={(e) => setTransaction({ ...transaction, date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Category Grid */}
              {filteredCategories.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Pilih Cepat Kategori
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {filteredCategories.slice(0, 8).map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setTransaction({ ...transaction, category: category.name })}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          transaction.category === category.name
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-3xl">{category.emoji}</span>
                        <span className="text-xs font-medium text-slate-700 text-center">{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Preview */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border-2 border-slate-200 sticky top-6">
                <h3 className="text-sm font-semibold text-slate-600 mb-4 uppercase tracking-wide">Preview</h3>

                {/* Preview Card */}
                <div className={`bg-white rounded-xl p-6 shadow-lg border-2 ${
                  transaction.type === 'income' ? 'border-green-200' : 'border-red-200'
                }`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {selectedCategory?.emoji || '📊'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 text-lg">
                        {transaction.name || 'Nama Transaksi'}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {transaction.category || 'Pilih Kategori'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-t border-slate-200">
                      <span className="text-sm text-slate-600">Tipe</span>
                      <span className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-t border-slate-200">
                      <span className="text-sm text-slate-600">Tanggal</span>
                      <span className="font-semibold text-slate-800">
                        {new Date(transaction.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-t-2 border-slate-300">
                      <span className="text-sm text-slate-600">Jumlah</span>
                      <span className={`text-2xl font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}Rp {formattedAmount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800">
                    💡 <span className="font-semibold">Tips:</span> Pastikan semua data sudah benar sebelum menyimpan transaksi.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-slate-200">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all font-semibold text-lg"
            >
              Simpan Transaksi
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors font-semibold text-lg"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
