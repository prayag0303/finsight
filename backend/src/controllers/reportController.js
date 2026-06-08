const Transaction = require('../models/Transaction');
const Report = require('../models/Report');
const { generateAIReport } = require('../services/aiService');

exports.getReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ user: req.user._id })
      .sort({ month: -1 })
      .limit(12)
      .select('-data.rawAIResponse');

    res.json({ reports });
  } catch (error) {
    next(error);
  }
};

exports.getReport = async (req, res, next) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, user: req.user._id });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ report });
  } catch (error) {
    next(error);
  }
};

exports.generateReport = async (req, res, next) => {
  try {
    const month = req.body.month || new Date().toISOString().slice(0, 7);

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return res.status(400).json({ error: 'month must be in YYYY-MM format (e.g. 2025-06)' });
    }

    const [year, mon] = month.split('-').map(Number);
    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 0, 23, 59, 59);

    const prevMonth = new Date(year, mon - 2, 1).toISOString().slice(0, 7);
    const [prevYear, prevMon] = prevMonth.split('-').map(Number);
    const prevStart = new Date(prevYear, prevMon - 1, 1);
    const prevEnd = new Date(prevYear, prevMon, 0, 23, 59, 59);

    const [transactions, prevTransactions] = await Promise.all([
      Transaction.find({ user: req.user._id, date: { $gte: startDate, $lte: endDate } }),
      Transaction.find({ user: req.user._id, date: { $gte: prevStart, $lte: prevEnd } }),
    ]);

    const totalIncome = transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    const categoryBreakdown = transactions
      .filter((t) => t.type === 'debit')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    const prevIncome = prevTransactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const prevExpenses = prevTransactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    const prevCategoryBreakdown = prevTransactions
      .filter((t) => t.type === 'debit')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    const summary = {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      transactionCount: transactions.length,
    };

    const reportData = await generateAIReport({
      month,
      summary,
      categoryBreakdown,
      previousMonth: {
        totalIncome: prevIncome,
        totalExpenses: prevExpenses,
        savingsRate: prevIncome > 0 ? ((prevIncome - prevExpenses) / prevIncome) * 100 : 0,
        categoryBreakdown: prevCategoryBreakdown,
      },
    });

    const report = await Report.findOneAndUpdate(
      { user: req.user._id, month },
      {
        user: req.user._id,
        month,
        data: { ...reportData, categoryBreakdown },
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ report });
  } catch (error) {
    next(error);
  }
};

exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ message: 'Report deleted' });
  } catch (error) {
    next(error);
  }
};
