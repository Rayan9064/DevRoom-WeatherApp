import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useState } from 'react';
import Logo from '../components/Logo';
import '../styles/Auth.css';

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { sendRegistrationOTP } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        // Password strength validation
        // Min 6 chars, uppercase, lowercase, number
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
            await sendRegistrationOTP(email, username, password);
            toast.success('OTP sent to your email!');
            navigate('/verify-registration-otp', {
                state: { email, username, password }
            });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container fade-in">
            <div className="auth-card register-card card glass">
                <Logo size="large" className="centered" />
                <div className="auth-header">
                    <h1 className="gradient-text">Create Account</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="register-form-grid">
                        <div className="input-group">
                            <label className="input-label" htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                className="input"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                required
                                minLength={3}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label" htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label" htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className="input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm Password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <div className="spinner"></div> : 'Register'}
                        </button>
                    </div>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login" className="auth-link">Login here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
