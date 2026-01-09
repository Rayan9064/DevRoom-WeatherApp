import React from 'react';
import '../styles/Logo.css';

interface LogoProps {
    size?: 'small' | 'medium' | 'large';
    showText?: boolean;
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', showText = true, className = '' }) => {
    const sizeMap = {
        small: 32,
        medium: 48,
        large: 80
    };

    const iconSize = sizeMap[size];

    return (
        <div className={`logo-container ${size} ${className}`}>
            <img 
                src="/icons/icon-192x192.png" 
                alt="Weather Dashboard" 
                className="logo-icon"
                style={{ width: iconSize, height: iconSize }}
            />
            {showText && (
                <div className="logo-text">
                    <h1 className="logo-title">WeatherDash</h1>
                    <p className="logo-subtitle">Real-time Weather Insights</p>
                </div>
            )}
        </div>
    );
};

export default Logo;
