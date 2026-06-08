const mongoose = require('mongoose');

const recurringTemplateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
    required: true,
  },
  category: {
    type: String,
    default: 'Miscellaneous',
  },
  account: {
    type: String,
    default: 'Primary Account',
  },
  notes: {
    type: String,
    default: '',
  },
  frequency: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
    required: true,
  },
  nextDueDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

recurringTemplateSchema.index({ user: 1, nextDueDate: 1 });

module.exports = mongoose.model('RecurringTemplate', recurringTemplateSchema);
