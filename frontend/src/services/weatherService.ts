import api from './authService';
import type { WeatherData, ApiResponse } from '../types';

export const weatherService = {
    async getWeatherByCity(city: string): Promise<ApiResponse<WeatherData>> {
        const response = await api.get<ApiResponse<WeatherData>>(`/weather/city/${encodeURIComponent(city)}`);
        return response.data;
    },

    async getWeatherByCoordinates(lat: number, lon: number): Promise<ApiResponse<WeatherData>> {
        const response = await api.get<ApiResponse<WeatherData>>(`/weather/coordinates?lat=${lat}&lon=${lon}`);
        return response.data;
    },

    getWeatherIconUrl(icon: string): string {
        return `https://openweathermap.org/img/wn/${icon}@2x.png`;
    },
};
