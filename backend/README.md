# Weather Dashboard Backend

A robust RESTful API built with Node.js, Express, TypeScript, and PostgreSQL for the Weather Dashboard application.

## 🎉 Status: **PRODUCTION READY** ✅

**Last Updated**: January 8, 2026  
**Version**: 1.0.0  
**Security Audit**: ✅ 0 vulnerabilities

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts           # PostgreSQL connection pool
│   │   ├── logger.ts             # Winston logger configuration
│   │   ├── schema.sql            # Database schema
│   │   └── validateEnv.ts        # Environment validation with Joi
│   ├── controllers/
│   │   ├── auth.controller.ts    # Authentication & OTP logic
│   │   ├── favorites.controller.ts # Favorites management
│   │   └── weather.controller.ts # Weather API integration
│   ├── middleware/
│   │   ├── auth.ts               # JWT authentication middleware
│   │   ├── cache.ts              # In-memory caching middleware
│   │   ├── errorHandler.ts       # Global error handling
│   │   └── sanitize.ts           # Input sanitization & XSS protection
│   ├── models/
│   │   ├── Favorite.ts           # Favorites database operations
│   │   ├── OTP.ts                # OTP management for email verification
│   │   ├── RefreshToken.ts       # Refresh token operations
│   │   └── User.ts               # User database operations
│   ├── routes/
│   │   ├── auth.routes.ts        # Auth endpoints
│   │   ├── favorites.routes.ts   # Favorites endpoints
│   │   └── weather.routes.ts     # Weather endpoints
│   ├── services/
│   │   └── emailService.ts       # Email service with Resend
│   ├── types/                    # TypeScript type definitions
│   └── server.ts                 # Express app entry point
├── tests/
│   ├── auth.test.ts              # Authentication tests
│   ├── cache.test.ts             # Cache middleware tests
│   └── sanitize.test.ts          # Sanitization tests
├── logs/                         # Winston log files (auto-generated)
├── .env                          # Environment variables (not in git)
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── jest.config.js                # Jest test configuration
├── package.json                  # Dependencies & scripts
├── setup-database.sql            # Database setup script
├── test-db.js                    # Database test script
├── test-db-connection.js         # Connection test utility
└── tsconfig.json                 # TypeScript configuration
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
See `../DATABASE_SETUP.md` for detailed instructions.

Quick version:
```bash
# Create database
psql -U postgres -c "CREATE DATABASE weatherdb;"

# Run schema
psql -U postgres -d weatherdb -f src/config/schema.sql
```

### 3. Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your credentials
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `OPENWEATHER_API_KEY` - API key from OpenWeatherMap

### 4. Test Database Connection
```bash
npm run test:db
```

### 5. Start Development Server
```bash
npm run dev
```

Server will start on `http://localhost:5000`

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| GET | `/api/auth/profile` | Yes | Get user profile |

### Weather
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/weather/city/:city` | No | Get weather by city name |
| GET | `/api/weather/coordinates` | No | Get weather by lat/lon |

### Favorites
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/favorites` | Yes | Get all favorites |
| GET | `/api/favorites/count` | Yes | Get favorites count |
| POST | `/api/favorites` | Yes | Add favorite |
| DELETE | `/api/favorites/:id` | Yes | Remove favorite |

### System
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |

---

## 🔐 Authentication

Protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Get a token by registering or logging in. Tokens expire in 7 days.

---

## 🧪 Testing

### Test Database Connection
```bash
npm run test:db
```

### Test API Endpoints
See `../TESTING_GUIDE.md` for comprehensive testing instructions.

Quick test:
```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Test123456"}'
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Favorite Cities Table
```sql
CREATE TABLE favorite_cities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city_name VARCHAR(100) NOT NULL,
    country_code VARCHAR(2),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, city_name)
);
```

---

## 🛠️ Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `nodemon src/server.ts` | Start development server with hot reload |
| `npm run build` | `tsc` | Compile TypeScript to JavaScript |
| `npm start` | `node dist/server.js` | Start production server |
| `npm run test:db` | `node test-db.js` | Test database connection |

---

## 🔧 Technologies Used

### Core
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety

### Database
- **PostgreSQL** - Relational database
- **pg** - PostgreSQL client

### Authentication
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT tokens

### Validation & HTTP
- **express-validator** - Input validation
- **axios** - HTTP client for weather API
- **cors** - Cross-origin resource sharing

### Development
- **nodemon** - Auto-restart on changes
- **ts-node** - TypeScript execution
- **dotenv** - Environment variables

---

## 🌍 Environment Variables

**Email Service**: Uses [Resend](https://resend.com) for reliable email delivery. Free tier includes 3,000 emails/month.

### Required
```env
DATABASE_URL=postgresql://user:password@localhost:5432/weatherdb
JWT_SECRET=your_secret_key_here
OPENWEATHER_API_KEY=your_api_key_here
RESEND_API_KEY=your_resend_api_key
```

### Optional
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Weather Dashboard
```

### Email Configuration
1. Sign up at [Resend](https://resend.com)
2. Get your API key from the dashboard
3. Add and verify your domain (or use `onboarding@resend.dev` for testing)
4. Set `RESEND_API_KEY` and `EMAIL_FROM` in `.env`

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT token authentication
- ✅ Protected routes with middleware
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configuration
- ✅ Error handling without exposing sensitive data

---

## 📝 Code Architecture

### MVC Pattern
- **Models** - Database operations and business logic
- **Controllers** - Request handling and response formatting
- **Routes** - Endpoint definitions and middleware

### Middleware Chain
```
Request → CORS → Body Parser → Routes → Auth Middleware → Controller → Response
                                                ↓
                                         Error Handler
```

### Database Layer
```
Controller → Model → Database Pool → PostgreSQL
```

---

## 🐛 Common Issues

### Database Connection Failed
**Error:** `ECONNREFUSED`

**Solution:**
1. Check if PostgreSQL is running
2. Verify DATABASE_URL in `.env`
3. Run `npm run test:db` to diagnose

### Invalid Token
**Error:** `Invalid or expired token`

**Solution:**
1. Token expires in 7 days - login again
2. Check JWT_SECRET is set in `.env`
3. Ensure token format: `Bearer <token>`

### Weather API Error
**Error:** `City not found` or `401`

**Solution:**
1. Verify OPENWEATHER_API_KEY in `.env`
2. Check API key is active (may take a few minutes)
3. Free tier has rate limits (60 calls/min)

---

## 📚 Documentation

- **API Reference:** `../docs/API_DOCUMENTATION.md`
- **Email Service:** `../docs/EMAIL_SERVICE.md`
- **Testing Guide:** `../docs/TESTING_GUIDE.md`
- **Deployment Guide:** `../docs/DEPLOYMENT.md`
- **Security Guide:** `../docs/SECURITY.md`
- **OTP System:** `../docs/OTP_IMPLEMENTATION.md`

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure SSL for database
4. Set up proper CORS origins
5. Use environment-specific database

---

## 🧪 Testing Checklist

- [ ] Database connection successful
- [ ] Server starts without errors
- [ ] Health endpoint responds
- [ ] User registration works
- [ ] User login returns token
- [ ] Protected routes require auth
- [ ] Weather API returns data
- [ ] Favorites CRUD operations work
- [ ] Error handling works correctly
- [ ] Validation catches invalid input

---

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Optional message",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

---

## ✅ Production Features

- **Security**: Helmet, rate limiting, CORS, XSS protection, SQL injection protection, JWT auth
- **Logging**: Winston with log rotation, graceful shutdown handling
- **Performance**: Gzip compression, caching, database connection pooling
- **Reliability**: Global error handling, health checks, environment validation

## 🚀 Production Deployment

### Required Environment Variables
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/weatherdb
JWT_SECRET=minimum_32_characters_secure_random_string
OPENWEATHER_API_KEY=your_api_key
CORS_ORIGIN=https://your-frontend-domain.com
```

### Deploy
```bash
npm ci --production
npm run build
npm start
```

### Health Check
```bash
curl https://your-api.com/health
```

---

## 🎯 Project Status

1. ✅ Backend implementation - **PRODUCTION READY**
2. ✅ Security hardening - **COMPLETE**
3. ✅ Testing framework - **CONFIGURED**
4. ✅ Database migrations - **READY**
5. ✅ Documentation - **COMPLETE**

---

## 👥 Contributing

1. Follow TypeScript best practices
2. Add validation for all inputs
3. Handle errors gracefully
4. Document new endpoints
5. Test before committing
6. Use Winston logger (not console.log)

---

## 📄 License

MIT

---

**Built with ❤️ using Node.js, Express, TypeScript, and PostgreSQL**
