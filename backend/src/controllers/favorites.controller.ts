import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import FavoriteModel from '../models/Favorite';
import logger from '../config/logger';

/**
 * Validation rules for adding a favorite
 */
export const addFavoriteValidation = [
    body('city_name')
        .trim()
        .notEmpty()
        .withMessage('City name is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('City name must be between 1 and 100 characters'),

    body('country_code')
        .optional()
        .trim()
        .isLength({ min: 2, max: 2 })
        .withMessage('Country code must be 2 characters'),

    body('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),

    body('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180')
];

/**
 * Get all favorite cities for the authenticated user
 */
export const getFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }

        const favorites = await FavoriteModel.getAllByUserId(req.user.userId);

        res.status(200).json({
            success: true,
            data: {
                favorites,
                count: favorites.length
            }
        });
    } catch (error) {
        logger.error('Get favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch favorites',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Add a city to favorites
 */
export const addFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }

        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }

        const { city_name, country_code, latitude, longitude } = req.body;

        // Check if city already exists in favorites
        const exists = await FavoriteModel.exists(req.user.userId, city_name);
        if (exists) {
            res.status(409).json({
                success: false,
                message: 'City already in favorites'
            });
            return;
        }

        // Add to favorites
        const favorite = await FavoriteModel.create({
            user_id: req.user.userId,
            city_name,
            country_code,
            latitude,
            longitude
        });

        res.status(201).json({
            success: true,
            message: 'City added to favorites',
            data: { favorite }
        });
    } catch (error) {
        logger.error('Add favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add favorite',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Remove a city from favorites
 */
export const removeFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }

        const { id } = req.params;
        const favoriteId = parseInt(id);

        if (isNaN(favoriteId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid favorite ID'
            });
            return;
        }

        // Check if favorite exists and belongs to user
        const favorite = await FavoriteModel.findById(favoriteId, req.user.userId);
        if (!favorite) {
            res.status(404).json({
                success: false,
                message: 'Favorite not found'
            });
            return;
        }

        // Delete favorite
        const deleted = await FavoriteModel.delete(favoriteId, req.user.userId);

        if (!deleted) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete favorite'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Favorite removed successfully'
        });
    } catch (error) {
        logger.error('Remove favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove favorite',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Get favorite count for user
 */
export const getFavoriteCount = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }

        const count = await FavoriteModel.getCount(req.user.userId);

        res.status(200).json({
            success: true,
            data: { count }
        });
    } catch (error) {
        logger.error('Get favorite count error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get favorite count',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
