import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../utils/formatters';
import Modal from '../components/common/Modal';

const EMPTY = { name: '', targetAmount: '', currentAmount: '0', targetDate: '', description: '' };

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [contributeGoal, setContributeGoal] = useState(null);
  const [contribution, setContribution] = useState({ amount: '', note: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/goals');
      setGoals(data.goals || []);
    } catch { toast.error('Failed to load goals'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, targetAmount: Number(form.targetAmount), currentAmount: Number(form.currentAmount) };
      if (editGoal) {
        await api.put(`/goals/${editGoal._id}`, payload);
        toast.success('Goal updated');
      } else {
        await api.post('/goals', payload);
        toast.success('Goal created');
      }
      setShowModal(false); setEditGoal(null);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    if (!contribution.amount || Number(contribution.amount) <= 0) return toast.error('Enter a valid amount');
    setSaving(true);
    try {
      await api.post(`/goals/${contributeGoal._id}/contribute`, { amount: Number(contribution.amount), note: contribution.note });
      toast.success('Contribution added');
      setContributeGoal(null);
      setContribution({ amount: '', note: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try { await api.delete(`/goals/${id}`); toast.success('Goal deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const openEdit = (g) => {
    setEditGoal(g);
    setForm({
      name: g.name,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      targetDate: g.targetDate ? new Date(g.targetDate).toISOString().split('T')[0] : '',
      description: g.description || '',
    });
    setShowModal(true);
  };

  const monthsUntil = (dateStr) => {
    if (!dateStr) return 0;
    const d = new Date(dateStr);
    const n = new Date();
    return Math.max(1, (d.getFullYear() - n.getFullYear()) * 12 + (d.getMonth() - n.getMonth()));
  };

  const completed = goals.filter((g) => g.isCompleted).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{goals.length} goals · {completed} completed</p>
        </div>
        <button onClick={() => { setEditGoal(null); setForm(EMPTY); setShowModal(true); }} className="btn-primary">+ New Goal</button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card p-5 h-48 animate-pulse" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-3">No savings goals yet</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">Create your first goal</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);
            const months = monthsUntil(g.targetDate);
            const monthlyNeeded = remaining > 0 ? Math.ceil(remaining / months) : 0;
            const daysLeft = Math.ceil((new Date(g.targetDate) - new Date()) / 86400000);
            return (
              <div key={g._id} className={`card p-5 ${g.isCompleted ? 'ring-1 ring-emerald-500' : ''}`}>
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{g.name}</p>
                  <div className="flex gap-1 ml-2 flex-shrink-0">
                    <button onClick={() => openEdit(g)} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(g._id)} className="p-1 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                {g.description && <p className="text-xs text-zinc-500 mb-3">{g.description}</p>}

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>{formatCurrency(g.currentAmount)} saved</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{pct}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all duration-700 ${g.isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Target: {formatCurrency(g.targetAmount)}</span>
                    {g.isCompleted ? (
                      <span className="text-emerald-500 font-medium">Completed</span>
                    ) : (
                      <span className={daysLeft < 30 ? 'text-red-500' : ''}>{daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}</span>
                    )}
                  </div>
                </div>

                {!g.isCompleted && (
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <div>
                      <p className="text-xs text-zinc-500">Monthly needed</p>
                      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{formatCurrency(monthlyNeeded)}</p>
                    </div>
                    <button onClick={() => setContributeGoal(g)} className="btn-primary py-1 px-3 text-xs">Add funds</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editGoal ? 'Edit Goal' : 'New Goal'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Goal Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input" placeholder="e.g. Emergency Fund" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Target Amount (₹)</label>
              <input type="number" min="1" value={form.targetAmount} onChange={(e) => setForm((p) => ({ ...p, targetAmount: e.target.value }))} className="input" placeholder="100000" required />
            </div>
            <div>
              <label className="label">Already Saved (₹)</label>
              <input type="number" min="0" value={form.currentAmount} onChange={(e) => setForm((p) => ({ ...p, currentAmount: e.target.value }))} className="input" placeholder="0" />
            </div>
          </div>
          <div>
            <label className="label">Target Date</label>
            <input type="date" value={form.targetDate} onChange={(e) => setForm((p) => ({ ...p, targetDate: e.target.value }))} className="input" required min={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="input resize-none" rows={2} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saving…' : editGoal ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!contributeGoal} onClose={() => setContributeGoal(null)} title={`Add funds to "${contributeGoal?.name}"`}>
        <form onSubmit={handleContribute} className="space-y-4">
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 text-sm">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Saved so far</span><span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(contributeGoal?.currentAmount)}</span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400 mt-1">
              <span>Still needed</span><span className="font-medium text-indigo-600">{formatCurrency(Math.max(0, (contributeGoal?.targetAmount || 0) - (contributeGoal?.currentAmount || 0)))}</span>
            </div>
          </div>
          <div>
            <label className="label">Amount (₹)</label>
            <input type="number" min="1" value={contribution.amount} onChange={(e) => setContribution((p) => ({ ...p, amount: e.target.value }))} className="input" placeholder="5000" required autoFocus />
          </div>
          <div>
            <label className="label">Note (optional)</label>
            <input type="text" value={contribution.note} onChange={(e) => setContribution((p) => ({ ...p, note: e.target.value }))} className="input" placeholder="e.g. Monthly savings" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1" disabled={saving}>{saving ? 'Saving…' : 'Add Contribution'}</button>
            <button type="button" onClick={() => setContributeGoal(null)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
