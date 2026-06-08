import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-6">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function SpendingTrendChart({ data = [], loading = false }) {
  if (loading) return <div className="h-64 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />;
  if (!data.length) return <div className="h-64 flex items-center justify-center text-sm text-zinc-400">No data available</div>;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'currentColor' }} className="text-zinc-400" tickLine={false} axisLine={false} />
        <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: 'currentColor' }} className="text-zinc-400" tickLine={false} axisLine={false} />
        <Tooltip content={<Tip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={1.5} fill="url(#gIncome)" dot={false} />
        <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={1.5} fill="url(#gExpense)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
