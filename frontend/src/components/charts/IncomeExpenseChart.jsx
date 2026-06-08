import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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

export default function IncomeExpenseChart({ data = [], loading = false }) {
  if (loading) return <div className="h-56 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />;
  if (!data.length) return <div className="h-56 flex items-center justify-center text-sm text-zinc-400">No data</div>;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} className="text-zinc-400" tickLine={false} axisLine={false} />
        <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} className="text-zinc-400" tickLine={false} axisLine={false} />
        <Tooltip content={<Tip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="income" name="Income" fill="#10b981" radius={[3, 3, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
