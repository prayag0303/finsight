import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function BudgetChart({ budgets = [], loading = false }) {
  if (loading) return <div className="h-56 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />;
  if (!budgets.length) return <div className="h-56 flex items-center justify-center text-sm text-zinc-400">No budgets set</div>;

  const data = budgets.map((b) => ({
    category: b.category.split(' & ')[0],
    Budget: b.monthlyLimit,
    Spent: b.spent || 0,
    over: (b.spent || 0) > b.monthlyLimit,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 40 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" vertical={false} />
        <XAxis dataKey="category" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" className="text-zinc-400" tickLine={false} axisLine={false} interval={0} />
        <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} className="text-zinc-400" tickLine={false} axisLine={false} />
        <Tooltip content={<Tip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="Budget" fill="#e0e7ff" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Spent" radius={[3, 3, 0, 0]}>
          {data.map((entry, i) => <Cell key={i} fill={entry.over ? '#ef4444' : '#6366f1'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
