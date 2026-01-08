import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/Auth.css';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const { forgotPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await forgotPassword(email);
            toast.success('Password reset link sent to your email!');
            setEmailSent(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send reset link');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (emailSent) {
        return (
            <div className="auth-container fade-in">
                <div className="auth-card card glass">
                    <div className="auth-header">
                        <h1 className="gradient-text">Check Your Email</h1>
                        <p>We've sent a password reset link to {email}</p>
                    </div>

                    <div className="auth-message success-message">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <p>Please check your email and click the reset link to proceed.</p>
                    </div>

                    <div className="auth-footer">
                        <p>Redirecting to login...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container fade-in">
            <div className="auth-card card glass">
                <div className="auth-header">
                    <h1 className="gradient-text">Forgot Password?</h1>
                    <p>Enter your email to receive a password reset link</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <div className="spinner"></div> : 'Send Reset Link'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Remembered your password? <Link to="/login" className="auth-link">Login here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
