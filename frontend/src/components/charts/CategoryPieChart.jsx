import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, CATEGORY_COLORS } from '../../utils/formatters';

const Tip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">{item.name}</p>
      <p style={{ color: item.payload.color }}>{formatCurrency(item.value)}</p>
      <p className="text-zinc-400">{item.payload.percent}% of total</p>
    </div>
  );
};

export default function CategoryPieChart({ data = [], loading = false }) {
  if (loading) return <div className="h-64 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />;
  if (!data.length) return <div className="h-64 flex items-center justify-center text-sm text-zinc-400">No spending data</div>;

  const total = data.reduce((s, d) => s + d.value, 0);
  const chartData = data
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
    .map((d) => ({
      ...d,
      color: CATEGORY_COLORS[d.name] || '#94a3b8',
      percent: total > 0 ? ((d.value / total) * 100).toFixed(1) : '0',
    }));

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width="50%" height={200}>
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
            {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip content={<Tip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 space-y-2 overflow-hidden">
        {chartData.slice(0, 6).map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-zinc-600 dark:text-zinc-400 truncate flex-1">{item.name}</span>
            <span className="text-zinc-500 dark:text-zinc-400 flex-shrink-0">{item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
