import { useState, useEffect, useRef } from 'react';
import { categorize } from '../../utils/categorize';

const CATEGORIES = [
  'Food & Dining','Rent','Utilities','Travel','Shopping',
  'Entertainment','Healthcare','Education','Salary','Investments',
  'Subscriptions','Insurance','Loan Payment','Miscellaneous',
];

const DEFAULT = {
  date: new Date().toISOString().split('T')[0],
  description: '', amount: '', type: 'debit',
  category: '', account: '', notes: '',
};

export default function TransactionForm({ initial = null, onSubmit, onCancel, loading = false }) {
  const [form, setForm] = useState(() => {
    if (!initial) return DEFAULT;
    return {
      ...initial,
      date: initial.date ? new Date(initial.date).toISOString().split('T')[0] : DEFAULT.date,
    };
  });

  // Track whether user manually picked a category so we don't override their choice
  const categoryLocked = useRef(!!initial?.category);
  const [autoDetected, setAutoDetected] = useState(false);

  useEffect(() => {
    if (categoryLocked.current) return;
    const suggested = categorize(form.description);
    if (suggested) {
      setForm((p) => ({ ...p, category: suggested }));
      setAutoDetected(true);
    } else {
      setForm((p) => ({ ...p, category: '' }));
      setAutoDetected(false);
    }
  }, [form.description]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleCategoryChange = (e) => {
    categoryLocked.current = true;
    setAutoDetected(false);
    setForm((p) => ({ ...p, category: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description.trim()) return;
    if (!form.amount || Number(form.amount) <= 0) return;
    onSubmit({ ...form, amount: Number(form.amount) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Date</label>
          <input type="date" value={form.date} onChange={set('date')} className="input" required />
        </div>
        <div>
          <label className="label">Type</label>
          <select value={form.type} onChange={set('type')} className="input">
            <option value="debit">Debit (expense)</option>
            <option value="credit">Credit (income)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Description</label>
        <input
          type="text"
          value={form.description}
          onChange={set('description')}
          className="input"
          placeholder="e.g. Starbucks, Salary credit…"
          required
          maxLength={200}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Amount (₹)</label>
          <input
            type="number"
            value={form.amount}
            onChange={set('amount')}
            className="input"
            placeholder="0"
            min="0.01"
            step="0.01"
            required
          />
        </div>
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
      </div>

      <div>
        <label className="label">Account (optional)</label>
        <input type="text" value={form.account} onChange={set('account')} className="input" placeholder="e.g. HDFC Savings" />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary flex-1" disabled={loading}>
          {loading ? 'Saving…' : initial ? 'Update' : 'Add Transaction'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
      </div>
    </form>
  );
}
