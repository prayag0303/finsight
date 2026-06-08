import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionForm from '../components/transactions/TransactionForm';
import CSVUpload from '../components/transactions/CSVUpload';
import RecurringTemplates from '../components/transactions/RecurringTemplates';
import Modal from '../components/common/Modal';

const CATEGORIES = [
  'Food & Dining','Rent','Utilities','Travel','Shopping',
  'Entertainment','Healthcare','Education','Salary','Investments',
  'Subscriptions','Insurance','Loan Payment','Miscellaneous',
];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', category: '', type: '', startDate: '', endDate: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [showCSV, setShowCSV] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 20, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get('/transactions', { params });
      setTransactions(data.transactions || []);
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
    } catch {
      setError('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (form) => {
    setSaving(true);
    try {
      await api.post('/transactions', form);
      toast.success('Transaction added');
      setShowAdd(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add');
    } finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await api.put(`/transactions/${editing._id}`, form);
      toast.success('Transaction updated');
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success('Deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const setFilter = (key, val) => {
    setFilters((p) => ({ ...p, [key]: val }));
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{pagination.total} total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCSV(true)} className="btn-secondary">Import CSV</button>
          <button onClick={() => setShowAdd(true)} className="btn-primary">+ Add</button>
        </div>
      </div>

      <RecurringTemplates onTransactionPosted={load} />

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <input
            type="text" placeholder="Search…" value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="input sm:col-span-1"
          />
          <select value={filters.category} onChange={(e) => setFilter('category', e.target.value)} className="input">
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.type} onChange={(e) => setFilter('type', e.target.value)} className="input">
            <option value="">All types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <input type="date" value={filters.startDate} onChange={(e) => setFilter('startDate', e.target.value)} className="input" />
          <input type="date" value={filters.endDate} onChange={(e) => setFilter('endDate', e.target.value)} className="input" />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {error ? (
          <div className="p-8 text-center text-sm text-red-500">{error} <button onClick={load} className="text-indigo-500 underline ml-1">Retry</button></div>
        ) : (
          <>
            <TransactionTable transactions={transactions} loading={loading} onEdit={setEditing} onDelete={handleDelete} />
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-xs text-zinc-500">Page {pagination.page} of {pagination.pages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="btn-secondary py-1 px-2.5 text-xs">← Prev</button>
                  <button onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.pages} className="btn-secondary py-1 px-2.5 text-xs">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Transaction">
        <TransactionForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} loading={saving} />
      </Modal>
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Transaction">
        <TransactionForm initial={editing} onSubmit={handleEdit} onCancel={() => setEditing(null)} loading={saving} />
      </Modal>
      <Modal isOpen={showCSV} onClose={() => setShowCSV(false)} title="Import CSV">
        <CSVUpload onSuccess={load} onClose={() => setShowCSV(false)} />
      </Modal>
    </div>
  );
}
