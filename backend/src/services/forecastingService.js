const { addMonths, format } = require('./dateUtils');

const formatMonthLabel = (monthStr) => {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
};

const getMonthlyStats = (transactions) => {
  const monthly = {};

  transactions.forEach((tx) => {
    const monthKey = format(new Date(tx.date), 'YYYY-MM');
    if (!monthly[monthKey]) {
      monthly[monthKey] = { income: 0, expenses: 0, net: 0 };
    }
    if (tx.type === 'credit') {
      monthly[monthKey].income += tx.amount;
    } else {
      monthly[monthKey].expenses += tx.amount;
    }
    monthly[monthKey].net = monthly[monthKey].income - monthly[monthKey].expenses;
  });

  return monthly;
};

const weightedMovingAverage = (values, weights) => {
  if (values.length === 0) return 0;
  const n = Math.min(values.length, weights.length);
  const slice = values.slice(-n);
  const w = weights.slice(0, n);
  const totalWeight = w.reduce((a, b) => a + b, 0);
  return slice.reduce((sum, val, i) => sum + val * w[i], 0) / totalWeight;
};

const linearTrend = (values) => {
  const n = values.length;
  if (n < 2) return 0;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  const slope = values.reduce((sum, y, x) => sum + (x - xMean) * (y - yMean), 0) /
    values.reduce((sum, _, x) => sum + Math.pow(x - xMean, 2), 0);
  return slope;
};

const generateForecast = (transactions, months = 6) => {
  const monthlyStats = getMonthlyStats(transactions);
  const sortedMonths = Object.keys(monthlyStats).sort();

  if (sortedMonths.length < 2) {
    const avg = sortedMonths.length === 1 ? monthlyStats[sortedMonths[0]] : { income: 0, expenses: 0, net: 0 };
    const forecasted = [];
    const now = new Date();
    for (let i = 1; i <= months; i++) {
      const futureDate = addMonths(now, i);
      forecasted.push({
        month: format(futureDate, 'YYYY-MM'),
        label: formatMonthLabel(format(futureDate, 'YYYY-MM')),
        income: avg.income,
        expenses: avg.expenses,
        net: avg.net,
        type: 'forecast',
      });
    }
    return {
      historical: sortedMonths.map((m) => ({
        month: m,
        label: formatMonthLabel(m),
        ...monthlyStats[m],
        type: 'actual',
      })),
      forecast: forecasted,
    };
  }

  const incomeValues = sortedMonths.map((m) => monthlyStats[m].income);
  const expenseValues = sortedMonths.map((m) => monthlyStats[m].expenses);

  const weights = [0.5, 0.3, 0.15, 0.05];
  const forecastedIncome = weightedMovingAverage(incomeValues, weights);
  const forecastedExpenses = weightedMovingAverage(expenseValues, weights);
  const incomeTrend = linearTrend(incomeValues);
  const expenseTrend = linearTrend(expenseValues);

  const lastMonth = sortedMonths[sortedMonths.length - 1];
  const [year, month] = lastMonth.split('-').map(Number);
  const lastDate = new Date(year, month - 1, 1);

  const forecasted = [];
  for (let i = 1; i <= months; i++) {
    const futureDate = addMonths(lastDate, i);
    const income = Math.max(0, forecastedIncome + incomeTrend * i);
    const expenses = Math.max(0, forecastedExpenses + expenseTrend * i);
    forecasted.push({
      month: format(futureDate, 'YYYY-MM'),
      label: format(futureDate, 'MMM YYYY'),
      income: Math.round(income),
      expenses: Math.round(expenses),
      net: Math.round(income - expenses),
      type: 'forecast',
    });
  }

  return {
    historical: sortedMonths.map((m) => ({
      month: m,
      label: formatMonthLabel(m),
      ...monthlyStats[m],
      type: 'actual',
    })),
    forecast: forecasted,
  };
};

module.exports = { generateForecast, getMonthlyStats };
