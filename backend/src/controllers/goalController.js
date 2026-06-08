const Goal = require('../models/Goal');

exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ goals });
  } catch (error) {
    next(error);
  }
};

exports.createGoal = async (req, res, next) => {
  try {
    const { name, targetAmount, targetDate, description, icon, currentAmount } = req.body;
    if (!name || !targetAmount || !targetDate) {
      return res.status(400).json({ error: 'Name, target amount, and target date are required' });
    }

    const goal = await Goal.create({
      user: req.user._id,
      name,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      targetDate: new Date(targetDate),
      description,
      icon: icon || '🎯',
    });

    res.status(201).json({ goal });
  } catch (error) {
    next(error);
  }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    const allowed = ['name', 'targetAmount', 'targetDate', 'description', 'icon'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) goal[field] = req.body[field];
    });

    await goal.save();
    res.json({ goal });
  } catch (error) {
    next(error);
  }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.addContribution = async (req, res, next) => {
  try {
    const { amount, note } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid contribution amount is required' });
    }

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    // Allow overfunding — track full contribution, mark complete when target is met
    goal.currentAmount += Number(amount);
    goal.contributions.push({ amount: Number(amount), note: note || '' });

    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }

    await goal.save();
    res.json({ goal });
  } catch (error) {
    next(error);
  }
};

exports.getGoalCalculations = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    const now = new Date();
    const targetDate = new Date(goal.targetDate);
    const monthsRemaining = Math.max(0,
      (targetDate.getFullYear() - now.getFullYear()) * 12 +
      (targetDate.getMonth() - now.getMonth())
    );

    const remaining = goal.targetAmount - goal.currentAmount;
    const monthlyRequired = monthsRemaining > 0 ? Math.ceil(remaining / monthsRemaining) : remaining;
    const progressPercent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

    const completionDate = monthlyRequired > 0
      ? new Date(now.getFullYear(), now.getMonth() + Math.ceil(remaining / monthlyRequired), 1)
      : now;

    res.json({
      goal,
      calculations: {
        remaining,
        monthsRemaining,
        monthlyRequired,
        progressPercent,
        estimatedCompletionDate: completionDate,
        isOnTrack: completionDate <= targetDate,
      },
    });
  } catch (error) {
    next(error);
  }
};
