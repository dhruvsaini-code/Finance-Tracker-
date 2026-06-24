const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('../routes/authRoutes');
const authService = require('../services/authService');

jest.mock('../services/authService');
jest.mock('../services/auditService', () => ({
  logAudit: jest.fn().mockResolvedValue({})
}));

// Setup simple Express app for testing routing
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

// Mock environmental keys
process.env.JWT_SECRET = 'test_secret_123';
process.env.JWT_REFRESH_SECRET = 'test_refresh_123';

describe('Auth Routing & Controller Integration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register user successfully and return access token', async () => {
      const mockUser = { _id: 'user1', username: 'testuser', email: 'test@example.com', role: 'user' };
      authService.register.mockResolvedValue({
        user: mockUser,
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', email: 'test@example.com', password: 'Password123!' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBe('mock_access_token');
      expect(res.body.user).toEqual(mockUser);
    });

    it('should fail registration validation if email is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', email: 'invalid-email', password: 'Password123!' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should log in user successfully and return tokens', async () => {
      const mockUser = { _id: 'user1', username: 'testuser', email: 'test@example.com', role: 'user' };
      authService.login.mockResolvedValue({
        user: mockUser,
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'Password123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBe('mock_access_token');
      expect(res.body.user).toEqual(mockUser);
    });
  });
});
