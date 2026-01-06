# Backend Testing Guide

This guide will help you test the Weather Dashboard backend API.

## 🚀 Quick Start

### 1. Setup Environment

Make sure you have:
- ✅ PostgreSQL installed and running
- ✅ Database created and schema loaded
- ✅ `.env` file configured
- ✅ OpenWeatherMap API key

### 2. Test Database Connection

```bash
cd backend
npm run test:db
```

Expected output:
```
✅ Database connection successful!
📋 Tables in database:
   ✓ favorite_cities
   ✓ users
```

### 3. Start the Server

```bash
npm run dev
```

Expected output:
```
🚀 Server is running on port 5000
📍 Environment: development
✅ Connected to PostgreSQL database
```

### 4. Test Health Endpoint

Open browser or use curl:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Weather Dashboard API is running"
}
```

---

## 🧪 Testing Methods

### Option 1: Using cURL (Command Line)

#### Test 1: Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"Test123456\"}"
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "created_at": "2026-01-04T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token** - you'll need it for authenticated requests!

---

#### Test 2: Login

```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"Test123456\"}"
```

---

#### Test 3: Get User Profile (Protected)

Replace `YOUR_TOKEN` with the token from login/register:

```bash
curl http://localhost:5000/api/auth/profile ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### Test 4: Get Weather by City

```bash
curl http://localhost:5000/api/weather/city/London
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "city": "London",
    "country": "GB",
    "temperature": 15,
    "feels_like": 13,
    "description": "scattered clouds",
    ...
  }
}
```

---

#### Test 5: Get Weather by Coordinates

```bash
curl "http://localhost:5000/api/weather/coordinates?lat=51.5074&lon=-0.1278"
```

---

#### Test 6: Add Favorite (Protected)

```bash
curl -X POST http://localhost:5000/api/favorites ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -d "{\"city_name\":\"London\",\"country_code\":\"GB\",\"latitude\":51.5074,\"longitude\":-0.1278}"
```

---

#### Test 7: Get All Favorites (Protected)

```bash
curl http://localhost:5000/api/favorites ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### Test 8: Delete Favorite (Protected)

Replace `1` with the actual favorite ID:

```bash
curl -X DELETE http://localhost:5000/api/favorites/1 ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Option 2: Using PowerShell

For Windows users, here are PowerShell equivalents:

#### Register User
```powershell
$body = @{
    username = "testuser"
    email = "test@example.com"
    password = "Test123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

#### Login
```powershell
$body = @{
    email = "test@example.com"
    password = "Test123456"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body

$token = $response.data.token
Write-Host "Token: $token"
```

#### Get Weather
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/weather/city/London"
```

#### Add Favorite
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

$body = @{
    city_name = "London"
    country_code = "GB"
    latitude = 51.5074
    longitude = -0.1278
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/favorites" `
  -Method Post `
  -Headers $headers `
  -ContentType "application/json" `
  -Body $body
```

---

### Option 3: Using VS Code REST Client Extension

Install the "REST Client" extension, then create a file `test-api.http`:

```http
### Variables
@baseUrl = http://localhost:5000/api
@token = YOUR_TOKEN_HERE

### Health Check
GET http://localhost:5000/health

### Register User
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123456"
}

### Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123456"
}

### Get Profile
GET {{baseUrl}}/auth/profile
Authorization: Bearer {{token}}

### Get Weather - London
GET {{baseUrl}}/weather/city/London

### Get Weather - New York
GET {{baseUrl}}/weather/city/New York

### Get Weather by Coordinates
GET {{baseUrl}}/weather/coordinates?lat=51.5074&lon=-0.1278

### Get All Favorites
GET {{baseUrl}}/favorites
Authorization: Bearer {{token}}

### Add Favorite
POST {{baseUrl}}/favorites
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "city_name": "London",
  "country_code": "GB",
  "latitude": 51.5074,
  "longitude": -0.1278
}

### Delete Favorite (replace 1 with actual ID)
DELETE {{baseUrl}}/favorites/1
Authorization: Bearer {{token}}
```

Click "Send Request" above each request to test!

---

## ✅ Test Checklist

### Authentication Tests
- [ ] Register new user with valid data
- [ ] Try to register with duplicate email (should fail with 409)
- [ ] Try to register with duplicate username (should fail with 409)
- [ ] Try to register with weak password (should fail with 400)
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail with 401)
- [ ] Login with non-existent email (should fail with 401)
- [ ] Get profile with valid token
- [ ] Get profile without token (should fail with 401)
- [ ] Get profile with invalid token (should fail with 403)

### Weather Tests
- [ ] Get weather for valid city (e.g., "London")
- [ ] Get weather for city with spaces (e.g., "New York")
- [ ] Get weather for non-existent city (should fail with 404)
- [ ] Get weather by valid coordinates
- [ ] Get weather without coordinates (should fail with 400)

### Favorites Tests
- [ ] Get favorites (empty list initially)
- [ ] Add a favorite city
- [ ] Try to add duplicate favorite (should fail with 409)
- [ ] Get favorites (should show added city)
- [ ] Get favorites count
- [ ] Delete a favorite
- [ ] Try to delete non-existent favorite (should fail with 404)
- [ ] Try favorites endpoints without token (should fail with 401)

---

## 🐛 Common Issues & Solutions

### Issue: "ECONNREFUSED" when testing database

**Solution:**
1. Make sure PostgreSQL is running
2. Check DATABASE_URL in .env
3. Run `npm run test:db` to diagnose

---

### Issue: "City not found" for weather

**Solution:**
1. Check your OPENWEATHER_API_KEY in .env
2. Verify the API key is active (may take a few minutes after creation)
3. Try a simple city name like "London" first

---

### Issue: "Invalid or expired token"

**Solution:**
1. Make sure you're using the latest token from login/register
2. Check that JWT_SECRET is set in .env
3. Token expires in 7 days - login again if expired

---

### Issue: Validation errors

**Solution:**
Check the error response for specific validation requirements:
- Username: 3-50 chars, alphanumeric + underscores
- Email: Valid email format
- Password: Min 6 chars, must have uppercase, lowercase, and number

---

## 📊 Expected Database State After Tests

After running all tests, your database should have:

**Users table:**
```sql
SELECT id, username, email, created_at FROM users;
```
Should show your test user(s)

**Favorite Cities table:**
```sql
SELECT * FROM favorite_cities;
```
Should show any favorites you added

---

## 🔍 Debugging Tips

### Enable Detailed Logging

Add to your `.env`:
```env
NODE_ENV=development
```

This will show detailed error messages in responses.

### Check Server Logs

Watch the terminal where `npm run dev` is running for:
- Database connection messages
- Request logs
- Error details

### Test Database Queries Directly

```bash
psql -U postgres -d weatherdb
```

```sql
-- Check users
SELECT * FROM users;

-- Check favorites
SELECT * FROM favorite_cities;

-- Check user's favorites
SELECT fc.*, u.username 
FROM favorite_cities fc 
JOIN users u ON fc.user_id = u.id;
```

---

## 📝 Test Results Template

Use this template to track your testing:

```
Date: ___________
Tester: ___________

✅ Database Connection: PASS / FAIL
✅ Server Starts: PASS / FAIL
✅ Health Endpoint: PASS / FAIL

Authentication:
✅ Register: PASS / FAIL
✅ Login: PASS / FAIL
✅ Get Profile: PASS / FAIL

Weather:
✅ Get by City: PASS / FAIL
✅ Get by Coordinates: PASS / FAIL

Favorites:
✅ Get All: PASS / FAIL
✅ Add Favorite: PASS / FAIL
✅ Delete Favorite: PASS / FAIL

Notes:
_________________________________
_________________________________
```

---

## 🎯 Next Steps

Once all tests pass:

1. ✅ Backend is fully functional!
2. 📝 Document any custom changes
3. 🎨 Start frontend development
4. 🔗 Integrate frontend with backend
5. 🚀 Deploy to production

---

For more details, see:
- `API_DOCUMENTATION.md` - Complete API reference
- `DATABASE_SETUP.md` - Database setup guide
- `PROJECT_STATUS.md` - Project progress tracker
