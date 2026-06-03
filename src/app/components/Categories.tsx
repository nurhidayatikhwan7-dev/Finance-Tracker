import { useState } from 'react';
import { Category } from '../App';
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown } from 'lucide-react';
import Swal from 'sweetalert2';

interface CategoriesProps {
  categories: Category[];
  onAdd: (category: Omit<Category, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<Category>) => void; // 👈 Terkunci aman di interface
  onDelete: (id: string) => void;
}

export default function Categories({ categories, onAdd, onUpdate, onDelete }: CategoriesProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    emoji: '📁',
    type: 'expense' as 'income' | 'expense',
  });

  // State untuk menampung perubahan data saat edit inline
  const [editCategory, setEditCategory] = useState({
    name: '',
    emoji: '',
    type: 'expense' as 'income' | 'expense',
  });

  const emojiOptions = [
    '📁', '💰', '🍔', '🎮', '🚗', '🧺', '🛍️', '📄', '🍎', '✈️',
    '🏠', '💻', '📱', '⌚', '🎓', '🏥', '🎬', '🎵', '⚽', '🎨',
  ];

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      Swal.fire({
        title: 'Kolom Kosong!',
        text: 'Nama kategori wajib diisi ya!',
        icon: 'warning',
        confirmButtonColor: '#3b82f6',
        background: '#ffffff',
        customClass: { title: 'text-slate-800 font-bold', popup: 'rounded-xl' }
      });
      return;
    }

    onAdd(newCategory);
    setNewCategory({ name: '', emoji: '📁', type: 'expense' });
    setShowAddForm(false);
  };

  // 🛡️ Menjaga data kosong masuk ke database cloud MySQL
  const handleUpdateCategory = (id: string) => {
    if (!editCategory.name.trim()) {
      Swal.fire({
        title: 'Kolom Kosong!',
        text: 'Nama kategori tidak boleh dikosongkan!',
        icon: 'warning',
        confirmButtonColor: '#3b82f6',
        background: '#ffffff',
        customClass: { title: 'text-slate-800 font-bold', popup: 'rounded-xl' }
      });
      return;
    }

    onUpdate(id, editCategory);
    setEditingId(null);
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditCategory({
      name: category.name,
      emoji: category.emoji,
      type: category.type,
    });
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  // Logic render dinamis untuk mengubah kartu menjadi form edit inline
  const renderCategoryCard = (category: Category, borderColorClass: string, textColors: string) => {
    if (editingId === category.id) {
      return (
        <div key={category.id} className="bg-white rounded-xl p-4 shadow-sm border-2 border-blue-400 transition-all">
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={editCategory.name}
                onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <div className="flex gap-1 flex-wrap bg-slate-50 p-1.5 rounded-lg border">
                {emojiOptions.slice(0, 10).map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setEditCategory({ ...editCategory, emoji })}
                    className={`text-lg px-1 rounded transition-all ${editCategory.emoji === emoji ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateCategory(category.id)}
                className="flex-1 text-xs py-1.5 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition-colors"
              >
                Simpan
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="flex-1 text-xs py-1.5 bg-slate-200 text-slate-700 rounded-md font-medium hover:bg-slate-300 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={category.id}
        className={`bg-white rounded-xl p-4 shadow-sm border-2 ${borderColorClass} hover:shadow-md transition-all group`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-slate-50 border rounded-lg flex items-center justify-center text-2xl`}>
              {category.emoji}
            </div>
            <div>
              <h4 className="font-medium text-slate-800">{category.name}</h4>
              <p className={`text-xs ${textColors} capitalize`}>{category.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</p>
            </div>
          </div>
          
          {/* 🛠️ SINKRONISASI TOMBOL AKSI EDIT (PENSIL) DAN DELETE (TEMPAT SAMPAH) */}
          <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-all">
            <button
              onClick={() => startEdit(category)}
              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(category.id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

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
          {incomeCategories.map((category) => renderCategoryCard(category, 'border-green-200', 'text-green-600'))}
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
          {expenseCategories.map((category) => renderCategoryCard(category, 'border-red-200', 'text-red-600'))}
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