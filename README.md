# Weather Dashboard Application

A full-stack weather dashboard application that allows users to search for weather information and save favorite cities.

## Tech Stack

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT Authentication

### Frontend
- React
- TypeScript
- Vite
- React Router

## Features

- 🔐 User authentication (register/login)
- 🌤️ Real-time weather data from OpenWeatherMap API
- 🏙️ Search weather by city name
- ⭐ Save and manage favorite cities
- 📱 Responsive design

## Project Structure

```
weatherapp/
├── backend/          # Express + TypeScript backend
│   ├── src/
│   │   ├── config/   # Configuration files
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/         # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   DATABASE_URL=postgresql://username:password@localhost:5432/weatherdb
   JWT_SECRET=your_jwt_secret_key
   OPENWEATHER_API_KEY=your_openweathermap_api_key
   ```

4. Run database migrations (to be implemented)

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

### Backend
- `PORT` - Server port (default: 5000)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token generation
- `OPENWEATHER_API_KEY` - API key from OpenWeatherMap

### Frontend
- `VITE_API_URL` - Backend API URL

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Weather
- `GET /api/weather/:city` - Get weather data for a city

### Favorites
- `GET /api/favorites` - Get user's favorite cities
- `POST /api/favorites` - Add a city to favorites
- `DELETE /api/favorites/:id` - Remove a city from favorites

## Development

- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:5173`

## License

MIT
