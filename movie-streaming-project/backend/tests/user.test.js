const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // Adjust path to your main app file
const User = require('../models/userModel'); // Adjust path to your user model

describe('User Authentication Tests', () => {
  // Setup before all tests
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.TEST_MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Cleanup after all tests
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  // Reset database before each test
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('User Signup', () => {
    it('should signup a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'StrongPassword123!',
        passwordConfirm: 'StrongPassword123!'
      };

      const response = await request(app)
        .post('/api/users/signup')
        .send(userData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('name', userData.name);
      expect(response.body.data.user).toHaveProperty('email', userData.email);
    });

    it('should not signup with existing email', async () => {
      // First signup
      await request(app)
        .post('/api/users/signup')
        .send({
          name: 'First User',
          email: 'existing@example.com',
          password: 'Password123!',
          passwordConfirm: 'Password123!'
        });

      // Attempt to signup with same email
      const response = await request(app)
        .post('/api/users/signup')
        .send({
          name: 'Second User',
          email: 'existing@example.com',
          password: 'AnotherPassword123!',
          passwordConfirm: 'AnotherPassword123!'
        });

      expect(response.statusCode).toBe(400);
    });

    it('should not signup with invalid email', async () => {
      const userData = {
        name: 'Invalid User',
        email: 'invalidemail',
        password: 'Password123!',
        passwordConfirm: 'Password123!'
      };

      const response = await request(app)
        .post('/api/users/signup')
        .send(userData);

      expect(response.statusCode).toBe(400);
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Create a test user before login tests
      await request(app)
        .post('/api/users/signup')
        .send({
          name: 'Login User',
          email: 'loginuser@example.com',
          password: 'LoginPassword123!',
          passwordConfirm: 'LoginPassword123!'
        });
    });

    it('should login user with correct credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'loginuser@example.com',
          password: 'LoginPassword123!'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should not login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'loginuser@example.com',
          password: 'WrongPassword'
        });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('User Profile', () => {
    let authToken;

    beforeEach(async () => {
      // Create and login a user to get token
      const signupResponse = await request(app)
        .post('/api/users/signup')
        .send({
          name: 'Profile User',
          email: 'profileuser@example.com',
          password: 'ProfilePassword123!',
          passwordConfirm: 'ProfilePassword123!'
        });

      authToken = signupResponse.body.token;
    });

    it('should get user profile', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.user).toHaveProperty('name', 'Profile User');
      expect(response.body.data.user).toHaveProperty('email', 'profileuser@example.com');
    });

    it('should update user profile', async () => {
      const response = await request(app)
        .patch('/api/users/updateMe')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Name' });

      expect(response.statusCode).toBe(200);
      expect(response.body.data.user).toHaveProperty('name', 'Updated Name');
    });
  });
});