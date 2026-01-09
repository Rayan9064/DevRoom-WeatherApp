import React from 'react';
import '../styles/Skeleton.css';

const WeatherCardSkeleton: React.FC = () => {
    return (
        <div className="weather-card glass skeleton-container">
            <div className="weather-header">
                <div>
                    <div className="skeleton skeleton-title"></div>
                    <div className="skeleton skeleton-text" style={{ width: '60%', marginTop: '0.5rem' }}></div>
                </div>
                <div className="skeleton skeleton-icon"></div>
            </div>

            <div className="weather-main">
                <div className="skeleton skeleton-temp"></div>
                <div className="skeleton skeleton-text" style={{ width: '40%', margin: '0.5rem auto' }}></div>
            </div>

            <div className="weather-details-grid">
                {[1, 2, 3, 4].map((i) => (
                    <div className="weather-detail-item" key={i}>
                        <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
                        <div className="skeleton skeleton-text" style={{ width: '80%', marginTop: '0.5rem' }}></div>
                    </div>
                ))}
            </div>

            <div className="weather-details-grid">
                {[1, 2, 3, 4].map((i) => (
                    <div className="weather-detail-item" key={i}>
                        <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
                        <div className="skeleton skeleton-text" style={{ width: '70%', marginTop: '0.5rem' }}></div>
                    </div>
                ))}
            </div>

            <div className="skeleton skeleton-button" style={{ marginTop: '1.5rem' }}></div>
        </div>
    );
};

export default WeatherCardSkeleton;
