const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const User = require('../../src/models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('Authentication Flow', () => {
  it('should register a new user', async () => {
    const userData = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(userData.email);
    expect(res.body.user.username).toBe(userData.username);
    expect(res.body.user.password).toBeUndefined(); // Password should not be returned
  });

  it('should login existing user', async () => {
    // First register a user
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    await request(app)
      .post('/api/auth/register')
      .send(userData);

    // Then login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: userData.password,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(userData.email);
  });

  it('should return 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('should protect routes with JWT', async () => {
    // Try to access protected route without token
    const res = await request(app)
      .get('/api/auth/profile');

    expect(res.status).toBe(401);
  });
});