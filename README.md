# Weather Dashboard Application

A production-ready full-stack weather dashboard application with real-time weather data, user authentication, and PWA capabilities.

## 🚀 Live Demo

- **Frontend**: [Deploy to Vercel](https://vercel.com)
- **Backend API**: [Deploy to Render](https://render.com)
- **Database**: [Neon.tech PostgreSQL](https://neon.tech)

📖 **[Complete Deployment Guide](./DEPLOYMENT.md)**

---

## ✨ Features

### Core Features
- 🔐 **Secure Authentication** - JWT-based with OTP email verification
- 🌤️ **Real-time Weather Data** - OpenWeatherMap API integration with detailed metrics
- 🏙️ **City Search** - Search weather for any city worldwide
- ⭐ **Favorites Management** - Save and manage favorite cities
- 📱 **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- 💾 **Offline Support** - PWA with service worker for offline access
- ⚡ **Loading Skeletons** - Smooth loading experience
- 🔔 **Offline Banner** - Clear indication when offline
- 📊 **Interactive Weather Metrics** - Tooltips with detailed descriptions on hover (desktop) or tap (mobile)

### Weather Metrics Display
- **Temperature** - Current, feels-like, high/low with explanations
- **Humidity** - Relative humidity with impact description
- **Wind Speed** - Current wind velocity with context
- **Atmospheric Pressure** - Pressure readings with weather implications
- **Visibility** - Distance visibility affected by conditions
- **Sunrise/Sunset** - Precise times for your location
- **Smart Tooltips** - Hover (desktop) or tap (mobile) for metric explanations

### Security Features
- 🛡️ Helmet.js security headers
- 🚦 Rate limiting (DDoS protection)
- 🔒 CORS protection
- 🧹 Input sanitization & XSS protection
- 🔐 Bcrypt password hashing
- 📧 Email verification system

### Performance Features
- ⚡ Response caching (10-minute TTL)
- 🗜️ Response compression
- 📊 Request logging with Winston
- 🎯 Database query optimization

---

## 🏗️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon.tech)
- **Authentication**: JWT + Refresh Tokens + OTP
- **Email**: Resend (for OTP delivery)
- **Logging**: Winston
- **Testing**: Jest
- **Security**: Helmet, Rate Limiting, Input Sanitization

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **State**: React Context API
- **Styling**: CSS3 (Glassmorphism design)
- **PWA**: Service Workers + Web App Manifest
- **Notifications**: React Toastify

### DevOps & Deployment
- **Backend Hosting**: Render
- **Frontend Hosting**: Vercel
- **Database**: Neon.tech (Serverless PostgreSQL)
- **Version Control**: Git + GitHub

---

## 📁 Project Structure

```
weatherapp/
├── backend/                    # Express + TypeScript API
│   ├── src/
│   │   ├── config/            # Database, logger, validation
│   │   ├── controllers/       # Request handlers
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth, cache, sanitization
│   │   ├── services/          # Email service
│   │   └── server.ts          # Entry point
│   ├── tests/                 # Unit & integration tests
│   └── package.json
│
├── frontend/                  # React + Vite SPA
│   ├── public/
│   │   ├── manifest.json      # PWA manifest
│   │   ├── service-worker.js  # Service worker
│   │   └── icons/             # PWA icons
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React Context
│   │   ├── services/          # API services
│   │   ├── utils/             # Helpers (PWA, offline)
│   │   ├── styles/            # CSS files
│   │   └── App.tsx            # Root component
│   └── package.json
│
├── DEPLOYMENT.md              # Deployment guide (Render + Vercel)
├── API_DOCUMENTATION.md       # Complete API reference
├── SECURITY.md                # Security implementation details
├── POSTGRESQL_SETUP.md        # Database setup guide
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- PostgreSQL v14 or higher (or Neon.tech account)
- OpenWeatherMap API key ([Get one free](https://openweathermap.org/api))

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/Rayan9064/DevRoom-WeatherApp.git
cd DevRoom-WeatherApp
```

#### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/weatherdb
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-token-secret-key
OPENWEATHER_API_KEY=your_openweathermap_api_key

# SendGrid Email Configuration
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
EMAIL_FROM=noreply@weatherdashboard.com
EMAIL_FROM_NAME=Weather Dashboard

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Setup Database:**
```bash
# Create database
psql -U postgres -c "CREATE DATABASE weatherdb;"

# Run schema
psql -U postgres -d weatherdb -f src/config/schema.sql

# Test connection
npm run test:db
```

**Start Backend:**
```bash
npm run dev
# Backend runs on http://localhost:5000
```

#### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

**Start Frontend:**
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

#### 4. Open Application
Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Complete deployment guide for Render + Vercel + Neon |
| [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) | Full API reference with examples |
| [EMAIL_SERVICE.md](./docs/EMAIL_SERVICE.md) | Email service setup with Resend |
| [SECURITY.md](./docs/SECURITY.md) | Security features and best practices |
| [TESTING_GUIDE.md](./docs/TESTING_GUIDE.md) | How to test the application |
| [OTP_IMPLEMENTATION.md](./docs/OTP_IMPLEMENTATION.md) | OTP email verification system |
| [PWA_FEATURES.md](./docs/PWA_FEATURES.md) | Progressive Web App features |
| [backend/README.md](./backend/README.md) | Backend-specific documentation |

---

## 🔧 Environment Variables

### Backend (.env)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | `5000` |
| `NODE_ENV` | Environment | No | `development` / `production` |
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | JWT signing secret | Yes | Min 32 characters |
| `JWT_REFRESH_SECRET` | Refresh token secret | Yes | Min 32 characters |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | Yes | From openweathermap.org |
| `SENDGRID_API_KEY` | SendGrid API key | Yes | `SG.xxxx...` |
| `EMAIL_FROM` | Sender email | Yes | `noreply@weatherdashboard.com` |
| `EMAIL_FROM_NAME` | Sender name | Yes | `Weather Dashboard` |
| `CORS_ORIGIN` | Allowed origin | No | `http://localhost:5173` |

### Frontend (.env)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | Yes | `http://localhost:5000/api` |

---

## 📖 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP for registration/password reset
- `POST /api/auth/verify-otp` - Verify OTP and complete action
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile

### Weather
- `GET /api/weather/city/:city` - Get weather by city name
- `GET /api/weather/coordinates?lat=X&lon=Y` - Get weather by coordinates

### Favorites
- `GET /api/favorites` - Get user's favorite cities
- `POST /api/favorites` - Add city to favorites
- `DELETE /api/favorites/:id` - Remove city from favorites

**See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API reference.**

---

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Test database connection
npm run test:db
```

### Manual Testing
See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.

---

## 🚀 Deployment

This application is designed to be deployed on:
- **Backend**: [Render](https://render.com) (or any Node.js hosting)
- **Frontend**: [Vercel](https://vercel.com) (or Netlify, AWS Amplify)
- **Database**: [Neon.tech](https://neon.tech) (serverless PostgreSQL)

### Quick Deploy

1. **Database**: Create Neon.tech PostgreSQL database
2. **Backend**: Deploy to Render and set environment variables
3. **Frontend**: Deploy to Vercel with API URL environment variable

📖 **See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step deployment guide.**

---

## 🔐 Security Features

- ✅ JWT-based authentication with refresh tokens
- ✅ OTP email verification for registration & password reset
- ✅ Rate limiting (100 req/15min general, 5 req/15min auth)
- ✅ Helmet.js security headers (CSP, XSS protection)
- ✅ CORS configuration with origin whitelist
- ✅ Input sanitization and validation
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection middleware
- ✅ Bcrypt password hashing
- ✅ Request size limits (10MB)
- ✅ Secure session handling

**See [SECURITY.md](./SECURITY.md) for detailed security documentation.**

---

## 📱 PWA Features

- ✅ Installable on mobile and desktop
- ✅ Offline support with service workers
- ✅ Cached weather data for offline viewing
- ✅ Background sync (when implemented)
- ✅ Push notifications ready
- ✅ Responsive and mobile-optimized
- ✅ Loading skeletons for better UX

**To install**: Visit the app in your mobile browser and tap "Add to Home Screen"

---

## 🎨 Features Showcase

### Loading Experience
- **Skeleton Loaders**: Smooth skeleton screens while data loads
- **Progress Indicators**: Clear loading states throughout the app
- **Optimistic Updates**: Instant UI feedback for user actions

### Offline Capabilities
- **Service Worker**: Caches assets and API responses
- **Offline Banner**: Shows when connection is lost
- **Cached Data**: View previously searched cities while offline
- **Background Sync**: Queue actions when offline (future enhancement)

### User Experience
- **Toast Notifications**: Non-intrusive feedback messages
- **Error Boundaries**: Graceful error handling
- **Responsive Design**: Perfect on any device
- **Dark Theme**: Modern glassmorphism design
- **Accessibility**: ARIA labels and keyboard navigation

---

## 📊 Performance

- ⚡ **Backend**: Response time < 100ms (cached), < 500ms (API calls)
- ⚡ **Frontend**: Lighthouse score 90+
- ⚡ **Database**: Connection pooling with Neon.tech
- ⚡ **Caching**: 10-minute TTL for weather data
- ⚡ **Compression**: Gzip/Brotli compression enabled

---

## 🛠️ Development

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Jest for unit testing
- Winston for logging
- Git hooks (optional)

### Project Scripts

**Backend:**
```bash
npm run dev          # Development with hot reload
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
npm run test:coverage # Test coverage report
```

**Frontend:**
```bash
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) - Weather data API
- [Neon.tech](https://neon.tech) - Serverless PostgreSQL
- [Render](https://render.com) - Backend hosting
- [Vercel](https://vercel.com) - Frontend hosting

---

## 📞 Support

For issues and questions:
- 🐛 Issues: [GitHub Issues](https://github.com/Rayan9064/DevRoom-WeatherApp/issues)
- 📖 Docs: [Documentation](./docs/API_DOCUMENTATION.md)

---

**Built with ❤️ using React, Node.js, and TypeScript**
