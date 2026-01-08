import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/Auth.css';

const EmailVerificationPage: React.FC = () => {
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [error, setError] = useState('');
    const { verifyEmail, resendVerification, isAuthenticated } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setError('Verification token is missing');
                return;
            }

            try {
                await verifyEmail(token);
                setStatus('success');
                toast.success('Email verified successfully!');
                setTimeout(() => navigate(isAuthenticated ? '/' : '/login'), 2000);
            } catch (err: any) {
                setStatus('error');
                setError(err.response?.data?.message || 'Verification failed');
                toast.error('Email verification failed');
            }
        };

        verify();
    }, [token, verifyEmail, navigate, isAuthenticated]);

    const handleResendVerification = async () => {
        try {
            await resendVerification();
            toast.success('Verification email resent!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to resend verification email');
        }
    };

    return (
        <div className="auth-container fade-in">
            <div className="auth-card card glass">
                {status === 'verifying' && (
                    <>
                        <div className="auth-header">
                            <h1 className="gradient-text">Verifying Email</h1>
                            <p>Please wait...</p>
                        </div>
                        <div className="auth-message loading-message">
                            <div className="spinner"></div>
                            <p>Verifying your email address...</p>
                        </div>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="auth-header">
                            <h1 className="gradient-text">Email Verified!</h1>
                            <p>Your email has been successfully verified</p>
                        </div>
                        <div className="auth-message success-message">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <p>Redirecting...</p>
                        </div>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="auth-header">
                            <h1 className="gradient-text">Verification Failed</h1>
                            <p>{error}</p>
                        </div>
                        <div className="auth-message error-message">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <p>The verification link may have expired or is invalid.</p>
                        </div>
                        <button
                            onClick={handleResendVerification}
                            className="btn btn-primary btn-block"
                        >
                            Resend Verification Email
                        </button>
                        <div className="auth-footer">
                            <p><Link to="/login" className="auth-link">Back to login</Link></p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EmailVerificationPage;
