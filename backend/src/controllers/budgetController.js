const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

exports.getBudgets = async (req, res, next) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const budgets = await Budget.find({ user: req.user._id, month });

    const [year, mon] = month.split('-').map(Number);
    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 0, 23, 59, 59);

    const spending = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'debit',
          date: { $gte: startDate, $lte: endDate },
        },
      },
      { $group: { _id: '$category', spent: { $sum: '$amount' } } },
    ]);

    const spentMap = spending.reduce((acc, s) => {
      acc[s._id] = s.spent;
      return acc;
    }, {});

    const budgetsWithSpending = budgets.map((b) => ({
      ...b.toObject(),
      spent: spentMap[b.category] || 0,
      remaining: Math.max(0, b.monthlyLimit - (spentMap[b.category] || 0)),
      percentUsed: Math.min(100, Math.round(((spentMap[b.category] || 0) / b.monthlyLimit) * 100)),
    }));

    res.json({ budgets: budgetsWithSpending, month });
  } catch (error) {
    next(error);
  }
};

exports.createBudget = async (req, res, next) => {
  try {
    const { category, monthlyLimit, month } = req.body;
    if (!category || !monthlyLimit) {
      return res.status(400).json({ error: 'Category and monthly limit are required' });
    }

    const budgetMonth = month || new Date().toISOString().slice(0, 7);
    const existing = await Budget.findOne({ user: req.user._id, category, month: budgetMonth });
    if (existing) {
      return res.status(400).json({ error: `Budget for ${category} in ${budgetMonth} already exists` });
    }

    const budget = await Budget.create({
      user: req.user._id,
      category,
      monthlyLimit: Number(monthlyLimit),
      month: budgetMonth,
    });

    res.status(201).json({ budget });
  } catch (error) {
    next(error);
  }
};

exports.updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
    if (!budget) return res.status(404).json({ error: 'Budget not found' });

    if (req.body.monthlyLimit) budget.monthlyLimit = Number(req.body.monthlyLimit);
    await budget.save();

    res.json({ budget });
  } catch (error) {
    next(error);
  }
};

exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!budget) return res.status(404).json({ error: 'Budget not found' });
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getBudgetSummary = async (req, res, next) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const [year, mon] = month.split('-').map(Number);
    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 0, 23, 59, 59);

    const [budgets, spending] = await Promise.all([
      Budget.find({ user: req.user._id, month }),
      Transaction.aggregate([
        {
          $match: {
            user: req.user._id,
            type: 'debit',
            date: { $gte: startDate, $lte: endDate },
          },
        },
        { $group: { _id: '$category', spent: { $sum: '$amount' } } },
      ]),
    ]);

    const spentMap = spending.reduce((acc, s) => { acc[s._id] = s.spent; return acc; }, {});
    const totalBudgeted = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (spentMap[b.category] || 0), 0);

    res.json({
      totalBudgeted,
      totalSpent,
      remaining: totalBudgeted - totalSpent,
      overBudgetCategories: budgets
        .filter((b) => (spentMap[b.category] || 0) > b.monthlyLimit)
        .map((b) => ({ category: b.category, limit: b.monthlyLimit, spent: spentMap[b.category] })),
    });
  } catch (error) {
    next(error);
  }
};
