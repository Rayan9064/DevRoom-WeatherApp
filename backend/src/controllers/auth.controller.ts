import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import UserModel from '../models/User';
import RefreshTokenModel from '../models/RefreshToken';
import OTPModel from '../models/OTP';
import { generateToken } from '../middleware/auth';
import emailService from '../services/emailService';
import logger from '../config/logger';
import db from '../config/database';

/**
 * Validation rules for registration
 */
export const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

/**
 * Validation rules for login
 */
export const loginValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email or username is required'),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

/**
 * Validation rules for OTP verification
 */
export const sendOTPValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    body('type')
        .isIn(['registration', 'password_reset'])
        .withMessage('Invalid OTP type')
];

export const verifyOTPValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    body('otp')
        .trim()
        .isLength({ min: 6, max: 6 })
        .matches(/^\d+$/)
        .withMessage('OTP must be a 6-digit code'),
    
    body('type')
        .isIn(['registration', 'password_reset'])
        .withMessage('Invalid OTP type'),
    
    // For registration
    body('username')
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters'),
    
    body('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    // For password reset
    body('newPassword')
        .optional()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

/**
 * Register a new user (Legacy - use OTP-based registration instead)
 * This endpoint is deprecated in favor of the OTP flow
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    res.status(410).json({
        success: false,
        message: 'This endpoint is deprecated. Please use OTP-based registration: /api/auth/send-otp'
    });
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
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

        const { email, password } = req.body;
        const loginIdentifier = email.trim();

        // Try to find user by email first, then by username
        let user = null;
        
        // Check if it's an email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(loginIdentifier)) {
            user = await UserModel.findByEmail(loginIdentifier);
        } else {
            // If not email format, treat as username
            user = await UserModel.findByUsername(loginIdentifier);
        }

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid username/email or password'
            });
            return;
        }

        // Verify password
        const isPasswordValid = await UserModel.verifyPassword(password, user.password_hash);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid username/email or password'
            });
            return;
        }

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            username: user.username
        });

        // Generate refresh token
        const refreshToken = await RefreshTokenModel.create(user.id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    email_verified: user.email_verified,
                    created_at: user.created_at
                },
                token,
                refreshToken
            }
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to login',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }

        const user = await UserModel.findById(req.user.userId);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: { user }
        });
    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user profile',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
            return;
        }

        // Find refresh token
        const tokenData = await RefreshTokenModel.findByToken(refreshToken);

        if (!tokenData) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
            return;
        }

        // Get user
        const user = await UserModel.findById(tokenData.user_id);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Generate new access token
        const newAccessToken = generateToken({
            userId: user.id,
            email: user.email,
            username: user.username
        });

        // Optionally, generate new refresh token (rotation)
        await RefreshTokenModel.deleteByToken(refreshToken);
        const newRefreshToken = await RefreshTokenModel.create(user.id);

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                token: newAccessToken,
                refreshToken: newRefreshToken
            }
        });
    } catch (error) {
        logger.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to refresh token',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Logout user
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            await RefreshTokenModel.deleteByToken(refreshToken);
        }

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        logger.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to logout',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Verify email (Deprecated - use OTP verification)
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    res.status(410).json({
        success: false,
        message: 'This endpoint is deprecated. Email verification is now done via OTP.'
    });
};

/**
 * Resend verification email (Deprecated)
 */
export const resendVerification = async (req: Request, res: Response): Promise<void> => {
    res.status(410).json({
        success: false,
        message: 'This endpoint is deprecated. Use OTP-based verification instead.'
    });
};

/**
 * Send OTP for registration or password reset
 */
export const sendOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }

        const { email, type, username, password } = req.body;

        // Check if email already exists for registration
        if (type === 'registration') {
            const emailExists = await UserModel.emailExists(email);
            if (emailExists) {
                res.status(409).json({
                    success: false,
                    message: 'Email already registered'
                });
                return;
            }

            if (!username || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Username and password are required for registration'
                });
                return;
            }
        } else if (type === 'password_reset') {
            // For password reset, check if user exists
            const user = await UserModel.findByEmail(email);
            if (!user) {
                // Don't reveal if user exists for security
                res.status(200).json({
                    success: true,
                    message: 'If an account with that email exists, an OTP has been sent'
                });
                return;
            }
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store hashed OTP (hash is done inside OTPModel.create)
        await OTPModel.create(email, otp, type);

        // Send OTP email
        const userForEmail = type === 'registration' 
            ? username 
            : (await UserModel.findByEmail(email))?.username || 'User';
        
        const emailSent = await emailService.sendOTPEmail(email, userForEmail, otp, type);
        
        // If email service is disabled or fails, log OTP for development
        if (!emailSent && process.env.NODE_ENV === 'development') {
            logger.info(`🔑 [DEV MODE] OTP for ${email}: ${otp}`);
        }

        res.status(200).json({
            success: true,
            message: emailSent 
                ? 'OTP sent to your email address' 
                : 'OTP created (email service unavailable - check server logs in development)'
        });
    } catch (error) {
        logger.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Verify OTP and complete registration or password reset
 */
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }

        const { email, otp: otpCode, type, username, password, newPassword } = req.body;

        // Verify OTP code
        const isOTPValid = await OTPModel.verify(email, otpCode, type);
        if (!isOTPValid) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
            return;
        }

        // Handle registration after OTP verification
        if (type === 'registration') {
            // For registration, user data should be sent in the verify request
            if (!username || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Username and password required for registration'
                });
                return;
            }

            // Check if user already exists
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: 'User already registered'
                });
                return;
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Create user with email_verified = true (since OTP verified)
            const newUser = await UserModel.create(username, email, passwordHash, true);

            // Generate tokens
            const accessToken = generateToken({
                userId: newUser.id,
                email: newUser.email,
                username: newUser.username
            });

            const refreshToken = await RefreshTokenModel.create(newUser.id);

            // Clean up OTP
            await OTPModel.deleteByEmailAndType(email, 'registration');

            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: {
                    user: {
                        id: newUser.id,
                        username: newUser.username,
                        email: newUser.email,
                        email_verified: true
                    },
                    token: accessToken,
                    refreshToken
                }
            });
            return;
        }

        // Handle password reset after OTP verification
        if (type === 'password_reset') {
            // If new password is provided, complete the reset immediately
            if (newPassword) {
                // Validate password
                if (!newPassword || newPassword.length < 6) {
                    res.status(400).json({
                        success: false,
                        message: 'Password must be at least 6 characters'
                    });
                    return;
                }

                // Find user
                const user = await UserModel.findByEmail(email);
                if (!user) {
                    res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                    return;
                }

                // Hash new password
                const passwordHash = await bcrypt.hash(newPassword, 10);

                // Update password
                await db.query(
                    'UPDATE users SET password_hash = $1 WHERE id = $2',
                    [passwordHash, user.id]
                );

                // Clean up OTP
                await OTPModel.deleteByEmailAndType(email, 'password_reset');

                res.status(200).json({
                    success: true,
                    message: 'Password reset successfully'
                });
                return;
            }

            // If new password not provided, just return success and let client prompt for new password
            res.status(200).json({
                success: true,
                message: 'OTP verified successfully. Please enter your new password.',
                verified: true
            });
            return;
        }
    } catch (error) {
        logger.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export default {
    register,
    login,
    getProfile,
    refreshToken,
    logout,
    verifyEmail,
    resendVerification,
    sendOTP,
    verifyOTP
};