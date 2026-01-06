import { Router } from 'express';
import { getWeatherByCity, getWeatherByCoordinates } from '../controllers/weather.controller';

const router = Router();

// GET /api/weather/city/:city - Get weather data for a city
router.get('/city/:city', getWeatherByCity);

// GET /api/weather/coordinates?lat=X&lon=Y - Get weather by coordinates
router.get('/coordinates', getWeatherByCoordinates);

export default router;
