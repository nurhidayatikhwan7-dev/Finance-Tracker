import { useState } from 'react';
import { SavingsGoal } from '../App';
import { Plus, Edit2, Trash2, TrendingUp, Calendar, Target } from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import Swal from 'sweetalert2'; // 🛡️ Tambahkan import SweetAlert2

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onAdd: (goal: Omit<SavingsGoal, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<SavingsGoal>) => void;
  onDelete: (id: string) => void;
}

export default function SavingsGoals({ goals, onAdd, onUpdate, onDelete }: SavingsGoalsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    emoji: '🎯',
    deadline: '',
  });
  const [editGoal, setEditGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    emoji: '',
    deadline: '',
  });
  const [addAmount, setAddAmount] = useState<{ [key: string]: string }>({});

  // 🛡️ VALIDASI UNTUK TAMBAH TARGET BARU
  const handleAddGoal = () => {
    if (!newGoal.name.trim() || !newGoal.targetAmount || !newGoal.deadline) {
      Swal.fire({
        title: 'Kolom Belum Lengkap!',
        text: 'Semua kolom (Nama, Target Jumlah, dan Deadline) wajib diisi ya!',
        icon: 'warning',
        confirmButtonColor: '#3b82f6',
        background: '#ffffff',
        customClass: { title: 'text-slate-800 font-bold', popup: 'rounded-xl' }
      });
      return; // Stop eksekusi agar tidak mengirim data kosong ke MySQL
    }

    onAdd({
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount || '0'),
      emoji: newGoal.emoji,
      deadline: newGoal.deadline,
    });
    setNewGoal({ name: '', targetAmount: '', currentAmount: '', emoji: '🎯', deadline: '' });
    setShowAddForm(false);
  };

  // 🛡️ VALIDASI UNTUK EDIT TARGET LAMA
  const handleUpdateGoal = (id: string) => {
    if (!editGoal.name.trim() || !editGoal.targetAmount || !editGoal.deadline) {
      Swal.fire({
        title: 'Kolom Tidak Boleh Kosong!',
        text: 'Nama, Target, dan Deadline harus tetap terisi ya!',
        icon: 'warning',
        confirmButtonColor: '#3b82f6',
        background: '#ffffff',
        customClass: { title: 'text-slate-800 font-bold', popup: 'rounded-xl' }
      });
      return; // Stop eksekusi jika kolom dikosongkan saat edit
    }

    onUpdate(id, {
      name: editGoal.name,
      targetAmount: parseFloat(editGoal.targetAmount),
      currentAmount: parseFloat(editGoal.currentAmount),
      emoji: editGoal.emoji,
      deadline: editGoal.deadline,
    });
    setEditingId(null);
  };

  const startEdit = (goal: SavingsGoal) => {
    setEditingId(goal.id);
    setEditGoal({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      emoji: goal.emoji,
      deadline: goal.deadline,
    });
  };

  const handleAddMoney = (goalId: string) => {
    const amount = parseFloat(addAmount[goalId] || '0');
    if (amount > 0) {
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        onUpdate(goalId, { currentAmount: goal.currentAmount + amount });
        setAddAmount({ ...addAmount, [goalId]: '' });
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysRemaining = (deadline: string) => {
    return differenceInDays(new Date(deadline), new Date());
  };

  const emojiOptions = ['🎯', '🏖️', '💻', '🚗', '🏠', '✈️', '🎓', '💰', '🚨', '🎮', '📱', '⌚'];

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Target Tabungan</h2>
          <p className="text-slate-500 mt-1">Atur dan pantau progress target tabungan Anda</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Tambah Target
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm text-slate-500">Total Tabungan</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalSaved)}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm text-slate-500">Total Target</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalTarget)}</p>
          <p className="text-sm text-slate-500 mt-1">
            {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}% tercapai
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-sm text-slate-500">Target Tercapai</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {completedGoals} / {goals.length}
          </p>
        </div>
      </div>

      {/* Add Goal Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Tambah Target Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nama Target</label>
              <input
                type="text"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                placeholder="e.g. Liburan Bali"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Emoji</label>
              <div className="flex gap-2 flex-wrap">
                {emojiOptions.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setNewGoal({ ...newGoal, emoji })}
                    className={`w-10 h-10 rounded-lg text-xl ${
                      newGoal.emoji === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Jumlah</label>
              <input
                type="number"
                value={newGoal.targetAmount}
                onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Jumlah Saat Ini (Opsional)</label>
              <input
                type="number"
                value={newGoal.currentAmount}
                onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Deadline</label>
              <input
                type="date"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddGoal}
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

      {/* Goals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const isCompleted = goal.currentAmount >= goal.targetAmount;
          const daysRemaining = getDaysRemaining(goal.deadline);

          return (
            <div
              key={goal.id}
              className={`bg-white rounded-xl p-6 shadow-sm border-2 ${
                isCompleted ? 'border-green-300' : 'border-slate-200'
              } hover:shadow-md transition-all`}
            >
              {editingId === goal.id ? (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nama</label>
                    <input
                      type="text"
                      value={editGoal.name}
                      onChange={(e) => setEditGoal({ ...editGoal, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Target</label>
                    <input
                      type="number"
                      value={editGoal.targetAmount}
                      onChange={(e) => setEditGoal({ ...editGoal, targetAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Saat Ini</label>
                    <input
                      type="number"
                      value={editGoal.currentAmount}
                      onChange={(e) => setEditGoal({ ...editGoal, currentAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Deadline</label>
                    <input
                      type="date"
                      value={editGoal.deadline ? editGoal.deadline.split('T')[0] : ''}
                      onChange={(e) => setEditGoal({ ...editGoal, deadline: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateGoal(goal.id)}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center text-3xl">
                        {goal.emoji}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">{goal.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(goal.deadline), 'dd MMM yyyy')}
                          <span className="ml-1">
                            ({daysRemaining > 0 ? `${daysRemaining} hari lagi` : 'Expired'})
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(goal)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(goal.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-sm text-slate-500">Progress</span>
                      <span className="text-2xl font-bold text-slate-800">
                        {Math.round(percentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCompleted
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-500">Terkumpul</span>
                      <span className="text-lg font-semibold text-green-600">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Target</span>
                      <span className="text-sm text-slate-600">
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Sisa</span>
                      <span className="font-semibold text-slate-800">
                        {formatCurrency(goal.targetAmount - goal.currentAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Add Money */}
                  {!isCompleted && (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={addAmount[goal.id] || ''}
                        onChange={(e) => setAddAmount({ ...addAmount, [goal.id]: e.target.value })}
                        placeholder="Tambah uang"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleAddMoney(goal.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Tambah
                      </button>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-center gap-2 text-green-700">
                      <Target className="w-5 h-5" />
                      <span className="font-medium">Target Tercapai! 🎉</span>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full bg-white rounded-xl p-12 shadow-sm border border-slate-200 text-center">
            <p className="text-slate-400 text-lg">Belum ada target tabungan</p>
            <p className="text-slate-400 text-sm mt-2">Klik tombol "Tambah Target" untuk mulai</p>
          </div>
        )}
      </div>
    </div>
  );
}