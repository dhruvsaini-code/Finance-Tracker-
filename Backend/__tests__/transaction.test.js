const request = require('supertest');
const express = require('express');
const transactionRoutes = require('../routes/transactionRoutes');
const transactionService = require('../services/transactionService');

jest.mock('../services/transactionService');
jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'user123', username: 'testuser' };
    next();
  }
}));
jest.mock('../services/auditService', () => ({
  logAudit: jest.fn().mockResolvedValue({})
}));

// Setup testing express app
const app = express();
app.use(express.json());
app.use('/api/transactions', transactionRoutes);

describe('Transaction Routing & Controller Integration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/transactions', () => {
    it('should fetch list of user transactions', async () => {
      const mockTransactions = [
        { _id: 'tx1', amount: 80, category: 'Groceries', description: 'Trader Joes run', type: 'expense', date: new Date().toISOString() }
      ];
      transactionService.getAll.mockResolvedValue(mockTransactions);

      const res = await request(app).get('/api/transactions');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockTransactions);
    });
  });

  describe('POST /api/transactions', () => {
    it('should create a transaction successfully', async () => {
      const txData = { amount: 15, category: 'Transport', description: 'Bus pass', type: 'expense' };
      const createdTx = { _id: 'tx2', ...txData, date: new Date().toISOString() };
      transactionService.create.mockResolvedValue(createdTx);

      const res = await request(app)
        .post('/api/transactions')
        .send(txData);

      expect(res.status).toBe(201);
      expect(res.body.data).toEqual(createdTx);
    });

    it('should fail transaction validation if amount is negative', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .send({ amount: -15, category: 'Transport', description: 'Bus pass', type: 'expense' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
