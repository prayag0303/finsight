import { formatCurrency, formatDate, CATEGORY_COLORS } from '../../utils/formatters';

export default function TransactionTable({ transactions = [], loading = false, onEdit, onDelete }) {
  if (loading) return (
    <div className="space-y-2 p-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
      ))}
    </div>
  );

  if (!transactions.length) return (
    <div className="text-center py-12">
      <svg className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No transactions found</p>
      <p className="text-xs text-zinc-400 mt-1">Add one manually or import a CSV file</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="border-b border-zinc-100 dark:border-zinc-800">
            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-400 uppercase tracking-wide w-28">Date</th>
            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-400 uppercase tracking-wide">Description</th>
            <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-400 uppercase tracking-wide hidden md:table-cell w-36">Category</th>
            <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-400 uppercase tracking-wide w-32">Amount</th>
            {(onEdit || onDelete) && <th className="w-16" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/60">
          {transactions.map((tx) => (
            <tr key={tx._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 group transition-colors">
              <td className="px-4 py-2.5 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                {formatDate(tx.date)}
              </td>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  {tx.isAnomaly && (
                    <span title="Anomaly detected" className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  )}
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[220px]" title={tx.description}>
                    {tx.description}
                  </span>
                </div>
              </td>
              <td className="px-4 py-2.5 hidden md:table-cell">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{
                  backgroundColor: `${CATEGORY_COLORS[tx.category] || '#94a3b8'}18`,
                  color: CATEGORY_COLORS[tx.category] || '#71717a',
                }}>
                  {tx.category}
                </span>
              </td>
              <td className="px-4 py-2.5 text-right whitespace-nowrap">
                <span className={`font-semibold ${tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                  {tx.type === 'credit' ? '+' : '−'}{formatCurrency(tx.amount)}
                </span>
              </td>
              {(onEdit || onDelete) && (
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                      <button onClick={() => onEdit(tx)} className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(tx._id)} className="p-1 rounded text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
