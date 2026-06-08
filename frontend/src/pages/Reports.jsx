import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatCurrency, formatMonth, formatPercent, formatDate, getMonthKey } from '../utils/formatters';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [genMonth, setGenMonth] = useState(getMonthKey());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports');
      const list = data.reports || [];
      setReports(list);
      if (list.length > 0 && !selected) setSelected(list[0]);
    } catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/reports/generate', { month: genMonth });
      toast.success('Report generated');
      setSelected(data.report);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to generate'); }
    finally { setGenerating(false); }
  };

  const r = selected?.data;

  const kindClass = { positive: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900', warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900', info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900' };
  const kindIcon = { positive: '✓', warning: '!', info: 'i' };
  const kindIconClass = { positive: 'bg-emerald-500', warning: 'bg-amber-500', info: 'bg-blue-500' };
  const trendIcon = { up: '↑', down: '↓', neutral: '→' };
  const trendClass = { up: 'text-red-500', down: 'text-emerald-500', neutral: 'text-zinc-400' };
  const priorityClass = { high: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30', medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30', low: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Financial Reports</h1>
        <p className="text-xs text-zinc-500 mt-0.5">AI-generated monthly analysis and recommendations</p>
      </div>

      {/* Generate row */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="label">Generate Report For</label>
            <input type="month" value={genMonth} onChange={(e) => setGenMonth(e.target.value)} className="input" />
          </div>
          <button onClick={generate} disabled={generating} className="btn-primary gap-2">
            {generating ? (
              <><span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />Generating…</>
            ) : 'Generate Report'}
          </button>
        </div>
        {generating && <p className="text-xs text-zinc-500 mt-2">Analyzing transactions… this may take a moment.</p>}
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        {/* Sidebar list */}
        <div className="lg:col-span-1 space-y-1.5">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide px-1 mb-2">History</p>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />)}
            </div>
          ) : reports.length === 0 ? (
            <p className="text-xs text-zinc-400 px-1">No reports yet. Generate one above.</p>
          ) : reports.map((rep) => (
            <button key={rep._id} onClick={() => setSelected(rep)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors border ${selected?._id === rep._id ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}>
              <p className="text-sm font-medium">{formatMonth(rep.month)}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{rep.data?.aiGenerated ? 'AI report' : 'Auto report'}</p>
            </button>
          ))}
        </div>

        {/* Report content */}
        <div className="lg:col-span-3">
          {!r ? (
            <div className="card p-10 text-center">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Select a report or generate a new one</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{formatMonth(selected?.month)}</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Generated {formatDate(selected?.generatedAt)}{r.aiGenerated && ' · AI powered'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Income', value: formatCurrency(r.summary?.totalIncome), cls: 'text-emerald-600 dark:text-emerald-400' },
                    { label: 'Expenses', value: formatCurrency(r.summary?.totalExpenses), cls: 'text-red-600 dark:text-red-400' },
                    { label: 'Net Savings', value: formatCurrency(r.summary?.netSavings), cls: (r.summary?.netSavings || 0) >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-500' },
                    { label: 'Savings Rate', value: formatPercent(r.summary?.savingsRate), cls: 'text-zinc-900 dark:text-zinc-100' },
                  ].map((s) => (
                    <div key={s.label} className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 text-center">
                      <p className="text-xs text-zinc-500">{s.label}</p>
                      <p className={`text-lg font-semibold ${s.cls} mt-0.5 tracking-tight`}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              {r.highlights?.length > 0 && (
                <div className="card p-5">
                  <p className="section-title mb-3">Highlights</p>
                  <div className="space-y-2">
                    {r.highlights.map((h, i) => (
                      <div key={i} className={`flex gap-3 p-3 rounded-lg border ${kindClass[h.kind] || kindClass.info}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5 ${kindIconClass[h.kind] || kindIconClass.info}`}>
                          {kindIcon[h.kind] || 'i'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{h.title}</p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">{h.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights */}
              {r.insights?.length > 0 && (
                <div className="card p-5">
                  <p className="section-title mb-3">Spending Insights</p>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {r.insights.map((ins, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">{ins.message}</p>
                        <span className={`text-sm font-semibold ml-4 flex-shrink-0 ${trendClass[ins.trend] || 'text-zinc-500'}`}>{trendIcon[ins.trend] || '→'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {r.recommendations?.length > 0 && (
                <div className="card p-5">
                  <p className="section-title mb-3">Recommendations</p>
                  <div className="space-y-3">
                    {r.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-3">
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0 h-fit mt-0.5 ${priorityClass[rec.priority] || priorityClass.medium}`}>{rec.priority}</span>
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{rec.title}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{rec.description}</p>
                          {rec.impact && <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">{rec.impact}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Forecast */}
              {r.forecast && (
                <div className="card p-5">
                  <p className="section-title mb-3">Next Month Outlook</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                    Expected expenses: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(r.forecast.nextMonthExpected)}</span>
                  </p>
                  {r.forecast.risks?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Risks</p>
                      {r.forecast.risks.map((x, i) => <p key={i} className="text-xs text-zinc-500">· {x}</p>)}
                    </div>
                  )}
                  {r.forecast.opportunities?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Opportunities</p>
                      {r.forecast.opportunities.map((x, i) => <p key={i} className="text-xs text-zinc-500">· {x}</p>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
