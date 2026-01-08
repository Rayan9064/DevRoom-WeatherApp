import React, { useState, useEffect } from 'react';
import { weatherService } from '../services/weatherService';
import { toast } from 'react-toastify';
import { favoritesService } from '../services/favoritesService';
import WeatherCard from '../components/WeatherCard';
import type { WeatherData, Favorite } from '../types';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(false);

    // Initial favorites load
    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const response = await favoritesService.getFavorites();
            if (response.data?.favorites) {
                setFavorites(response.data.favorites);
            }
        } catch (err) {
            console.error('Failed to load favorites', err);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!city.trim()) return;

        setLoading(true);

        try {
            const response = await weatherService.getWeatherByCity(city);
            if (response.data) {
                setWeather(response.data);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'City not found');
            setWeather(null);
        } finally {
            setLoading(false);
        }
    };

    const handleFavoriteClick = async (favCity: string) => {
        setCity(favCity);
        setLoading(true);

        try {
            const response = await weatherService.getWeatherByCity(favCity);
            if (response.data) {
                setWeather(response.data);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to load weather data');
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async () => {
        if (!weather) return;

        try {
            const isFav = favorites.some(f => f.city_name.toLowerCase() === weather.city.toLowerCase());

            if (isFav) {
                const favorite = favorites.find(f => f.city_name.toLowerCase() === weather.city.toLowerCase());
                if (favorite) {
                    await favoritesService.removeFavorite(favorite.id);
                    setFavorites(favorites.filter(f => f.id !== favorite.id));
                    toast.success(`${weather.city} removed from favorites`);
                }
            } else {
                const response = await favoritesService.addFavorite(
                    weather.city,
                    weather.country,
                    weather.coordinates.lat,
                    weather.coordinates.lon
                );
                if (response.data?.favorite) {
                    setFavorites([...favorites, response.data.favorite]);
                    toast.success(`${weather.city} added to favorites`);
                }
            }
        } catch (err) {
            console.error('Failed to update favorites', err);
            toast.error('Failed to update favorite status');
        }
    };

    return (
        <div className="dashboard container fade-in">
            <div className="search-section">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search for a city..."
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary search-btn" disabled={loading}>
                        {loading ? <div className="spinner"></div> : 'Search'}
                    </button>
                </form>
            </div>

            <div className="dashboard-content">
                <div className="main-weather">
                    {weather ? (
                        <WeatherCard
                            weather={weather}
                            isFavorite={favorites.some(f => f.city_name.toLowerCase() === weather.city.toLowerCase())}
                            onToggleFavorite={toggleFavorite}
                        />
                    ) : (
                        !loading && (
                            <div className="empty-state glass">
                                <div className="empty-icon">🌤️</div>
                                <h2>Explore the Weather</h2>
                                <p>Search for a city or select a favorite to get started</p>
                            </div>
                        )
                    )}
                </div>

                <div className="favorites-sidebar glass">
                    <h3>Favorite Cities</h3>
                    {favorites.length === 0 ? (
                        <p className="no-favorites">No favorites yet. Add some!</p>
                    ) : (
                        <ul className="favorites-list">
                            {favorites.map(fav => (
                                <li key={fav.id} className="favorite-item" onClick={() => handleFavoriteClick(fav.city_name)}>
                                    <span className="fav-city">{fav.city_name}</span>
                                    <span className="fav-country">{fav.country_code}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
