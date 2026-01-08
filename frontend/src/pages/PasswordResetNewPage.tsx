import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/Auth.css';

const PasswordResetNewPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { verifyPasswordResetOTP } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = (location.state as any)?.email;
    const otpCode = (location.state as any)?.otp;

    if (!email || !otpCode) {
        return (
            <div className="auth-container fade-in">
                <div className="auth-card card glass">
                    <div className="auth-header">
                        <h1 className="gradient-text">Invalid Session</h1>
                        <p>Please start the password reset process again.</p>
                    </div>
                    <div className="auth-footer">
                        <p><a href="/forgot-password" className="auth-link">Request password reset</a></p>
                    </div>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Password strength validation
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);

        if (password.length < 6 || !hasUpperCase || !hasLowerCase || !hasNumber) {
            toast.error('Password must be at least 6 characters and include uppercase, lowercase, and a number');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsSubmitting(true);

        try {
            // Complete password reset by calling verifyPasswordResetOTP with newPassword
            await verifyPasswordResetOTP(email, otpCode, password);
            toast.success('Password reset successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container fade-in">
            <div className="auth-card card glass">
                <div className="auth-header">
                    <h1 className="gradient-text">Set New Password</h1>
                    <p>Create a strong password for your account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label" htmlFor="password">New Password</label>
                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className="input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your new password"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat your password"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <div className="spinner"></div> : 'Reset Password'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p><a href="/login" className="auth-link">Back to login</a></p>
                </div>
            </div>
        </div>
    );
};

export default PasswordResetNewPage;
