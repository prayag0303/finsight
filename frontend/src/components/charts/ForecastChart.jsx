import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const isForecast = payload[0]?.payload?.type === 'forecast';
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
        {label}{isForecast && <span className="ml-1 text-indigo-500 font-normal">(forecast)</span>}
      </p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-6">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function ForecastChart({ historical = [], forecast = [], loading = false }) {
  if (loading) return <div className="h-72 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />;

  const allData = [...historical, ...forecast];
  if (!allData.length) return (
    <div className="h-72 flex items-center justify-center text-sm text-zinc-400">Not enough data for forecasting</div>
  );

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={allData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="fGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} className="text-zinc-400" tickLine={false} axisLine={false} />
        <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} className="text-zinc-400" tickLine={false} axisLine={false} />
        <Tooltip content={<Tip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={1.5} dot={false} />
        <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
        <Area type="monotone" dataKey="net" name="Net" stroke="#6366f1" strokeWidth={1.5} fill="url(#fGrad)" dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
