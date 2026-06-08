require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../src/models/User');
const Transaction = require('../src/models/Transaction');
const Budget = require('../src/models/Budget');
const Goal = require('../src/models/Goal');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finance_dashboard';

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateTransactions = (userId) => {
  const transactions = [];
  const now = new Date();

  for (let m = 11; m >= 0; m--) {
    const year = now.getFullYear();
    const month = now.getMonth() - m;
    const adjustedDate = new Date(year, month, 1);
    const y = adjustedDate.getFullYear();
    const mo = adjustedDate.getMonth();

    transactions.push({
      user: userId, type: 'credit', date: new Date(y, mo, randomBetween(1, 3)),
      description: 'Monthly Salary Credit - TechCorp India',
      amount: randomBetween(72000, 78000), category: 'Salary', account: 'HDFC Salary Account',
    });

    if (randomBetween(1, 4) === 1) {
      transactions.push({
        user: userId, type: 'credit', date: new Date(y, mo, randomBetween(10, 25)),
        description: 'Freelance Project Payment - Upwork',
        amount: randomBetween(5000, 15000), category: 'Salary', account: 'HDFC Salary Account',
      });
    }

    transactions.push({
      user: userId, type: 'debit', date: new Date(y, mo, 5),
      description: 'Monthly Rent Payment - Koramangala Flat',
      amount: 22000, category: 'Rent', account: 'HDFC Salary Account',
    });

    transactions.push({
      user: userId, type: 'debit', date: new Date(y, mo, randomBetween(1, 5)),
      description: 'Groww SIP - Nifty 50 Index Fund',
      amount: 5000, category: 'Investments', account: 'HDFC Salary Account',
    });

    const foodExpenses = [
      { desc: 'Zomato Order - Sunday Brunch', amt: () => randomBetween(300, 800) },
      { desc: 'Swiggy - Dinner', amt: () => randomBetween(250, 600) },
      { desc: 'Starbucks Coffee', amt: () => randomBetween(350, 600) },
      { desc: 'Café Coffee Day', amt: () => randomBetween(200, 400) },
      { desc: 'BigBasket Grocery Order', amt: () => randomBetween(1500, 3500) },
      { desc: 'Blinkit - Quick Groceries', amt: () => randomBetween(400, 900) },
      { desc: 'Local Restaurant - Lunch', amt: () => randomBetween(150, 400) },
      { desc: 'Zepto - Vegetables & Fruits', amt: () => randomBetween(300, 700) },
    ];
    for (let d = 0; d < randomBetween(6, 10); d++) {
      const item = randomFrom(foodExpenses);
      transactions.push({
        user: userId, type: 'debit',
        date: new Date(y, mo, randomBetween(1, 28)),
        description: item.desc, amount: item.amt(),
        category: 'Food & Dining', account: 'HDFC Savings Account',
      });
    }

    const travelExpenses = [
      { desc: 'Uber Ride - Office Commute', amt: () => randomBetween(150, 400) },
      { desc: 'Ola Cab - Airport Drop', amt: () => randomBetween(300, 800) },
      { desc: 'Rapido Bike - Quick Commute', amt: () => randomBetween(50, 150) },
      { desc: 'BMTC Bus Pass Recharge', amt: () => randomBetween(500, 1500) },
      { desc: 'IRCTC Train Ticket', amt: () => randomBetween(400, 1500) },
    ];
    for (let d = 0; d < randomBetween(4, 8); d++) {
      const item = randomFrom(travelExpenses);
      transactions.push({
        user: userId, type: 'debit',
        date: new Date(y, mo, randomBetween(1, 28)),
        description: item.desc, amount: item.amt(),
        category: 'Travel', account: 'HDFC Savings Account',
      });
    }

    transactions.push({ user: userId, type: 'debit', date: new Date(y, mo, 10), description: 'Netflix Subscription', amount: 649, category: 'Entertainment', account: 'HDFC Savings Account' });
    transactions.push({ user: userId, type: 'debit', date: new Date(y, mo, 12), description: 'Spotify Premium', amount: 119, category: 'Entertainment', account: 'HDFC Savings Account' });
    transactions.push({ user: userId, type: 'debit', date: new Date(y, mo, 15), description: 'Amazon Prime Subscription', amount: 299, category: 'Entertainment', account: 'HDFC Savings Account' });

    transactions.push({
      user: userId, type: 'debit', date: new Date(y, mo, 7),
      description: 'Airtel Broadband Bill', amount: randomBetween(799, 999),
      category: 'Utilities', account: 'HDFC Savings Account',
    });
    transactions.push({
      user: userId, type: 'debit', date: new Date(y, mo, 8),
      description: 'Jio Mobile Recharge', amount: randomBetween(239, 299),
      category: 'Utilities', account: 'HDFC Savings Account',
    });
    transactions.push({
      user: userId, type: 'debit', date: new Date(y, mo, 20),
      description: 'BESCOM Electricity Bill', amount: randomBetween(800, 1800),
      category: 'Utilities', account: 'HDFC Savings Account',
    });

    const shoppingExpenses = [
      { desc: 'Amazon.in Order', amt: () => randomBetween(500, 3000) },
      { desc: 'Flipkart Purchase', amt: () => randomBetween(600, 2500) },
      { desc: 'Myntra Clothes', amt: () => randomBetween(800, 2500) },
    ];
    for (let d = 0; d < randomBetween(1, 3); d++) {
      const item = randomFrom(shoppingExpenses);
      transactions.push({
        user: userId, type: 'debit',
        date: new Date(y, mo, randomBetween(1, 28)),
        description: item.desc, amount: item.amt(),
        category: 'Shopping', account: 'HDFC Savings Account',
      });
    }

    transactions.push({
      user: userId, type: 'debit', date: new Date(y, mo, 3),
      description: 'HDFC Home Loan EMI', amount: 18500,
      category: 'Loan Payment', account: 'HDFC Salary Account',
    });

    if (randomBetween(1, 3) === 1) {
      transactions.push({
        user: userId, type: 'debit',
        date: new Date(y, mo, randomBetween(1, 28)),
        description: 'Apollo Pharmacy - Medicines',
        amount: randomBetween(300, 1500), category: 'Healthcare', account: 'HDFC Savings Account',
      });
    }
  }

  transactions.push({
    user: userId, type: 'debit',
    date: new Date(now.getFullYear(), now.getMonth(), randomBetween(1, 15)),
    description: 'MacBook Pro Accessories - Amazon', amount: 8500,
    category: 'Shopping', account: 'HDFC Savings Account', isAnomaly: true,
    anomalyReason: 'Unusually high Shopping expense',
  });

  return transactions;
};

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Transaction.deleteMany({}),
      Budget.deleteMany({}),
      Goal.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Pass plain text — the User model's pre('save') hook hashes it once
    const user = await User.create({
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'demo123',
      currency: 'INR',
    });
    console.log(`Created user: ${user.email}`);

    const transactions = generateTransactions(user._id);
    await Transaction.insertMany(transactions);
    console.log(`Created ${transactions.length} transactions`);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const budgets = [
      { user: user._id, category: 'Food & Dining', monthlyLimit: 8000, month: currentMonth },
      { user: user._id, category: 'Travel', monthlyLimit: 4000, month: currentMonth },
      { user: user._id, category: 'Entertainment', monthlyLimit: 2000, month: currentMonth },
      { user: user._id, category: 'Shopping', monthlyLimit: 5000, month: currentMonth },
      { user: user._id, category: 'Utilities', monthlyLimit: 3000, month: currentMonth },
      { user: user._id, category: 'Healthcare', monthlyLimit: 2000, month: currentMonth },
    ];
    await Budget.insertMany(budgets);
    console.log('Created budgets');

    await Goal.insertMany([
      {
        user: user._id, name: 'Emergency Fund', icon: '🛡️',
        description: '6 months of expenses as emergency savings',
        targetAmount: 200000, currentAmount: 65000,
        targetDate: new Date(new Date().getFullYear() + 1, 11, 31),
        contributions: [
          { amount: 20000, date: new Date(new Date().setMonth(new Date().getMonth() - 3)), note: 'Initial contribution' },
          { amount: 25000, date: new Date(new Date().setMonth(new Date().getMonth() - 2)), note: 'Bonus savings' },
          { amount: 20000, date: new Date(new Date().setMonth(new Date().getMonth() - 1)), note: 'Monthly savings' },
        ],
      },
      {
        user: user._id, name: 'Europe Vacation', icon: '✈️',
        description: 'Dream vacation to Europe with family',
        targetAmount: 150000, currentAmount: 32000,
        targetDate: new Date(new Date().getFullYear() + 1, 5, 30),
        contributions: [
          { amount: 15000, date: new Date(new Date().setMonth(new Date().getMonth() - 2)), note: 'Vacation fund start' },
          { amount: 17000, date: new Date(new Date().setMonth(new Date().getMonth() - 1)), note: 'Added more' },
        ],
      },
      {
        user: user._id, name: 'New MacBook Pro', icon: '💻',
        description: 'Latest MacBook Pro for development',
        targetAmount: 180000, currentAmount: 80000,
        targetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 4, 1),
        contributions: [
          { amount: 40000, date: new Date(new Date().setMonth(new Date().getMonth() - 2)), note: 'Initial' },
          { amount: 40000, date: new Date(new Date().setMonth(new Date().getMonth() - 1)), note: 'Progress' },
        ],
      },
    ]);
    console.log('Created goals');

    console.log('\n✅ Seed complete!');
    console.log('Demo credentials: demo@example.com / demo123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
