import React from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            toast.info('See you soon! 👋');
            setIsMenuOpen(false);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Logout failed');
        }
    };

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <div className="navbar-brand">
                    <img src="/icons/icon-96x96.png" alt="Weather Dashboard" className="navbar-logo" />
                    <h1 className="gradient-text">WeatherDash</h1>
                </div>

                {user && (
                    <>
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        >
                            {isMenuOpen ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 12h18M3 6h18M3 18h18" />
                                </svg>
                            )}
                        </button>

                        <div className={`navbar-actions ${isMenuOpen ? 'mobile-open' : ''}`}>
                            <div className="user-info">
                                <div className="user-avatar">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="user-details">
                                    <span className="user-name">{user.username}</span>
                                    <span className="user-email">{user.email}</span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="btn btn-secondary btn-logout">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
