const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Goal name is required'],
    trim: true,
    maxlength: [100, 'Goal name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1, 'Target amount must be positive'],
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount cannot be negative'],
  },
  targetDate: {
    type: Date,
    required: [true, 'Target date is required'],
  },
  icon: {
    type: String,
    default: '🎯',
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  contributions: [{
    amount: Number,
    date: { type: Date, default: Date.now },
    note: String,
  }],
}, {
  timestamps: true,
});

goalSchema.virtual('progressPercent').get(function () {
  return Math.min(100, Math.round((this.currentAmount / this.targetAmount) * 100));
});

goalSchema.virtual('remainingAmount').get(function () {
  return Math.max(0, this.targetAmount - this.currentAmount);
});

goalSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Goal', goalSchema);
