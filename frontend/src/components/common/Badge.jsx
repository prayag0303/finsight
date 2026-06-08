export default function Badge({ children, color = 'gray', size = 'sm' }) {
  const colors = {
    gray: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
    green: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    yellow: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs rounded-md',
    sm: 'px-2 py-0.5 text-xs rounded-lg font-medium',
    md: 'px-2.5 py-1 text-sm rounded-lg font-medium',
  };

  return (
    <span className={`inline-flex items-center ${colors[color]} ${sizes[size]}`}>
      {children}
    </span>
  );
}
