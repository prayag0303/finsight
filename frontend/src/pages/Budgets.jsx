import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatCurrency, getMonthKey } from '../utils/formatters';
import Modal from '../components/common/Modal';
import BudgetChart from '../components/charts/BudgetChart';

const CATEGORIES = [
  'Food & Dining','Rent','Utilities','Travel','Shopping',
  'Entertainment','Healthcare','Education','Investments',
  'Subscriptions','Insurance','Loan Payment','Miscellaneous',
];

const now = new Date();
const MIN_MONTH = new Date(now.getFullYear() - 2, now.getMonth(), 1).toISOString().slice(0, 7);
const MAX_MONTH = new Date(now.getFullYear(), now.getMonth() + 3, 1).toISOString().slice(0, 7);

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(getMonthKey());
  const [showModal, setShowModal] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [form, setForm] = useState({ category: CATEGORIES[0], monthlyLimit: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/budgets', { params: { month } });
      setBudgets(data.budgets || []);
    } catch { toast.error('Failed to load budgets'); }
    finally { setLoading(false); }
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.monthlyLimit || Number(form.monthlyLimit) <= 0) return toast.error('Enter a valid limit');
    setSaving(true);
    try {
      if (editBudget) {
        await api.put(`/budgets/${editBudget._id}`, { monthlyLimit: Number(form.monthlyLimit) });
        toast.success('Budget updated');
      } else {
        await api.post('/budgets', { category: form.category, monthlyLimit: Number(form.monthlyLimit), month });
        toast.success('Budget created');
      }
      setShowModal(false);
      setEditBudget(null);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      toast.success('Budget deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const openAdd = () => { setEditBudget(null); setForm({ category: CATEGORIES[0], monthlyLimit: '' }); setShowModal(true); };
  const openEdit = (b) => { setEditBudget(b); setForm({ category: b.category, monthlyLimit: b.monthlyLimit }); setShowModal(true); };

  const totalBudgeted = budgets.reduce((s, b) => s + b.monthlyLimit, 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);
  const overBudget = budgets.filter((b) => (b.spent || 0) > b.monthlyLimit).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Track spending against monthly limits</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="input" min={MIN_MONTH} max={MAX_MONTH} />
          <button onClick={openAdd} className="btn-primary">+ Budget</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Budgeted', value: formatCurrency(totalBudgeted), className: 'text-zinc-900 dark:text-zinc-100' },
          { label: 'Spent', value: formatCurrency(totalSpent), className: totalSpent > totalBudgeted ? 'text-red-600' : 'text-zinc-900 dark:text-zinc-100' },
          { label: 'Remaining', value: formatCurrency(totalBudgeted - totalSpent), className: totalBudgeted - totalSpent < 0 ? 'text-red-600' : 'text-emerald-600 dark:text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
            <p className={`text-xl font-semibold ${s.className} tracking-tight`}>{s.value}</p>
          </div>
        ))}
      </div>

      {overBudget > 0 && (
        <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-4 py-2.5">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {overBudget} {overBudget === 1 ? 'category is' : 'categories are'} over budget this month
        </div>
      )}

      {budgets.length > 0 && (
        <div className="card p-5">
          <p className="section-title mb-4">Budget vs Actual</p>
          <BudgetChart budgets={budgets} loading={loading} />
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card p-5 h-36 animate-pulse" />)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-3">No budgets set for this month</p>
          <button onClick={openAdd} className="btn-primary">Create your first budget</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const pct = b.percentUsed || 0;
            const spent = b.spent || 0;
            const isOver = pct >= 100;
            const isWarn = pct >= 80;
            const barColor = isOver ? '#ef4444' : isWarn ? '#f59e0b' : '#6366f1';
            return (
              <div key={b._id} className="card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{b.category}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Limit: {formatCurrency(b.monthlyLimit)}/mo</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(b)} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(b._id)} className="p-1 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Spent</span>
                    <span className={`font-semibold ${isOver ? 'text-red-600' : 'text-zinc-900 dark:text-zinc-100'}`}>{formatCurrency(spent)}</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: barColor }} />
                  </div>
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span style={{ color: isOver ? '#ef4444' : isWarn ? '#f59e0b' : undefined }}>
                      {isOver ? `Over by ${formatCurrency(spent - b.monthlyLimit)}` : `${pct}% used`}
                    </span>
                    <span>{formatCurrency(b.remaining)} left</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editBudget ? 'Edit Budget' : 'New Budget'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Category</label>
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="input" disabled={!!editBudget}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Monthly Limit (₹)</label>
            <input type="number" min="1" value={form.monthlyLimit} onChange={(e) => setForm((p) => ({ ...p, monthlyLimit: e.target.value }))} className="input" placeholder="5000" required />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saving…' : editBudget ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
