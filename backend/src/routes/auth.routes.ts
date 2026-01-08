import { Router } from 'express';
import {
    register,
    login,
    getProfile,
    refreshToken,
    logout,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation
} from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/auth/register - Register new user
router.post('/register', registerValidation, register);

// POST /api/auth/login - Login user
router.post('/login', loginValidation, login);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', refreshToken);

// POST /api/auth/logout - Logout user
router.post('/logout', logout);

// GET /api/auth/profile - Get current user profile (protected)
router.get('/profile', authenticateToken, getProfile);

// GET /api/auth/verify-email/:token - Verify email address
router.get('/verify-email/:token', verifyEmail);

// POST /api/auth/resend-verification - Resend verification email (protected)
router.post('/resend-verification', authenticateToken, resendVerification);

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);

// POST /api/auth/reset-password - Reset password
router.post('/reset-password', resetPasswordValidation, resetPassword);

export default router;
