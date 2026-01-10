import React, { useState } from 'react';
import type { WeatherData } from '../types';
import { weatherService } from '../services/weatherService';
import '../styles/WeatherCard.css';

interface WeatherCardProps {
    weather: WeatherData;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
}

interface MetricInfo {
    label: string;
    icon: string;
    getValue: (weather: WeatherData) => string;
    tooltip: string;
    description: string;
}

const weatherMetrics: MetricInfo[] = [
    {
        label: 'Feels Like',
        icon: '🌡️',
        getValue: (w) => `${Math.round(w.feels_like)}°`,
        tooltip: 'Apparent Temperature',
        description: 'How the temperature actually feels considering wind chill and humidity'
    },
    {
        label: 'High / Low',
        icon: '📊',
        getValue: (w) => `${Math.round(w.temp_max)}° / ${Math.round(w.temp_min)}°`,
        tooltip: 'Temperature Range',
        description: 'Maximum and minimum temperatures expected today'
    },
    {
        label: 'Humidity',
        icon: '💧',
        getValue: (w) => `${w.humidity}%`,
        tooltip: 'Relative Humidity',
        description: 'Amount of moisture in the air - affects comfort and precipitation'
    },
    {
        label: 'Wind',
        icon: '💨',
        getValue: (w) => `${w.wind_speed} m/s`,
        tooltip: 'Wind Speed',
        description: 'Current wind velocity - higher speeds mean windier conditions'
    },
    {
        label: 'Pressure',
        icon: '🎚️',
        getValue: (w) => `${w.pressure} hPa`,
        tooltip: 'Atmospheric Pressure',
        description: 'Air pressure - high pressure brings clear skies, low pressure brings clouds'
    },
    {
        label: 'Visibility',
        icon: '👁️',
        getValue: (w) => `${(w.visibility / 1000).toFixed(1)} km`,
        tooltip: 'Visibility Distance',
        description: 'How far you can see - affected by fog, rain, and air quality'
    },
    {
        label: 'Sunrise',
        icon: '🌅',
        getValue: (w) => new Date((w.sunrise + w.timezone) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
        tooltip: 'Sunrise Time',
        description: 'When the sun rises above the horizon today'
    },
    {
        label: 'Sunset',
        icon: '🌇',
        getValue: (w) => new Date((w.sunset + w.timezone) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
        tooltip: 'Sunset Time',
        description: 'When the sun sets below the horizon today'
    }
];

const WeatherCard: React.FC<WeatherCardProps> = ({ weather, isFavorite, onToggleFavorite }) => {
    const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
    const iconUrl = weatherService.getWeatherIconUrl(weather.icon);

    const handleTooltipToggle = (index: number) => {
        setActiveTooltip(activeTooltip === index ? null : index);
    };

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
                {weatherMetrics.map((metric, index) => (
                    <div 
                        key={index}
                        className="weather-detail-item"
                        onMouseEnter={() => setActiveTooltip(index)}
                        onMouseLeave={() => setActiveTooltip(null)}
                        onClick={() => handleTooltipToggle(index)}
                    >
                        <span className="detail-icon">{metric.icon}</span>
                        <span className="label">{metric.label}</span>
                        <span className="value">{metric.getValue(weather)}</span>
                        
                        {/* Tooltip for larger screens */}
                        {activeTooltip === index && (
                            <div className="metric-tooltip">
                                <div className="tooltip-title">{metric.tooltip}</div>
                                <div className="tooltip-desc">{metric.description}</div>
                            </div>
                        )}
                        
                        {/* Info button for mobile - shows description inline */}
                        <button 
                            className="info-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleTooltipToggle(index);
                            }}
                            aria-label={`Info about ${metric.label}`}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="16" x2="12" y2="12"/>
                                <line x1="12" y1="8" x2="12.01" y2="8"/>
                            </svg>
                        </button>
                        
                        {/* Mobile description (shown when active) */}
                        {activeTooltip === index && (
                            <div className="mobile-description">
                                <strong>{metric.tooltip}:</strong> {metric.description}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeatherCard;
