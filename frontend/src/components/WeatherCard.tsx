import React from 'react';
import type { WeatherData } from '../types';
import { weatherService } from '../services/weatherService';
import '../styles/WeatherCard.css';

interface WeatherCardProps {
    weather: WeatherData;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ weather, isFavorite, onToggleFavorite }) => {
    const iconUrl = weatherService.getWeatherIconUrl(weather.icon);

    return (
        <div className="weather-card glass fade-in">
            <div className="weather-header">
                <div>
                    <h2 className="city-name">
                        {weather.city}, <span className="country-code">{weather.country}</span>
                    </h2>
                    <p className="date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                {onToggleFavorite && (
                    <button
                        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                        onClick={onToggleFavorite}
                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="weather-main">
                <div className="weather-temp">
                    <img src={iconUrl} alt={weather.description} className="weather-icon" />
                    <span className="temp-value">{Math.round(weather.temperature)}°</span>
                </div>
                <div className="weather-desc text-capitalize">{weather.description}</div>
            </div>

            <div className="weather-details-grid">
                <div className="weather-detail-item">
                    <span className="detail-icon">🌡️</span>
                    <span className="label">Feels Like</span>
                    <span className="value">{Math.round(weather.feels_like)}°</span>
                </div>
                <div className="weather-detail-item">
                    <span className="detail-icon">📊</span>
                    <span className="label">High / Low</span>
                    <span className="value">{Math.round(weather.temp_max)}° / {Math.round(weather.temp_min)}°</span>
                </div>
                <div className="weather-detail-item">
                    <span className="detail-icon">💧</span>
                    <span className="label">Humidity</span>
                    <span className="value">{weather.humidity}%</span>
                </div>
                <div className="weather-detail-item">
                    <span className="detail-icon">💨</span>
                    <span className="label">Wind</span>
                    <span className="value">{weather.wind_speed} m/s</span>
                </div>
                <div className="weather-detail-item">
                    <span className="detail-icon">🎚️</span>
                    <span className="label">Pressure</span>
                    <span className="value">{weather.pressure} hPa</span>
                </div>
                <div className="weather-detail-item">
                    <span className="detail-icon">👁️</span>
                    <span className="label">Visibility</span>
                    <span className="value">{(weather.visibility / 1000).toFixed(1)} km</span>
                </div>
                <div className="weather-detail-item">
                    <span className="detail-icon">🌅</span>
                    <span className="label">Sunrise</span>
                    <span className="value">
                        {new Date((weather.sunrise + weather.timezone) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                    </span>
                </div>
                <div className="weather-detail-item">
                    <span className="detail-icon">🌇</span>
                    <span className="label">Sunset</span>
                    <span className="value">
                        {new Date((weather.sunset + weather.timezone) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default WeatherCard;
