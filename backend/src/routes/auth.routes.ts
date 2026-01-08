import { Router } from 'express';
import {
    register,
    login,
    getProfile,
    refreshToken,
    logout,
    verifyEmail,
    resendVerification,
    sendOTP,
    verifyOTP,
    registerValidation,
    loginValidation,
    sendOTPValidation,
    verifyOTPValidation
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

// POST /api/auth/send-otp - Send OTP for registration or password reset
router.post('/send-otp', sendOTPValidation, sendOTP);

// POST /api/auth/verify-otp - Verify OTP
router.post('/verify-otp', verifyOTPValidation, verifyOTP);

export default router;

