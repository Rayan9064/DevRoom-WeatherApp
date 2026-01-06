import { Router } from 'express';
import {
    getFavorites,
    addFavorite,
    removeFavorite,
    getFavoriteCount,
    addFavoriteValidation
} from '../controllers/favorites.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All favorites routes require authentication
router.use(authenticateToken);

// GET /api/favorites - Get user's favorite cities
router.get('/', getFavorites);

// GET /api/favorites/count - Get count of favorites
router.get('/count', getFavoriteCount);

// POST /api/favorites - Add a city to favorites
router.post('/', addFavoriteValidation, addFavorite);

// DELETE /api/favorites/:id - Remove a city from favorites
router.delete('/:id', removeFavorite);

export default router;
