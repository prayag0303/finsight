import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate, CATEGORY_COLORS } from '../utils/formatters';
import ForecastChart from '../components/charts/ForecastChart';

const TABS = ['Cash Flow', 'What-If Simulator', 'Anomalies', 'Subscriptions', 'Recurring'];

const ADJUSTABLE = ['Food & Dining', 'Travel', 'Shopping', 'Entertainment', 'Utilities', 'Healthcare'];

export default function Forecasts() {
  const [tab, setTab] = useState(0);
  const [months, setMonths] = useState(6);
  const [forecast, setForecast] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [subscriptions, setSubscriptions] = useState(null);
  const [recurring, setRecurring] = useState(null);
  const [categoryStats, setCategoryStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simAdj, setSimAdj] = useState(() => Object.fromEntries(ADJUSTABLE.map((k) => [k, 0])));

  const fetchForecast = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/forecasts/cashflow', { params: { months } });
      setForecast(data);
    } catch { toast.error('Failed to load forecast'); }
    finally { setLoading(false); }
  }, [months]);

  const fetchAnomalies = useCallback(async () => {
    if (anomalies) return;
    setLoading(true);
    try { const { data } = await api.get('/forecasts/anomalies'); setAnomalies(data); }
    catch { toast.error('Failed to load anomalies'); }
    finally { setLoading(false); }
  }, [anomalies]);

  const fetchSubs = useCallback(async () => {
    if (subscriptions) return;
    setLoading(true);
    try { const { data } = await api.get('/forecasts/subscriptions'); setSubscriptions(data); }
    catch { toast.error('Failed to load subscriptions'); }
    finally { setLoading(false); }
  }, [subscriptions]);

  const fetchRecurring = useCallback(async () => {
    if (recurring) return;
    setLoading(true);
    try { const { data } = await api.get('/forecasts/recurring'); setRecurring(data); }
    catch { toast.error('Failed to load recurring'); }
    finally { setLoading(false); }
  }, [recurring]);

  const fetchCategoryStats = useCallback(async () => {
    if (categoryStats) return;
    try {
      const { data } = await api.get('/transactions/stats/overview');
      setCategoryStats(data);
    } catch { /* silent */ }
  }, [categoryStats]);

  useEffect(() => {
    if (tab === 0) fetchForecast();
    else if (tab === 1) fetchCategoryStats();
    else if (tab === 2) fetchAnomalies();
    else if (tab === 3) fetchSubs();
    else if (tab === 4) fetchRecurring();
  }, [tab, months]);

  // Simulator: apply % adjustments to each category's known spending
  const simResult = (() => {
    if (tab !== 1) return null;
    const breakdown = categoryStats?.categoryBreakdown || {};

    // Base monthly averages from history
    const hist = forecast?.historical || [];
    const last3 = hist.slice(-3);
    if (last3.length === 0) return null;
    const avgIncome = last3.reduce((s, m) => s + m.income, 0) / last3.length;
    const avgExpense = last3.reduce((s, m) => s + m.expenses, 0) / last3.length;

    // Apply adjustments category by category
    let expenseAdj = avgExpense;
    ADJUSTABLE.forEach((cat) => {
      const catSpend = breakdown[cat]?.total || 0;
      const catFraction = avgExpense > 0 ? catSpend / avgExpense : 0;
      const pctChange = simAdj[cat] / 100;
      expenseAdj += avgExpense * catFraction * pctChange;
    });

    expenseAdj = Math.max(0, expenseAdj);
    const newSavings = avgIncome - expenseAdj;
    const oldSavings = avgIncome - avgExpense;
    return {
      currentExpense: Math.round(avgExpense),
      newExpense: Math.round(expenseAdj),
      currentSavings: Math.round(oldSavings),
      newSavings: Math.round(newSavings),
      change: Math.round(newSavings - oldSavings),
      annual: Math.round((newSavings - oldSavings) * 12),
    };
  })();

  const Loader = () => (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Forecasts & Insights</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Predictions, anomalies, and spending analysis</p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === i
                ? 'bg-indigo-600 text-white'
                : 'border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab 0: Cash Flow */}
      {tab === 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500">Horizon:</label>
            {[3, 6].map((m) => (
              <button key={m} onClick={() => setMonths(m)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${months === m ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
                {m} months
              </button>
            ))}
          </div>
          <div className="card p-5">
            <p className="section-title mb-4">Cash Flow Forecast</p>
            {loading ? <div className="h-72 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" /> : (
              <ForecastChart historical={forecast?.historical || []} forecast={forecast?.forecast || []} />
            )}
          </div>
          {forecast?.forecast?.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {forecast.forecast.slice(0, 3).map((m) => (
                <div key={m.month} className="card p-4">
                  <p className="text-xs font-medium text-zinc-500 mb-2.5">{m.label}</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-zinc-500">Income</span><span className="text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(m.income)}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Expenses</span><span className="text-red-500 font-medium">{formatCurrency(m.expenses)}</span></div>
                    <div className="flex justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">Net</span>
                      <span className={`font-semibold ${m.net >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-500'}`}>{formatCurrency(m.net)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 1: What-If Simulator */}
      {tab === 1 && (
        <div className="space-y-4">
          <div className="card p-5">
            <p className="section-title mb-1">What-If Simulator</p>
            <p className="text-xs text-zinc-500 mb-5">Adjust spending per category and see the projected impact on your savings</p>
            <div className="space-y-4">
              {ADJUSTABLE.map((cat) => (
                <div key={cat} className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[cat] || '#6366f1' }} />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 w-36 flex-shrink-0">{cat}</span>
                  <input
                    type="range" min={-80} max={50} step={5}
                    value={simAdj[cat]}
                    onChange={(e) => setSimAdj((p) => ({ ...p, [cat]: Number(e.target.value) }))}
                    className="flex-1 accent-indigo-600 h-1 cursor-pointer"
                  />
                  <span className={`text-sm font-semibold w-14 text-right flex-shrink-0 tabular-nums ${simAdj[cat] < 0 ? 'text-emerald-600 dark:text-emerald-400' : simAdj[cat] > 0 ? 'text-red-500' : 'text-zinc-400'}`}>
                    {simAdj[cat] > 0 ? '+' : ''}{simAdj[cat]}%
                  </span>
                </div>
              ))}
            </div>
            <button onClick={() => setSimAdj(Object.fromEntries(ADJUSTABLE.map((k) => [k, 0])))} className="btn-secondary text-xs mt-4">Reset all</button>
          </div>

          {simResult ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'New Monthly Expense', value: formatCurrency(simResult.newExpense), sub: `Was ${formatCurrency(simResult.currentExpense)}`, color: simResult.newExpense < simResult.currentExpense ? 'text-emerald-600' : 'text-red-500' },
                { label: 'New Monthly Savings', value: formatCurrency(simResult.newSavings), sub: `Change: ${simResult.change >= 0 ? '+' : ''}${formatCurrency(simResult.change)}`, color: simResult.newSavings >= 0 ? 'text-emerald-600' : 'text-red-500' },
                { label: 'Savings in 3 Months', value: formatCurrency(simResult.newSavings * 3), sub: 'Projected', color: 'text-indigo-600 dark:text-indigo-400' },
                { label: 'Annual Impact', value: formatCurrency(simResult.annual), sub: 'vs current trajectory', color: simResult.annual >= 0 ? 'text-emerald-600' : 'text-red-500' },
              ].map((s) => (
                <div key={s.label} className="card p-4 text-center">
                  <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
                  <p className={`text-xl font-semibold tracking-tight ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-zinc-400 mt-1">{s.sub}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-6 text-center text-xs text-zinc-400">
              {loading ? 'Loading data…' : 'Not enough historical data for simulation. Add at least 3 months of transactions.'}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Anomalies */}
      {tab === 2 && (
        <div className="space-y-4">
          {loading ? <Loader /> : (
            <>
              {anomalies?.spikes?.length > 0 && (
                <div className="card divide-y divide-zinc-100 dark:divide-zinc-800">
                  <div className="px-5 py-3"><p className="section-title">Spending Spikes</p></div>
                  {anomalies.spikes.map((s, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{s.category}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{s.month} · avg {formatCurrency(s.average)}</p>
                      </div>
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded">+{s.increasePercent}%</span>
                    </div>
                  ))}
                </div>
              )}
              {anomalies?.anomalies?.length > 0 ? (
                <div className="card divide-y divide-zinc-100 dark:divide-zinc-800">
                  <div className="px-5 py-3 flex items-center justify-between">
                    <p className="section-title">Anomalous Transactions</p>
                    <span className="text-xs text-zinc-500">{anomalies.total} found</span>
                  </div>
                  {anomalies.anomalies.slice(0, 10).map((a, i) => (
                    <div key={i} className="px-5 py-3.5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{a.transaction.description}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{formatDate(a.transaction.date)} · {a.transaction.category}</p>
                        </div>
                        <span className="text-sm font-semibold text-red-600 dark:text-red-400 ml-4 flex-shrink-0">{formatCurrency(a.transaction.amount)}</span>
                      </div>
                      {a.reasons.map((r, j) => (
                        <p key={j} className="text-xs text-zinc-500 mt-1.5">· {r}</p>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-10 text-center">
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No anomalies detected</p>
                  <p className="text-xs text-zinc-400 mt-1">Your spending patterns look normal</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab 3: Subscriptions */}
      {tab === 3 && (
        <div className="space-y-4">
          {loading ? <Loader /> : subscriptions?.subscriptions?.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="card p-4 text-center">
                  <p className="text-xs text-zinc-500">Monthly cost</p>
                  <p className="text-xl font-semibold text-red-600 dark:text-red-400 mt-1 tracking-tight">{formatCurrency(subscriptions.totalMonthly)}</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-xs text-zinc-500">Annual cost</p>
                  <p className="text-xl font-semibold text-red-600 dark:text-red-400 mt-1 tracking-tight">{formatCurrency(subscriptions.totalAnnual)}</p>
                </div>
              </div>
              <div className="card divide-y divide-zinc-100 dark:divide-zinc-800">
                {subscriptions.subscriptions.map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{s.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{s.frequency} · {s.occurrences}× · last {formatDate(s.lastCharged)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(s.monthlyAmount)}<span className="text-zinc-400 font-normal text-xs">/mo</span></p>
                      <p className="text-xs text-zinc-400">{formatCurrency(s.annualAmount)}/yr</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="card p-10 text-center"><p className="text-sm text-zinc-500">No subscriptions detected</p></div>
          )}
        </div>
      )}

      {/* Tab 4: Recurring */}
      {tab === 4 && (
        <div className="space-y-4">
          {loading ? <Loader /> : recurring?.recurring?.length > 0 ? (
            <div className="card divide-y divide-zinc-100 dark:divide-zinc-800">
              {recurring.recurring.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{r.description}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{r.frequency} · {r.occurrences}× · next {formatDate(r.nextExpected)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(r.averageAmount)}</p>
                    <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">{r.frequency}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-10 text-center"><p className="text-sm text-zinc-500">No recurring expenses found</p></div>
          )}
        </div>
      )}
    </div>
  );
}
