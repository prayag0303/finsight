import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatPercent, getMonthKey, CATEGORY_COLORS } from '../utils/formatters';
import StatsCard from '../components/common/StatsCard';
import SpendingTrendChart from '../components/charts/SpendingTrendChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart';
import TransactionTable from '../components/transactions/TransactionTable';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, trendRes, txRes] = await Promise.all([
        api.get('/transactions/stats/overview', { params: { month: selectedMonth } }),
        api.get('/transactions/stats/trend', { params: { months: 6 } }),
        api.get('/transactions', { params: { limit: 8, startDate: `${selectedMonth}-01` } }),
      ]);
      setStats(statsRes.data);
      setTrend(trendRes.data.trend || []);
      setRecent(txRes.data.transactions || []);
    } catch {
      setError('Failed to load data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => { load(); }, [load]);

  const categoryData = stats
    ? Object.entries(stats.categoryBreakdown || {})
        .map(([name, val]) => ({ name, value: typeof val === 'object' ? val.total : val }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value)
    : [];

  const totalExpenses = stats?.totalExpenses || 1;
  const hasData = !loading && ((stats?.totalIncome || 0) + (stats?.totalExpenses || 0)) > 0;
  const isEmpty = !loading && !error && !hasData;

  const monthLabel = new Date(`${selectedMonth}-01`).toLocaleString('default', { month: 'long', year: 'numeric' });
  const firstName = user?.name?.split(' ')[0] || 'there';

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-sm text-red-500 mb-3">{error}</p>
        <button onClick={load} className="btn-secondary">Try again</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="page-title">{getGreeting()}, {firstName}</h1>
          <p className="page-subtitle">Here's your financial snapshot for <span className="font-medium text-zinc-700 dark:text-zinc-300">{monthLabel}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input text-sm max-w-[160px]"
            max={getMonthKey()}
          />
          <button onClick={load} className="btn-secondary px-2.5" title="Refresh data">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200">No data for {monthLabel}</p>
          <p className="text-sm text-zinc-500 mt-1.5 mb-5">Import your bank statement or add transactions manually to get started.</p>
          <div className="flex items-center justify-center gap-2">
            <Link to="/transactions" className="btn-primary">Import CSV</Link>
            <button
              onClick={() => setSelectedMonth(trend.length > 0 ? trend[trend.length - 1].month : getMonthKey())}
              className="btn-secondary"
            >
              Go to latest month
            </button>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Total Income"   value={formatCurrency(stats?.totalIncome)}   type="income"  loading={loading} />
        <StatsCard title="Total Expenses" value={formatCurrency(stats?.totalExpenses)} type="expense" loading={loading} />
        <StatsCard
          title="Net Savings"
          value={formatCurrency(stats?.netSavings)}
          type="savings"
          subtitle={(stats?.netSavings ?? 0) < 0 ? 'Spending more than earning' : undefined}
          loading={loading}
        />
        <StatsCard
          title="Savings Rate"
          value={formatPercent(stats?.savingsRate)}
          type="rate"
          subtitle="of income saved this month"
          loading={loading}
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="section-title">6-Month Trend</p>
              <p className="text-xs text-zinc-500 mt-0.5">Income vs spending over time</p>
            </div>
          </div>
          <SpendingTrendChart data={trend} loading={loading} />
        </div>
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4">
            <p className="section-title">Spending Breakdown</p>
            <p className="text-xs text-zinc-500 mt-0.5">{monthLabel}</p>
          </div>
          {isEmpty ? (
            <div className="h-48 flex items-center justify-center text-sm text-zinc-400">No data for this month</div>
          ) : (
            <CategoryPieChart data={categoryData} loading={loading} />
          )}
        </div>
      </div>

      {/* Income vs Expenses bar chart */}
      <div className="card p-5">
        <div className="mb-4">
          <p className="section-title">Income vs Expenses</p>
          <p className="text-xs text-zinc-500 mt-0.5">Last 6 months comparison</p>
        </div>
        <IncomeExpenseChart data={trend} loading={loading} />
      </div>

      {/* Top categories */}
      {hasData && categoryData.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="section-title">Top Spending Categories</p>
              <p className="text-xs text-zinc-500 mt-0.5">{monthLabel}</p>
            </div>
            <Link to="/budgets" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Set budgets →</Link>
          </div>
          <div className="space-y-3.5">
            {categoryData.slice(0, 6).map((cat, i) => {
              const pct = Math.round((cat.value / totalExpenses) * 100);
              const color = CATEGORY_COLORS[cat.name] || '#6366f1';
              return (
                <div key={cat.name} className="flex items-center gap-3 group">
                  <span className="text-xs text-zinc-400 w-4 text-right flex-shrink-0 tabular-nums">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">{cat.name}</span>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 ml-4 flex-shrink-0 tabular-nums">{formatCurrency(cat.value)}</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400 w-8 text-right flex-shrink-0 tabular-nums">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <p className="section-title">Recent Transactions</p>
            <p className="text-xs text-zinc-500 mt-0.5">{monthLabel}</p>
          </div>
          <Link to="/transactions" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View all →
          </Link>
        </div>
        {isEmpty ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-zinc-400">No transactions for this month.</p>
            <Link to="/transactions" className="text-xs text-indigo-500 hover:underline mt-1 inline-block">
              Import or add transactions
            </Link>
          </div>
        ) : (
          <TransactionTable transactions={recent} loading={loading} />
        )}
      </div>
    </div>
  );
}
