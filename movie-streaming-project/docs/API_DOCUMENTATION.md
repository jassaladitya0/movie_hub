# Movie Streaming Platform API Documentation

## Overview
This document provides a comprehensive guide to the Movie Streaming Platform API, detailing available endpoints, request/response formats, and authentication requirements.

## Base URL
```
https://api.moviestreaming.com/v1
```

## Authentication

### User Authentication
All protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Authentication Endpoints

#### User Signup
- **POST** `/api/users/signup`
- Request Body:
  ```json
  {
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "SecurePassword123!",
    "passwordConfirm": "SecurePassword123!"
  }
  ```
- Responses:
  - `201`: User created successfully
  - `400`: Validation error

#### User Login
- **POST** `/api/users/login`
- Request Body:
  ```json
  {
    "email": "johndoe@example.com",
    "password": "SecurePassword123!"
  }
  ```
- Responses:
  - `200`: Login successful
  - `401`: Invalid credentials

## Movie Endpoints

### Get All Movies
- **GET** `/api/movies`
- Query Parameters:
  - `page`: Page number (default: 1)
  - `limit`: Results per page (default: 10)
  - `genre`: Filter by genre
  - `sort`: Sort by field (e.g., `rating`, `-releaseYear`)
- Authentication: Required
- Responses:
  - `200`: List of movies
  - `401`: Unauthorized

### Create Movie
- **POST** `/api/movies`
- Authentication: Admin only
- Request Body:
  ```json
  {
    "title": "Inception",
    "description": "A mind-bending thriller",
    "genre": "Sci-Fi",
    "releaseYear": 2010,
    "rating": 8.8,
    "director": "Christopher Nolan",
    "cast": ["Leonardo DiCaprio", "Joseph Gordon-Levitt"]
  }
  ```
- Responses:
  - `201`: Movie created
  - `400`: Validation error
  - `403`: Forbidden (insufficient permissions)

### Get Single Movie
- **GET** `/api/movies/:id`
- Authentication: Required
- Responses:
  - `200`: Movie details
  - `404`: Movie not found

### Update Movie
- **PATCH** `/api/movies/:id`
- Authentication: Admin only
- Request Body: Partial movie object
- Responses:
  - `200`: Movie updated
  - `403`: Forbidden
  - `404`: Movie not found

### Delete Movie
- **DELETE** `/api/movies/:id`
- Authentication: Admin only
- Responses:
  - `204`: Movie deleted
  - `403`: Forbidden
  - `404`: Movie not found

## User Profile Endpoints

### Get Current User Profile
- **GET** `/api/users/me`
- Authentication: Required
- Responses:
  - `200`: User profile details
  - `401`: Unauthorized

### Update User Profile
- **PATCH** `/api/users/updateMe`
- Authentication: Required
- Request Body:
  ```json
  {
    "name": "Updated Name",
    "email": "newemail@example.com"
  }
  ```
- Responses:
  - `200`: Profile updated
  - `400`: Validation error

## Error Handling
All error responses follow this structure:
```json
{
  "status": "error",
  "message": "Detailed error message",
  "errorCode": "SPECIFIC_ERROR_CODE"
}
```

## Rate Limiting
- Max 100 requests per hour
- Excess requests will receive a `429 Too Many Requests` response

## Versioning
Current API Version: `v1`
Future versions will be supported with backward compatibility

## Support
For API support, contact: `support@moviestreaming.com`
```