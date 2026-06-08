import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import { formatCurrency, formatDate, CATEGORY_COLORS } from '../../utils/formatters';
import { categorize } from '../../utils/categorize';

const CATEGORIES = [
  'Food & Dining','Rent','Utilities','Travel','Shopping',
  'Entertainment','Healthcare','Education','Salary','Investments',
  'Subscriptions','Insurance','Loan Payment','Miscellaneous',
];

const FREQUENCIES = ['weekly', 'monthly', 'quarterly', 'yearly'];

const EMPTY_FORM = {
  description: '', amount: '', type: 'debit', category: '',
  account: '', notes: '', frequency: 'monthly',
  nextDueDate: new Date().toISOString().split('T')[0],
};

const isDue = (nextDueDate) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return new Date(nextDueDate) <= today;
};

const isUpcoming = (nextDueDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in3Days = new Date(today);
  in3Days.setDate(in3Days.getDate() + 3);
  const d = new Date(nextDueDate);
  return d > today && d <= in3Days;
};

function TemplateForm({ initial = null, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(() => {
    if (!initial) return EMPTY_FORM;
    return {
      ...initial,
      nextDueDate: initial.nextDueDate
        ? new Date(initial.nextDueDate).toISOString().split('T')[0]
        : EMPTY_FORM.nextDueDate,
    };
  });
  const [categoryLocked, setCategoryLocked] = useState(!!initial?.category);
  const [autoDetected, setAutoDetected] = useState(false);

  useEffect(() => {
    if (categoryLocked) return;
    const suggested = categorize(form.description);
    if (suggested) {
      setForm((p) => ({ ...p, category: suggested }));
      setAutoDetected(true);
    } else {
      setForm((p) => ({ ...p, category: '' }));
      setAutoDetected(false);
    }
  }, [form.description, categoryLocked]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleCategoryChange = (e) => {
    setCategoryLocked(true);
    setAutoDetected(false);
    setForm((p) => ({ ...p, category: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description.trim() || !form.amount || Number(form.amount) <= 0) return;
    onSubmit({ ...form, amount: Number(form.amount) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Description</label>
        <input
          type="text" value={form.description} onChange={set('description')}
          className="input" placeholder="e.g. House Rent, Netflix, SIP…"
          required maxLength={200}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Amount (₹)</label>
          <input
            type="number" value={form.amount} onChange={set('amount')}
            className="input" placeholder="0" min="0.01" step="0.01" required
          />
        </div>
        <div>
          <label className="label">Type</label>
          <select value={form.type} onChange={set('type')} className="input">
            <option value="debit">Debit (expense)</option>
            <option value="credit">Credit (income)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <label className="label mb-0">Category</label>
            {autoDetected && (
              <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
                auto
              </span>
            )}
          </div>
          <select value={form.category} onChange={handleCategoryChange} className="input">
            <option value="">Auto-detect</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Frequency</label>
          <select value={form.frequency} onChange={set('frequency')} className="input">
            {FREQUENCIES.map((f) => (
              <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Next Due Date</label>
          <input type="date" value={form.nextDueDate} onChange={set('nextDueDate')} className="input" required />
        </div>
        <div>
          <label className="label">Account (optional)</label>
          <input type="text" value={form.account} onChange={set('account')} className="input" placeholder="e.g. HDFC Savings" />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading ? 'Saving…' : initial ? 'Update Template' : 'Create Template'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
      </div>
    </form>
  );
}

function DueBanner({ templates, onPost, onSkip, posting }) {
  const dueTemplates = templates.filter((t) => t.isActive && (isDue(t.nextDueDate) || isUpcoming(t.nextDueDate)));
  if (!dueTemplates.length) return null;

  const overdueCount = dueTemplates.filter((t) => isDue(t.nextDueDate)).length;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${overdueCount > 0 ? 'bg-amber-500' : 'bg-indigo-500'}`} />
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {overdueCount > 0
            ? `${overdueCount} recurring ${overdueCount === 1 ? 'payment' : 'payments'} due`
            : 'Upcoming recurring payments'}
        </span>
      </div>

      <div className="space-y-2">
        {dueTemplates.map((t) => {
          const overdue = isDue(t.nextDueDate);
          return (
            <div
              key={t._id}
              className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="text-xs font-medium px-1.5 py-0.5 rounded flex-shrink-0"
                  style={{
                    backgroundColor: `${CATEGORY_COLORS[t.category] || '#94a3b8'}18`,
                    color: CATEGORY_COLORS[t.category] || '#71717a',
                  }}
                >
                  {t.category}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{t.description}</p>
                  <p className={`text-xs ${overdue ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-500'}`}>
                    {overdue ? 'Due ' : 'Upcoming — '}{formatDate(t.nextDueDate)}
                    {' · '}{t.frequency}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-sm font-semibold ${t.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                  {t.type === 'credit' ? '+' : '−'}{formatCurrency(t.amount)}
                </span>
                <button
                  onClick={() => onPost(t._id)}
                  disabled={posting === t._id}
                  className="btn-primary py-1 px-2.5 text-xs"
                >
                  {posting === t._id ? '…' : 'Post'}
                </button>
                <button
                  onClick={() => onSkip(t._id)}
                  disabled={posting === t._id}
                  className="btn-secondary py-1 px-2.5 text-xs"
                >
                  Skip
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RecurringTemplates({ onTransactionPosted }) {
  const [templates, setTemplates] = useState([]);
  const [showManage, setShowManage] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [posting, setPosting] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/recurring');
      setTemplates(data.templates || []);
    } catch {
      // silently fail — recurring is supplemental
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePost = async (id) => {
    setPosting(id);
    try {
      await api.post(`/recurring/${id}/post`);
      toast.success('Transaction posted');
      await load();
      onTransactionPosted?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post');
    } finally { setPosting(null); }
  };

  const handleSkip = async (id) => {
    setPosting(id);
    try {
      await api.post(`/recurring/${id}/skip`);
      toast.success('Skipped — next due date advanced');
      await load();
    } catch {
      toast.error('Failed to skip');
    } finally { setPosting(null); }
  };

  const handleCreate = async (form) => {
    setFormLoading(true);
    try {
      await api.post('/recurring', form);
      toast.success('Recurring template created');
      setShowForm(false);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create');
    } finally { setFormLoading(false); }
  };

  const handleUpdate = async (form) => {
    setFormLoading(true);
    try {
      await api.put(`/recurring/${editingTemplate._id}`, form);
      toast.success('Template updated');
      setEditingTemplate(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recurring template?')) return;
    try {
      await api.delete(`/recurring/${id}`);
      toast.success('Template deleted');
      await load();
    } catch { toast.error('Failed to delete'); }
  };

  const toggleActive = async (t) => {
    try {
      await api.put(`/recurring/${t._id}`, { isActive: !t.isActive });
      await load();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <>
      <DueBanner templates={templates} onPost={handlePost} onSkip={handleSkip} posting={posting} />

      <div className="flex justify-end">
        <button
          onClick={() => setShowManage(true)}
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Recurring ({templates.length})
        </button>
      </div>

      {/* Manage modal */}
      <Modal isOpen={showManage} onClose={() => setShowManage(false)} title="Recurring Templates" size="lg">
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowForm(true)} className="btn-primary text-xs py-1.5 px-3">
              + New Template
            </button>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-10">
              <svg className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No recurring templates yet</p>
              <p className="text-xs text-zinc-400 mt-1">Add salary, rent, EMIs — post them in one click when due</p>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => (
                <div
                  key={t._id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    t.isActive
                      ? 'border-zinc-200 dark:border-zinc-700'
                      : 'border-zinc-100 dark:border-zinc-800 opacity-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{t.description}</p>
                      {(isDue(t.nextDueDate) || isUpcoming(t.nextDueDate)) && t.isActive && (
                        <span className="text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded flex-shrink-0">
                          {isDue(t.nextDueDate) ? 'DUE' : 'UPCOMING'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {formatCurrency(t.amount)} · {t.frequency} · next {formatDate(t.nextDueDate)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(t)}
                      title={t.isActive ? 'Pause' : 'Resume'}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                      {t.isActive ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6" />
                          <circle cx="12" cy="12" r="9" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => { setEditingTemplate(t); }}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="p-1 rounded text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* New template modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Recurring Template">
        <TemplateForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          loading={formLoading}
        />
      </Modal>

      {/* Edit template modal */}
      <Modal isOpen={!!editingTemplate} onClose={() => setEditingTemplate(null)} title="Edit Recurring Template">
        <TemplateForm
          initial={editingTemplate}
          onSubmit={handleUpdate}
          onCancel={() => setEditingTemplate(null)}
          loading={formLoading}
        />
      </Modal>
    </>
  );
}
