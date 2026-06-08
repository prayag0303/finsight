const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  month: {
    type: String,
    required: [true, 'Month is required'],
    match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'],
  },
  data: {
    summary: {
      totalIncome: Number,
      totalExpenses: Number,
      netSavings: Number,
      savingsRate: Number,
      transactionCount: Number,
    },
    categoryBreakdown: mongoose.Schema.Types.Mixed,
    highlights: [{
      kind: { type: String, enum: ['positive', 'warning', 'info'] },
      title: String,
      description: String,
    }],
    insights: [{
      category: String,
      message: String,
      trend: String,
    }],
    recommendations: [{
      priority: String,
      title: String,
      description: String,
      impact: String,
    }],
    forecast: {
      nextMonthExpected: Number,
      risks: [String],
      opportunities: [String],
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    rawAIResponse: String,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

reportSchema.index({ user: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);
