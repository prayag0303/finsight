const Transaction = require('../models/Transaction');
const { generateForecast } = require('../services/forecastingService');
const { detectAnomalies, detectSpendingSpikes } = require('../services/anomalyService');
const { detectSubscriptions, detectRecurringExpenses } = require('../services/subscriptionService');

exports.getCashFlowForecast = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const lookback = 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - lookback);
    startDate.setDate(1);

    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startDate },
    }).sort({ date: 1 });

    const forecast = generateForecast(transactions, months);
    res.json(forecast);
  } catch (error) {
    next(error);
  }
};

exports.getAnomalies = async (req, res, next) => {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startDate },
    }).sort({ date: -1 });

    const anomalies = detectAnomalies(transactions);
    const spikes = detectSpendingSpikes(transactions);

    res.json({ anomalies, spikes, total: anomalies.length });
  } catch (error) {
    next(error);
  }
};

exports.getSubscriptions = async (req, res, next) => {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    const transactions = await Transaction.find({
      user: req.user._id,
      type: 'debit',
      date: { $gte: startDate },
    }).sort({ date: 1 });

    const subscriptions = detectSubscriptions(transactions);
    const totalMonthly = subscriptions.reduce((sum, s) => sum + s.monthlyAmount, 0);

    res.json({
      subscriptions,
      totalMonthly,
      totalAnnual: totalMonthly * 12,
    });
  } catch (error) {
    next(error);
  }
};

exports.getRecurring = async (req, res, next) => {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);

    const transactions = await Transaction.find({
      user: req.user._id,
      type: 'debit',
      date: { $gte: startDate },
    }).sort({ date: 1 });

    const recurring = detectRecurringExpenses(transactions);
    res.json({ recurring, total: recurring.length });
  } catch (error) {
    next(error);
  }
};
