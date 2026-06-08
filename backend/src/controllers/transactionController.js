const { parse } = require('csv-parse/sync');
const Transaction = require('../models/Transaction');
const { categorize } = require('../services/categorizationService');

exports.getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, category, type, startDate, endDate, search } = req.query;
    const filter = { user: req.user._id };

    if (category) filter.category = category;
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      transactions,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createTransaction = async (req, res, next) => {
  try {
    const { date, description, amount, type, category, account, notes } = req.body;

    const autoCategory = category || categorize(description);
    const tx = await Transaction.create({
      user: req.user._id,
      date,
      description,
      amount: Number(amount),
      type,
      category: autoCategory,
      account: account || 'Primary Account',
      notes,
    });

    res.status(201).json({ transaction: tx });
  } catch (error) {
    next(error);
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });

    const allowed = ['date', 'description', 'amount', 'type', 'category', 'account', 'notes', 'tags'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) tx[field] = req.body[field];
    });

    await tx.save();
    res.json({ transaction: tx });
  } catch (error) {
    next(error);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ error: 'Transaction not found' });
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.uploadCSV = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No CSV file uploaded' });

    const content = req.file.buffer.toString('utf-8');
    let records;

    try {
      records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid CSV format. Please check your file.' });
    }

    if (records.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty' });
    }

    const CSV_ROW_LIMIT = 1000;
    if (records.length > CSV_ROW_LIMIT) {
      return res.status(400).json({
        error: `CSV contains ${records.length} rows. Maximum allowed is ${CSV_ROW_LIMIT}. Please split into smaller files.`,
      });
    }

    const headers = Object.keys(records[0]).map((h) => h.toLowerCase().trim());
    const transactions = [];
    const errors = [];

    records.forEach((row, idx) => {
      try {
        const normalizedRow = {};
        Object.keys(row).forEach((k) => {
          normalizedRow[k.toLowerCase().trim()] = row[k];
        });

        let date, description, amount, type;

        date = normalizedRow['date'] || normalizedRow['transaction date'] || normalizedRow['value date'];
        description = normalizedRow['description'] || normalizedRow['narration'] || normalizedRow['particulars'] || normalizedRow['details'];

        if (normalizedRow['debit'] !== undefined || normalizedRow['credit'] !== undefined) {
          const debit = parseFloat(normalizedRow['debit']) || 0;
          const credit = parseFloat(normalizedRow['credit']) || 0;
          if (debit > 0) { amount = debit; type = 'debit'; }
          else if (credit > 0) { amount = credit; type = 'credit'; }
          else return;
        } else if (normalizedRow['amount'] !== undefined) {
          amount = Math.abs(parseFloat(normalizedRow['amount']));
          const rawAmt = parseFloat(normalizedRow['amount']);
          type = normalizedRow['type']?.toLowerCase() === 'credit' ? 'credit' :
            normalizedRow['type']?.toLowerCase() === 'debit' ? 'debit' :
            rawAmt < 0 ? 'debit' : 'credit';
        }

        if (!date || !description || !amount || amount === 0) return;

        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) return;

        transactions.push({
          user: req.user._id,
          date: parsedDate,
          description: description.trim(),
          amount,
          type,
          category: categorize(description),
          account: normalizedRow['account'] || 'Imported',
        });
      } catch (e) {
        errors.push(`Row ${idx + 2}: ${e.message}`);
      }
    });

    if (transactions.length === 0) {
      return res.status(400).json({ error: 'No valid transactions found in CSV', errors });
    }

    const inserted = await Transaction.insertMany(transactions, { ordered: false });

    res.status(201).json({
      message: `Successfully imported ${inserted.length} transactions`,
      imported: inserted.length,
      skipped: records.length - inserted.length,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const { month } = req.query;
    let dateFilter = {};

    if (month) {
      const [year, mon] = month.split('-').map(Number);
      dateFilter = {
        $gte: new Date(year, mon - 1, 1),
        $lte: new Date(year, mon, 0, 23, 59, 59),
      };
    }

    const filter = { user: req.user._id };
    if (Object.keys(dateFilter).length) filter.date = dateFilter;

    const [incomeAgg, expenseAgg, categoryAgg] = await Promise.all([
      Transaction.aggregate([
        { $match: { ...filter, type: 'credit' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { ...filter, type: 'debit' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { ...filter, type: 'debit' } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
    ]);

    const totalIncome = incomeAgg[0]?.total || 0;
    const totalExpenses = expenseAgg[0]?.total || 0;
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    res.json({
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      categoryBreakdown: categoryAgg.reduce((acc, item) => {
        acc[item._id] = { total: item.total, count: item.count };
        return acc;
      }, {}),
    });
  } catch (error) {
    next(error);
  }
};

exports.getMonthlyTrend = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const agg = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthMap = {};
    agg.forEach(({ _id, total }) => {
      const key = `${_id.year}-${String(_id.month).padStart(2, '0')}`;
      if (!monthMap[key]) monthMap[key] = { month: key, income: 0, expenses: 0 };
      if (_id.type === 'credit') monthMap[key].income = total;
      else monthMap[key].expenses = total;
    });

    const result = Object.values(monthMap)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((m) => ({
        ...m,
        net: m.income - m.expenses,
        label: new Date(m.month + '-01').toLocaleString('default', { month: 'short', year: 'numeric' }),
      }));

    res.json({ trend: result });
  } catch (error) {
    next(error);
  }
};

exports.getCategories = (req, res) => {
  res.json({ categories: Transaction.CATEGORIES });
};
