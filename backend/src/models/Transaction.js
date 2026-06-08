const mongoose = require('mongoose');

const CATEGORIES = [
  'Food & Dining', 'Rent', 'Utilities', 'Travel', 'Shopping',
  'Entertainment', 'Healthcare', 'Education', 'Salary', 'Investments',
  'Subscriptions', 'Insurance', 'Loan Payment', 'Miscellaneous',
];

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be positive'],
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: [true, 'Transaction type is required'],
  },
  category: {
    type: String,
    enum: CATEGORIES,
    default: 'Miscellaneous',
  },
  account: {
    type: String,
    trim: true,
    default: 'Primary Account',
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  isAnomaly: {
    type: Boolean,
    default: false,
  },
  anomalyReason: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  tags: [String],
}, {
  timestamps: true,
});

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ user: 1, type: 1 });

transactionSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model('Transaction', transactionSchema);
