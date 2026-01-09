import React, { useState, useEffect } from 'react';
import '../styles/OfflineBanner.css';

const OfflineBanner: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="offline-banner">
            <div className="offline-content">
                <span className="offline-icon">📡</span>
                <span className="offline-text">You are currently offline. Some features may be limited.</span>
            </div>
        </div>
    );
};

export default OfflineBanner;
