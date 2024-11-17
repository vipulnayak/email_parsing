const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Email = require('../models/Email');
const User = require('../models/User');

describe('Integration Tests', () => {
  let token;
  let testUser;

  beforeAll(async () => {
    // Create test user and get token
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123'
    });
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    token = loginResponse.body.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Email.deleteMany({});
    await mongoose.connection.close();
  });

  test('should fetch and process emails', async () => {
    const response = await request(app)
      .get('/api/emails/fetch')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('should get processed emails', async () => {
    const response = await request(app)
      .get('/api/emails')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data.emails)).toBe(true);
  });
}); 