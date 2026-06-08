const normalize = (str) =>
  str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/).slice(0, 3).join(' ');

const KNOWN_SUBSCRIPTIONS = {
  'netflix': { name: 'Netflix', category: 'Entertainment' },
  'spotify': { name: 'Spotify', category: 'Entertainment' },
  'amazon prime': { name: 'Amazon Prime', category: 'Entertainment' },
  'prime video': { name: 'Amazon Prime', category: 'Entertainment' },
  'youtube premium': { name: 'YouTube Premium', category: 'Entertainment' },
  'youtube': { name: 'YouTube Premium', category: 'Entertainment' },
  'hotstar': { name: 'Disney+ Hotstar', category: 'Entertainment' },
  'disney': { name: 'Disney+ Hotstar', category: 'Entertainment' },
  'zee5': { name: 'ZEE5', category: 'Entertainment' },
  'sonyliv': { name: 'SonyLIV', category: 'Entertainment' },
  'jiocinema': { name: 'JioCinema', category: 'Entertainment' },
  'apple tv': { name: 'Apple TV+', category: 'Entertainment' },
  'gym': { name: 'Gym Membership', category: 'Healthcare' },
  'fitness': { name: 'Fitness Membership', category: 'Healthcare' },
  'cult fit': { name: 'Cult.fit', category: 'Healthcare' },
  'adobe': { name: 'Adobe Creative', category: 'Shopping' },
  'microsoft': { name: 'Microsoft 365', category: 'Shopping' },
  'google': { name: 'Google One', category: 'Shopping' },
  'dropbox': { name: 'Dropbox', category: 'Shopping' },
  'linkedin': { name: 'LinkedIn Premium', category: 'Education' },
};

const detectSubscriptions = (transactions) => {
  const debitTx = transactions.filter((tx) => tx.type === 'debit');
  const merchantGroups = {};

  debitTx.forEach((tx) => {
    const key = normalize(tx.description);
    if (!merchantGroups[key]) merchantGroups[key] = [];
    merchantGroups[key].push(tx);
  });

  const subscriptions = [];

  Object.entries(merchantGroups).forEach(([key, txList]) => {
    if (txList.length < 2) return;

    const sorted = txList.sort((a, b) => new Date(a.date) - new Date(b.date));
    const months = sorted.map((tx) => {
      const d = new Date(tx.date);
      return d.getFullYear() * 12 + d.getMonth();
    });

    const uniqueMonths = [...new Set(months)];
    if (uniqueMonths.length < 2) return;

    const gaps = [];
    for (let i = 1; i < uniqueMonths.length; i++) {
      gaps.push(uniqueMonths[i] - uniqueMonths[i - 1]);
    }

    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    // Accept monthly (gap ~1) up to quarterly (gap ~3), with tolerance for skipped months
    if (avgGap < 0.7 || avgGap > 3.5) return;

    const amounts = sorted.map((tx) => tx.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    // Allow up to 15% variance in amount (e.g., currency fluctuations, partial prorations)
    const amountVariance = amounts.every((a) => Math.abs(a - avgAmount) / avgAmount < 0.15);
    if (!amountVariance && amounts.length > 1) return;

    let subName = sorted[sorted.length - 1].description;
    let subCategory = sorted[sorted.length - 1].category || 'Subscriptions';

    for (const [kw, info] of Object.entries(KNOWN_SUBSCRIPTIONS)) {
      if (normalize(sorted[0].description).includes(kw)) {
        subName = info.name;
        subCategory = info.category;
        break;
      }
    }

    subscriptions.push({
      name: subName,
      normalizedKey: key,
      category: subCategory,
      monthlyAmount: Math.round(avgAmount / avgGap),
      annualAmount: Math.round((avgAmount / avgGap) * 12),
      frequency: avgGap < 1.5 ? 'Monthly' : avgGap < 2.5 ? 'Bi-monthly' : 'Quarterly',
      lastCharged: sorted[sorted.length - 1].date,
      occurrences: sorted.length,
      transactions: sorted.map((tx) => tx._id),
    });
  });

  return subscriptions.sort((a, b) => b.monthlyAmount - a.monthlyAmount);
};

const detectRecurringExpenses = (transactions) => {
  const debitTx = transactions.filter((tx) => tx.type === 'debit');
  const groups = {};

  debitTx.forEach((tx) => {
    const key = normalize(tx.description);
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });

  const recurring = [];

  Object.entries(groups).forEach(([key, txList]) => {
    if (txList.length < 3) return;

    const sorted = txList.sort((a, b) => new Date(a.date) - new Date(b.date));
    const amounts = sorted.map((tx) => tx.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const months = sorted.map((tx) => new Date(tx.date).getFullYear() * 12 + new Date(tx.date).getMonth());
    const uniqueMonths = [...new Set(months)];

    if (uniqueMonths.length < 3) return;

    const gaps = [];
    for (let i = 1; i < uniqueMonths.length; i++) {
      gaps.push(uniqueMonths[i] - uniqueMonths[i - 1]);
    }
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const gapConsistency = gaps.every((g) => Math.abs(g - avgGap) <= 1);

    if (!gapConsistency) return;

    const lastDate = new Date(sorted[sorted.length - 1].date);
    const nextExpected = new Date(lastDate);
    nextExpected.setMonth(nextExpected.getMonth() + Math.round(avgGap));

    recurring.push({
      description: sorted[sorted.length - 1].description,
      category: sorted[sorted.length - 1].category,
      averageAmount: Math.round(avgAmount),
      frequency: avgGap <= 1 ? 'Monthly' : avgGap <= 3 ? 'Quarterly' : 'Yearly',
      occurrences: sorted.length,
      lastPayment: sorted[sorted.length - 1].date,
      nextExpected,
    });
  });

  return recurring.sort((a, b) => b.averageAmount - a.averageAmount);
};

module.exports = { detectSubscriptions, detectRecurringExpenses };
