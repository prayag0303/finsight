const TYPE_CONFIG = {
  income: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0-16l-4 4m4-4l4 4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18" />
      </svg>
    ),
  },
  expense: {
    iconBg: 'bg-red-50 dark:bg-red-950/40',
    iconColor: 'text-red-500 dark:text-red-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  savings: {
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  rate: {
    iconBg: 'bg-violet-50 dark:bg-violet-950/40',
    iconColor: 'text-violet-600 dark:text-violet-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  default: {
    iconBg: 'bg-zinc-100 dark:bg-zinc-800',
    iconColor: 'text-zinc-500 dark:text-zinc-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
};

export default function StatsCard({ title, value, subtitle, type, trend, trendValue, loading = false }) {
  if (loading) {
    return (
      <div className="card p-5 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-24 mb-4" />
            <div className="h-7 bg-zinc-100 dark:bg-zinc-800 rounded w-32 mb-2" />
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-20" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex-shrink-0" />
        </div>
      </div>
    );
  }

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.default;

  return (
    <div className="card p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">{title}</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">{value}</p>

          {subtitle && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">{subtitle}</p>
          )}

          {trend !== undefined && (
            <span className={`inline-flex items-center gap-0.5 mt-2 text-xs font-semibold ${
              trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
            }`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                {trend >= 0
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                }
              </svg>
              {trendValue || `${Math.abs(trend).toFixed(1)}%`}
              <span className="text-zinc-400 font-normal ml-0.5">vs last month</span>
            </span>
          )}
        </div>

        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.iconBg} ${config.iconColor}`}>
          {config.icon}
        </div>
      </div>
    </div>
  );
}
