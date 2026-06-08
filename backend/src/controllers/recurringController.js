const RecurringTemplate = require('../models/RecurringTemplate');
const Transaction = require('../models/Transaction');
const { categorize } = require('../services/categorizationService');

const advanceNextDue = (template) => {
  const d = new Date(template.nextDueDate);
  switch (template.frequency) {
    case 'weekly':    d.setDate(d.getDate() + 7);         break;
    case 'monthly':   d.setMonth(d.getMonth() + 1);       break;
    case 'quarterly': d.setMonth(d.getMonth() + 3);       break;
    case 'yearly':    d.setFullYear(d.getFullYear() + 1); break;
  }
  return d;
};

exports.getTemplates = async (req, res, next) => {
  try {
    const templates = await RecurringTemplate.find({ user: req.user._id })
      .sort({ nextDueDate: 1 });
    res.json({ templates });
  } catch (e) { next(e); }
};

exports.createTemplate = async (req, res, next) => {
  try {
    const { description, amount, type, category, account, notes, frequency, nextDueDate } = req.body;
    const autoCategory = category || categorize(description);
    const tmpl = await RecurringTemplate.create({
      user: req.user._id,
      description,
      amount: Number(amount),
      type,
      category: autoCategory,
      account: account || 'Primary Account',
      notes: notes || '',
      frequency,
      nextDueDate: new Date(nextDueDate),
    });
    res.status(201).json({ template: tmpl });
  } catch (e) { next(e); }
};

exports.updateTemplate = async (req, res, next) => {
  try {
    const tmpl = await RecurringTemplate.findOne({ _id: req.params.id, user: req.user._id });
    if (!tmpl) return res.status(404).json({ error: 'Template not found' });

    const allowed = ['description', 'amount', 'type', 'category', 'account', 'notes', 'frequency', 'nextDueDate', 'isActive'];
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) tmpl[f] = req.body[f];
    });
    await tmpl.save();
    res.json({ template: tmpl });
  } catch (e) { next(e); }
};

exports.deleteTemplate = async (req, res, next) => {
  try {
    const tmpl = await RecurringTemplate.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!tmpl) return res.status(404).json({ error: 'Template not found' });
    res.json({ message: 'Template deleted' });
  } catch (e) { next(e); }
};

// Creates a transaction from the template and advances its nextDueDate
exports.postTransaction = async (req, res, next) => {
  try {
    const tmpl = await RecurringTemplate.findOne({ _id: req.params.id, user: req.user._id });
    if (!tmpl) return res.status(404).json({ error: 'Template not found' });

    const tx = await Transaction.create({
      user: req.user._id,
      date: req.body.date ? new Date(req.body.date) : tmpl.nextDueDate,
      description: tmpl.description,
      amount: tmpl.amount,
      type: tmpl.type,
      category: tmpl.category,
      account: tmpl.account,
      notes: tmpl.notes,
      isRecurring: true,
    });

    tmpl.nextDueDate = advanceNextDue(tmpl);
    await tmpl.save();

    res.status(201).json({ transaction: tx, template: tmpl });
  } catch (e) { next(e); }
};

// Skip the current due date without posting a transaction
exports.skipDue = async (req, res, next) => {
  try {
    const tmpl = await RecurringTemplate.findOne({ _id: req.params.id, user: req.user._id });
    if (!tmpl) return res.status(404).json({ error: 'Template not found' });
    tmpl.nextDueDate = advanceNextDue(tmpl);
    await tmpl.save();
    res.json({ template: tmpl });
  } catch (e) { next(e); }
};
