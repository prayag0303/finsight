export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatNumber = (num) =>
  new Intl.NumberFormat('en-IN').format(num || 0);

export const formatDate = (date, options = {}) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(date));
};

export const formatShortDate = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date));
};

export const formatMonth = (monthStr) => {
  if (!monthStr) return '—';
  const [year, month] = monthStr.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
};

export const formatPercent = (value, decimals = 1) =>
  `${(value || 0).toFixed(decimals)}%`;

export const getMonthKey = (date = new Date()) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const CATEGORY_COLORS = {
  'Food & Dining': '#f97316',
  'Rent': '#8b5cf6',
  'Utilities': '#06b6d4',
  'Travel': '#3b82f6',
  'Shopping': '#ec4899',
  'Entertainment': '#a855f7',
  'Healthcare': '#22c55e',
  'Education': '#f59e0b',
  'Salary': '#10b981',
  'Investments': '#6366f1',
  'Subscriptions': '#e879f9',
  'Insurance': '#64748b',
  'Loan Payment': '#ef4444',
  'Miscellaneous': '#94a3b8',
};

export const CATEGORY_ICONS = {
  'Food & Dining': '🍽️',
  'Rent': '🏠',
  'Utilities': '⚡',
  'Travel': '✈️',
  'Shopping': '🛍️',
  'Entertainment': '🎬',
  'Healthcare': '🏥',
  'Education': '📚',
  'Salary': '💼',
  'Investments': '📈',
  'Subscriptions': '🔄',
  'Insurance': '🛡️',
  'Loan Payment': '💳',
  'Miscellaneous': '📦',
};
