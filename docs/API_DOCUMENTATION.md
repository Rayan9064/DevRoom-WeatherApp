# Weather Dashboard API Documentation

Base URL: `http://localhost:5000/api`

**Version:** 2.0.0  
**Last Updated:** January 10, 2026

---

## 📋 Table of Contents
- [Authentication](#authentication)
  - [Register](#register-user)
  - [Login](#login-user)
  - [Refresh Token](#refresh-access-token)
  - [Logout](#logout-user)
  - [Get Profile](#get-user-profile)
  - [Email Verification](#verify-email)
  - [Resend Verification](#resend-verification-email)
  - [Forgot Password](#forgot-password)
  - [Reset Password](#reset-password)
- [Weather](#weather)
- [Favorites](#favorites)
- [Response Format](#response-format)
- [Error Codes](#error-codes)

---

## 🔐 Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Register User

**POST** `/auth/register`

Register a new user account. Sends a verification email.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Validation Rules:**
- `username`: 3-50 characters, alphanumeric and underscores only
- `email`: Valid email format
- `password`: Minimum 6 characters, must contain uppercase, lowercase, and number

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "email_verified": false,
      "created_at": "2026-01-08T15:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "a1b2c3d4e5f6..."
  }
}
```

**Error Responses:**
- `400`: Validation failed
- `409`: Email or username already exists

---

### Login User

**POST** `/auth/login`

Authenticate and receive JWT and refresh tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "email_verified": true,
      "created_at": "2026-01-08T15:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "a1b2c3d4e5f6..."
  }
}
```

**Error Responses:**
- `400`: Validation failed
- `401`: Invalid email or password

---

### Refresh Access Token

**POST** `/auth/refresh`

Get a new access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "x9y8z7w6v5u4..."
  }
}
```

**Error Responses:**
- `400`: Refresh token is required
- `401`: Invalid or expired refresh token

---

### Logout User

**POST** `/auth/logout`

Invalidate the refresh token.

**Request Body:**
```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Get User Profile

**GET** `/auth/profile` 🔒

Get the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "email_verified": true,
      "created_at": "2026-01-08T15:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `401`: Unauthorized (missing or invalid token)
- `404`: User not found

---

### Verify Email

**GET** `/auth/verify-email/:token`

Verify user email address using the token from the verification email.

**URL Parameters:**
- `token`: Email verification token (from email link)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Error Responses:**
- `400`: Invalid or expired verification token

---

### Resend Verification Email

**POST** `/auth/resend-verification` 🔒

Resend the email verification email.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

**Error Responses:**
- `400`: Email already verified
- `401`: Unauthorized

---

### Forgot Password

**POST** `/auth/forgot-password`

Request a password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent"
}
```

**Note:** For security, the response is the same whether the email exists or not.

---

### Reset Password

**POST** `/auth/reset-password`

Reset password using the token from the reset email.

**Request Body:**
```json
{
  "token": "abc123def456...",
  "password": "NewSecurePass123"
}
```

**Validation Rules:**
- `password`: Minimum 6 characters, must contain uppercase, lowercase, and number

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully. Please login with your new password."
}
```

**Error Responses:**
- `400`: Invalid or expired reset token, or validation failed

**Note:** All refresh tokens are invalidated (user is logged out from all devices).
---

### Get User Profile

**GET** `/auth/profile`

Get current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "created_at": "2026-01-04T15:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `401`: Unauthorized (missing or invalid token)
- `404`: User not found

---

## 🌤️ Weather

### Get Weather by City Name

**GET** `/weather/city/:city`

Get current weather data for a specific city.

**Parameters:**
- `city` (path): City name (e.g., "London", "New York")

**Example:**
```
GET /api/weather/city/London
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "city": "London",
    "country": "GB",
    "temperature": 15,
    "feels_like": 13,
    "temp_min": 12,
    "temp_max": 18,
    "humidity": 72,
    "pressure": 1013,
    "description": "scattered clouds",
    "icon": "03d",
    "wind_speed": 5.5,
    "clouds": 40,
    "visibility": 10000,
    "sunrise": 1704354000,
    "sunset": 1704387600,
    "timezone": 0,
    "coordinates": {
      "lat": 51.5074,
      "lon": -0.1278
    }
  }
}
```

**Error Responses:**
- `400`: City name is required
- `404`: City not found
- `500`: Weather service error

---

### Get Weather by Coordinates

**GET** `/weather/coordinates`

Get current weather data for specific coordinates.

**Query Parameters:**
- `lat` (required): Latitude (-90 to 90)
- `lon` (required): Longitude (-180 to 180)

**Example:**
```
GET /api/weather/coordinates?lat=51.5074&lon=-0.1278
```

**Success Response (200):**
Same format as "Get Weather by City Name"

**Error Responses:**
- `400`: Latitude and longitude are required
- `500`: Weather service error

---

## ⭐ Favorites

All favorites endpoints require authentication.

### Get All Favorites

**GET** `/favorites`

Get all favorite cities for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "id": 1,
        "user_id": 1,
        "city_name": "London",
        "country_code": "GB",
        "latitude": 51.5074,
        "longitude": -0.1278,
        "created_at": "2026-01-04T15:00:00.000Z"
      },
      {
        "id": 2,
        "user_id": 1,
        "city_name": "Paris",
        "country_code": "FR",
        "latitude": 48.8566,
        "longitude": 2.3522,
        "created_at": "2026-01-04T15:05:00.000Z"
      }
    ],
    "count": 2
  }
}
```

**Error Responses:**
- `401`: Unauthorized

---

### Get Favorites Count

**GET** `/favorites/count`

Get the count of favorite cities for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

**Error Responses:**
- `401`: Unauthorized

---

### Add Favorite

**POST** `/favorites`

Add a city to favorites.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "city_name": "London",
  "country_code": "GB",
  "latitude": 51.5074,
  "longitude": -0.1278
}
```

**Validation Rules:**
- `city_name` (required): 1-100 characters
- `country_code` (optional): 2 characters
- `latitude` (optional): -90 to 90
- `longitude` (optional): -180 to 180

**Success Response (201):**
```json
{
  "success": true,
  "message": "City added to favorites",
  "data": {
    "favorite": {
      "id": 3,
      "user_id": 1,
      "city_name": "London",
      "country_code": "GB",
      "latitude": 51.5074,
      "longitude": -0.1278,
      "created_at": "2026-01-04T15:10:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400`: Validation failed
- `401`: Unauthorized
- `409`: City already in favorites

---

### Remove Favorite

**DELETE** `/favorites/:id`

Remove a city from favorites.

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` (path): Favorite ID

**Example:**
```
DELETE /api/favorites/3
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Favorite removed successfully"
}
```

**Error Responses:**
- `400`: Invalid favorite ID
- `401`: Unauthorized
- `404`: Favorite not found

---

## 📦 Response Format

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "message": "Optional success message",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development)",
  "errors": [] // Validation errors array (if applicable)
}
```

---

## ⚠️ Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (token expired) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 500 | Internal Server Error |

---

## 🔑 Authentication Flow

1. **Register** or **Login** to receive a JWT token
2. Include the token in the `Authorization` header for protected endpoints:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Token expires in 7 days (configurable)
4. If token expires, login again to get a new token

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)

**POST** `/email/send-otp`

Test sending an OTP email for registration or password reset.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "John Doe",
  "otp": "123456",
  "type": "registration"
}
```

**Parameters:**
- `type`: Either `"registration"` or `"password_reset"`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

---

### Send Verification Email

**POST** `/email/send-verification`

Test sending an email verification link.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "John Doe",
  "token": "abc123xyz456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

---

### Send Welcome Email

**POST** `/email/send-welcome`

Test sending a welcome email after successful verification.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "John Doe"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

**Note:** Email service uses [Resend](https://resend.com). Configure `RESEND_API_KEY` and `EMAIL_FROM` in environment variables.

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- Temperature values are in Celsius
- Wind speed is in meters/second
- Coordinates use decimal degrees format
- All endpoints return JSON

---

## 🧪 Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

### Get Weather
```bash
curl http://localhost:5000/api/weather/city/London
```

### Add Favorite (requires token)
```bash
curl -X POST http://localhost:5000/api/favorites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "city_name": "London",
    "country_code": "GB",
    "latitude": 51.5074,
    "longitude": -0.1278
  }'
```
