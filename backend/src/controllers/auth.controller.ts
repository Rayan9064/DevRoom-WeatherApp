import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import UserModel from '../models/User';
import RefreshTokenModel from '../models/RefreshToken';
import TokenModel from '../models/Token';
import { generateToken } from '../middleware/auth';
import emailService from '../services/emailService';
import logger from '../config/logger';

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
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

/**
 * Validation rules for password reset request
 */
export const forgotPasswordValidation = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
];

/**
 * Validation rules for password reset
 */
export const resetPasswordValidation = [
    body('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
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

        const { username, email, password } = req.body;

        // Check if email already exists
        const emailExists = await UserModel.emailExists(email);
        if (emailExists) {
            res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
            return;
        }

        // Check if username already exists
        const usernameExists = await UserModel.usernameExists(username);
        if (usernameExists) {
            res.status(409).json({
                success: false,
                message: 'Username already taken'
            });
            return;
        }

        // Create user
        const user = await UserModel.create({ username, email, password });

        // Generate email verification token
        const verificationToken = uuidv4();
        await TokenModel.createEmailVerificationToken(user.id, verificationToken);

        // Send verification email
        await emailService.sendVerificationEmail(user.email, user.username, verificationToken);

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            username: user.username
        });

        // Generate refresh token
        const refreshToken = await RefreshTokenModel.create(user.id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email to verify your account.',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    email_verified: false,
                    created_at: user.created_at
                },
                token,
                refreshToken
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
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

        // Find user by email
        const user = await UserModel.findByEmail(email);
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
            return;
        }

        // Verify password
        const isPasswordValid = await UserModel.verifyPassword(password, user.password_hash);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password'
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
        console.error('Login error:', error);
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
 * Verify email
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;

        // Find verification token
        const tokenData = await TokenModel.findEmailVerificationToken(token);

        if (!tokenData) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
            return;
        }

        // Verify email
        await UserModel.verifyEmail(tokenData.user_id);

        // Delete used token
        await TokenModel.deleteEmailVerificationToken(token);

        // Get user
        const user = await UserModel.findById(tokenData.user_id);

        if (user) {
            // Send welcome email
            await emailService.sendWelcomeEmail(user.email, user.username);
        }

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        logger.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify email',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Resend verification email
 */
export const resendVerification = async (req: Request, res: Response): Promise<void> => {
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

        if (user.email_verified) {
            res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
            return;
        }

        // Generate new verification token
        const verificationToken = uuidv4();
        await TokenModel.createEmailVerificationToken(user.id, verificationToken);

        // Send verification email
        await emailService.sendVerificationEmail(user.email, user.username, verificationToken);

        res.status(200).json({
            success: true,
            message: 'Verification email sent'
        });
    } catch (error) {
        logger.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send verification email',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Forgot password - send reset email
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
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

        const { email } = req.body;

        const user = await UserModel.findByEmail(email);

        // Don't reveal if user exists for security
        if (!user) {
            res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent'
            });
            return;
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        await TokenModel.createPasswordResetToken(user.id, resetToken);

        // Send reset email
        await emailService.sendPasswordResetEmail(user.email, user.username, resetToken);

        res.status(200).json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent'
        });
    } catch (error) {
        logger.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process password reset request',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Reset password
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
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

        const { token, password } = req.body;

        // Find reset token
        const tokenData = await TokenModel.findPasswordResetToken(token);

        if (!tokenData) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
            return;
        }

        // Update password
        await UserModel.updatePassword(tokenData.user_id, password);

        // Mark token as used
        await TokenModel.markPasswordResetTokenAsUsed(token);

        // Delete all refresh tokens for this user (logout from all devices)
        await RefreshTokenModel.deleteAllByUserId(tokenData.user_id);

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. Please login with your new password.'
        });
    } catch (error) {
        logger.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset password',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
