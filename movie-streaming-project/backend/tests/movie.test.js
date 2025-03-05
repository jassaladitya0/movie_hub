const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // Adjust path to your main app file
const Movie = require('../models/movieModel'); // Adjust path to your movie model
const User = require('../models/userModel'); // Adjust path to your user model

describe('Movie API Tests', () => {
  let authToken;
  let createdMovieId;

  // Setup before all tests
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.TEST_MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a test user and get authentication token
    const testUser = await request(app)
      .post('/api/users/signup')
      .send({
        name: 'Test User',
        email: 'movietest@example.com',
        password: 'TestPassword123!'
      });
    
    authToken = testUser.body.token;
  });

  // Cleanup after all tests
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  // Reset database before each test
  beforeEach(async () => {
    await Movie.deleteMany({});
  });

  describe('CREATE Movie', () => {
    it('should create a new movie', async () => {
      const movieData = {
        title: 'Test Movie',
        description: 'A test movie description',
        genre: 'Action',
        releaseYear: 2023,
        rating: 8.5
      };

      const response = await request(app)
        .post('/api/movies')
        .set('Authorization', `Bearer ${authToken}`)
        .send(movieData);

      expect(response.statusCode).toBe(201);
      expect(response.body.data.movie.title).toBe(movieData.title);
      createdMovieId = response.body.data.movie._id;
    });

    it('should not create a movie without authentication', async () => {
      const movieData = {
        title: 'Unauthorized Movie',
        description: 'Should not be created',
        genre: 'Drama'
      };

      const response = await request(app)
        .post('/api/movies')
        .send(movieData);

      expect(response.statusCode).toBe(401);
    });
  });

  describe('READ Movie', () => {
    beforeEach(async () => {
      // Seed some test movies
      await Movie.create([
        { 
          title: 'Movie 1', 
          description: 'Description 1', 
          genre: 'Action', 
          releaseYear: 2022 
        },
        { 
          title: 'Movie 2', 
          description: 'Description 2', 
          genre: 'Comedy', 
          releaseYear: 2023 
        }
      ]);
    });

    it('should get all movies', async () => {
      const response = await request(app)
        .get('/api/movies')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.results).toBeGreaterThan(0);
    });

    it('should get a single movie by ID', async () => {
      const movie = await Movie.findOne({ title: 'Movie 1' });
      
      const response = await request(app)
        .get(`/api/movies/${movie._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data.movie.title).toBe('Movie 1');
    });
  });

  describe('UPDATE Movie', () => {
    it('should update an existing movie', async () => {
      const movie = await Movie.create({
        title: 'Original Title',
        description: 'Original Description',
        genre: 'Drama'
      });

      const response = await request(app)
        .patch(`/api/movies/${movie._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' });

      expect(response.statusCode).toBe(200);
      expect(response.body.data.movie.title).toBe('Updated Title');
    });
  });

  describe('DELETE Movie', () => {
    it('should delete a movie', async () => {
      const movie = await Movie.create({
        title: 'Movie to Delete',
        description: 'Will be removed',
        genre: 'Horror'
      });

      const response = await request(app)
        .delete(`/api/movies/${movie._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(204);
    });
  });
});