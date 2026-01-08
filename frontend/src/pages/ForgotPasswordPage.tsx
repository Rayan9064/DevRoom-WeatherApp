import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/Auth.css';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { sendPasswordResetOTP } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await sendPasswordResetOTP(email);
            toast.success('OTP sent to your email!');
            navigate('/verify-password-reset-otp', {
                state: { email }
            });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsSubmitting(false);
        }
    };

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
