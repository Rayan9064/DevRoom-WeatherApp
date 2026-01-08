import { Router } from 'express';
import { getWeatherByCity, getWeatherByCoordinates } from '../controllers/weather.controller';
import { cacheMiddleware } from '../middleware/cache';

const router = Router();

// GET /api/weather/city/:city - Get weather data for a city (cached)
router.get('/city/:city', cacheMiddleware, getWeatherByCity);

// GET /api/weather/coordinates?lat=X&lon=Y - Get weather by coordinates (cached)
router.get('/coordinates', cacheMiddleware, getWeatherByCoordinates);

export default router;
