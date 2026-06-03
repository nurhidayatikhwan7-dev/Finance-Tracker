import { useState } from 'react';
import { Category } from '../App';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface CategoriesProps {
  categories: Category[];
  onAdd: (category: Omit<Category, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Category>) => void;
  onDelete: (id: string) => void;
}

export default function Categories({ categories, onAdd, onDelete }: CategoriesProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    emoji: '📁',
    type: 'expense' as 'income' | 'expense',
  });

  const handleAddCategory = () => {
    if (newCategory.name) {
      onAdd({
        name: newCategory.name,
        emoji: newCategory.emoji,
        type: newCategory.type,
      });
      setNewCategory({ name: '', emoji: '📁', type: 'expense' });
      setShowAddForm(false);
    }
  };

  const emojiOptions = [
    '📁', '💰', '🍔', '🎮', '🚗', '🧺', '🛍️', '📄', '🍎', '✈️',
    '🏠', '💻', '📱', '⌚', '🎓', '🏥', '🎬', '🎵', '⚽', '🎨',
  ];

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Kategori</h2>
          <p className="text-slate-500 mt-1">Kelola kategori pemasukan dan pengeluaran</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Tambah Kategori
        </button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Tambah Kategori Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nama Kategori</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="e.g. Groceries"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipe</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setNewCategory({ ...newCategory, type: 'income' })}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    newCategory.type === 'income'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Pemasukan
                </button>
                <button
                  onClick={() => setNewCategory({ ...newCategory, type: 'expense' })}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    newCategory.type === 'expense'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  Pengeluaran
                </button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Pilih Emoji</label>
              <div className="flex gap-2 flex-wrap">
                {emojiOptions.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setNewCategory({ ...newCategory, emoji })}
                    className={`w-12 h-12 rounded-lg text-2xl ${
                      newCategory.emoji === emoji
                        ? 'bg-blue-100 ring-2 ring-blue-500'
                        : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddCategory}
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

      {/* Income Categories */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="text-xl font-semibold text-slate-800">Kategori Pemasukan</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {incomeCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl p-4 shadow-sm border-2 border-green-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                    {category.emoji}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">{category.name}</h4>
                    <p className="text-xs text-green-600">Pemasukan</p>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(category.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {incomeCategories.length === 0 && (
            <div className="col-span-full bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center text-slate-400">
              Belum ada kategori pemasukan
            </div>
          )}
        </div>
      </div>

      {/* Expense Categories */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-red-600" />
          <h3 className="text-xl font-semibold text-slate-800">Kategori Pengeluaran</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {expenseCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl p-4 shadow-sm border-2 border-red-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-2xl">
                    {category.emoji}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">{category.name}</h4>
                    <p className="text-xs text-red-600">Pengeluaran</p>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(category.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {expenseCategories.length === 0 && (
            <div className="col-span-full bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center text-slate-400">
              Belum ada kategori pengeluaran
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
