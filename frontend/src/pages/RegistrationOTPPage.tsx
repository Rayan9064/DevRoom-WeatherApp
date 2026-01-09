import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Logo from '../components/Logo';
import '../styles/Auth.css';

const RegistrationOTPPage: React.FC = () => {
    const [otp, setOtp] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [canResend, setCanResend] = useState(false);

    const { verifyRegistrationOTP } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = (location.state as any)?.email;
    const username = (location.state as any)?.username;
    const password = (location.state as any)?.password;

    useEffect(() => {
        if (!email || !username || !password) {
            navigate('/register');
            return;
        }

        // Timer for OTP expiry
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [email, username, password, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otp.length !== 6 || !/^\d+$/.test(otp)) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setIsSubmitting(true);

        try {
            await verifyRegistrationOTP(email, otp, username, password);
            toast.success('Email verified and account created successfully!');
            navigate('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="auth-container fade-in">
            <div className="auth-card card glass">
                <Logo size="large" className="centered" />
                <div className="auth-header">
                    <h1 className="gradient-text">Verify Your Email</h1>
                    <p>We've sent a 6-digit OTP to {email}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label" htmlFor="otp">Enter OTP</label>
                        <input
                            id="otp"
                            type="text"
                            className="input"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            required
                            inputMode="numeric"
                            style={{ fontSize: '2em', letterSpacing: '10px', textAlign: 'center', fontWeight: 'bold' }}
                        />
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        {timeLeft > 0 ? (
                            <p style={{ color: '#999', fontSize: '14px' }}>
                                OTP expires in <strong>{formatTime(timeLeft)}</strong>
                            </p>
                        ) : (
                            <p style={{ color: '#f44336', fontSize: '14px' }}>OTP has expired</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={isSubmitting || timeLeft === 0}
                    >
                        {isSubmitting ? <div className="spinner"></div> : 'Verify OTP'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Didn't receive the code?</p>
                    {canResend ? (
                        <button
                            onClick={() => {
                                setTimeLeft(300);
                                setCanResend(false);
                                toast.info('OTP resent to your email');
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#4dd0e1',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontSize: '14px',
                                padding: 0,
                            }}
                        >
                            Resend OTP
                        </button>
                    ) : (
                        <p style={{ fontSize: '14px', color: '#999' }}>
                            Resend available in {formatTime(timeLeft)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegistrationOTPPage;
