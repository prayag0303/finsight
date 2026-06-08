const detectAnomalies = (transactions) => {
  const categoryStats = {};

  transactions.filter((tx) => tx.type === 'debit').forEach((tx) => {
    if (!categoryStats[tx.category]) {
      categoryStats[tx.category] = { amounts: [], mean: 0, stdDev: 0 };
    }
    categoryStats[tx.category].amounts.push(tx.amount);
  });

  Object.keys(categoryStats).forEach((cat) => {
    const amounts = categoryStats[cat].amounts;
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    categoryStats[cat].mean = mean;
    categoryStats[cat].stdDev = stdDev;
  });

  const anomalies = [];
  const seen = new Map();

  transactions.forEach((tx) => {
    const reasons = [];

    if (tx.type === 'debit' && categoryStats[tx.category]) {
      const { mean, stdDev } = categoryStats[tx.category];
      if (stdDev > 0) {
        const zScore = (tx.amount - mean) / stdDev;
        if (zScore > 2) {
          reasons.push(`Amount ₹${tx.amount.toLocaleString()} is unusually high for ${tx.category} (avg: ₹${Math.round(mean).toLocaleString()})`);
        }
      } else if (categoryStats[tx.category].amounts.length >= 3 && tx.amount > mean * 2) {
        reasons.push(`Amount ₹${tx.amount.toLocaleString()} is more than double the average for ${tx.category}`);
      }
    }

    const dupKey = `${tx.amount}-${tx.description.toLowerCase().trim()}-${new Date(tx.date).toDateString()}`;
    if (seen.has(dupKey)) {
      // Only flag the SECOND occurrence as duplicate, not every subsequent one
      const firstId = seen.get(dupKey);
      if (firstId !== 'flagged') {
        reasons.push(`Potential duplicate: same amount, description, and date as another transaction`);
        seen.set(dupKey, 'flagged');
      }
    } else {
      seen.set(dupKey, tx._id);
    }

    if (reasons.length > 0) {
      anomalies.push({
        transaction: tx,
        reasons,
        severity: reasons.length > 1 ? 'high' : 'medium',
      });
    }
  });

  return anomalies;
};

const detectSpendingSpikes = (transactions) => {
  const monthlyByCategory = {};

  transactions.filter((tx) => tx.type === 'debit').forEach((tx) => {
    const month = new Date(tx.date).toISOString().slice(0, 7);
    const key = `${tx.category}`;
    if (!monthlyByCategory[key]) monthlyByCategory[key] = {};
    if (!monthlyByCategory[key][month]) monthlyByCategory[key][month] = 0;
    monthlyByCategory[key][month] += tx.amount;
  });

  const spikes = [];
  Object.entries(monthlyByCategory).forEach(([category, months]) => {
    const monthKeys = Object.keys(months).sort();
    if (monthKeys.length < 2) return;

    const values = monthKeys.map((m) => months[m]);
    const avg = values.slice(0, -1).reduce((a, b) => a + b, 0) / (values.length - 1);
    const latest = values[values.length - 1];

    if (avg > 0 && latest > avg * 1.5) {
      spikes.push({
        category,
        month: monthKeys[monthKeys.length - 1],
        amount: latest,
        average: Math.round(avg),
        increasePercent: Math.round(((latest - avg) / avg) * 100),
      });
    }
  });

  return spikes.sort((a, b) => b.increasePercent - a.increasePercent);
};

module.exports = { detectAnomalies, detectSpendingSpikes };
