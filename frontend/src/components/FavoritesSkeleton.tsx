import React from 'react';
import '../styles/Skeleton.css';

const FavoritesSkeleton: React.FC = () => {
    return (
        <div className="favorites-sidebar glass">
            <div className="favorites-header">
                <div className="skeleton skeleton-text" style={{ width: '100px' }}></div>
            </div>
            <div className="favorites-list">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div className="favorite-item" key={i}>
                        <div style={{ flex: 1 }}>
                            <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
                            <div className="skeleton skeleton-text" style={{ width: '50%', marginTop: '0.5rem' }}></div>
                        </div>
                        <div className="skeleton skeleton-icon-small"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FavoritesSkeleton;
