import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JWTPayload {
    userId: number;
    email: string;
    username: string;
}

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

/**
 * Middleware to verify JWT token and authenticate user
 */
export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
            return;
        }

        // Verify token
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error('JWT_SECRET is not defined in environment variables');
            res.status(500).json({
                success: false,
                message: 'Server configuration error'
            });
            return;
        }

        const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

        // Attach user info to request
        req.user = decoded;

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

/**
 * Generate JWT token for user
 */
export const generateToken = (payload: JWTPayload): string => {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.sign(payload, jwtSecret, {
        expiresIn: '7d' // Token expires in 7 days
    });
};
