const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../src/models/User');
const Transaction = require('../src/models/Transaction');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/finance_test';

let token;
let userId;

beforeAll(async () => {
  await mongoose.connect(MONGO_URI);
  await User.deleteMany({ email: /testtx/ });
  await Transaction.deleteMany({});

  const res = await request(app).post('/api/auth/register').send({
    name: 'TX Test User',
    email: 'testtx@example.com',
    password: 'test123456',
  });
  token = res.body.token;
  userId = res.body.user.id;
});

afterAll(async () => {
  await User.deleteMany({ email: /testtx/ });
  await Transaction.deleteMany({ user: userId });
  await mongoose.connection.close();
});

describe('Transactions API', () => {
  let txId;

  describe('POST /api/transactions', () => {
    it('should create a transaction', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '2025-01-15',
          description: 'Salary Credit',
          amount: 50000,
          type: 'credit',
          category: 'Salary',
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.transaction.amount).toBe(50000);
      txId = res.body.transaction._id;
    });

    it('should auto-categorize based on description', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '2025-01-16',
          description: 'Netflix Subscription',
          amount: 649,
          type: 'debit',
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.transaction.category).toBe('Entertainment');
    });

    it('should reject without authentication', async () => {
      const res = await request(app).post('/api/transactions').send({
        date: '2025-01-15', description: 'Test', amount: 100, type: 'debit',
      });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/transactions', () => {
    it('should return user transactions', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.transactions).toBeInstanceOf(Array);
      expect(res.body.pagination).toBeDefined();
    });

    it('should filter by type', async () => {
      const res = await request(app)
        .get('/api/transactions?type=credit')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.transactions.every((t) => t.type === 'credit')).toBe(true);
    });
  });

  describe('PUT /api/transactions/:id', () => {
    it('should update a transaction', async () => {
      const res = await request(app)
        .put(`/api/transactions/${txId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 55000 });
      expect(res.statusCode).toBe(200);
      expect(res.body.transaction.amount).toBe(55000);
    });

    it('should not update another user transaction', async () => {
      const res = await request(app)
        .put('/api/transactions/000000000000000000000000')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 100 });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('should delete a transaction', async () => {
      const createRes = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({ date: '2025-01-20', description: 'To Delete', amount: 100, type: 'debit' });

      const delRes = await request(app)
        .delete(`/api/transactions/${createRes.body.transaction._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(delRes.statusCode).toBe(200);
    });
  });

  describe('GET /api/transactions/stats/overview', () => {
    it('should return financial stats', async () => {
      const res = await request(app)
        .get('/api/transactions/stats/overview')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('totalIncome');
      expect(res.body).toHaveProperty('totalExpenses');
      expect(res.body).toHaveProperty('netSavings');
    });
  });
});
