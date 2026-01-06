import { Request, Response } from 'express';
import axios from 'axios';

interface WeatherData {
    city: string;
    country: string;
    temperature: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
    description: string;
    icon: string;
    wind_speed: number;
    clouds: number;
    visibility: number;
    sunrise: number;
    sunset: number;
    timezone: number;
    coordinates: {
        lat: number;
        lon: number;
    };
}

/**
 * Get weather data for a city
 */
export const getWeatherByCity = async (req: Request, res: Response): Promise<void> => {
    try {
        const { city } = req.params;

        if (!city || city.trim() === '') {
            res.status(400).json({
                success: false,
                message: 'City name is required'
            });
            return;
        }

        const apiKey = process.env.OPENWEATHER_API_KEY;

        if (!apiKey) {
            console.error('OPENWEATHER_API_KEY is not defined in environment variables');
            res.status(500).json({
                success: false,
                message: 'Weather service configuration error'
            });
            return;
        }

        // Call OpenWeatherMap API
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather`;
        const response = await axios.get(apiUrl, {
            params: {
                q: city,
                appid: apiKey,
                units: 'metric' // Use metric units (Celsius)
            }
        });

        const data = response.data;

        // Format the weather data
        const weatherData: WeatherData = {
            city: data.name,
            country: data.sys.country,
            temperature: Math.round(data.main.temp),
            feels_like: Math.round(data.main.feels_like),
            temp_min: Math.round(data.main.temp_min),
            temp_max: Math.round(data.main.temp_max),
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            wind_speed: data.wind.speed,
            clouds: data.clouds.all,
            visibility: data.visibility,
            sunrise: data.sys.sunrise,
            sunset: data.sys.sunset,
            timezone: data.timezone,
            coordinates: {
                lat: data.coord.lat,
                lon: data.coord.lon
            }
        };

        res.status(200).json({
            success: true,
            data: weatherData
        });
    } catch (error) {
        console.error('Weather API error:', error);

        // Handle specific API errors
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                res.status(404).json({
                    success: false,
                    message: 'City not found'
                });
                return;
            }

            if (error.response?.status === 401) {
                res.status(500).json({
                    success: false,
                    message: 'Weather service authentication failed'
                });
                return;
            }
        }

        res.status(500).json({
            success: false,
            message: 'Failed to fetch weather data',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Get weather data by coordinates
 */
export const getWeatherByCoordinates = async (req: Request, res: Response): Promise<void> => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
            return;
        }

        const apiKey = process.env.OPENWEATHER_API_KEY;

        if (!apiKey) {
            console.error('OPENWEATHER_API_KEY is not defined in environment variables');
            res.status(500).json({
                success: false,
                message: 'Weather service configuration error'
            });
            return;
        }

        // Call OpenWeatherMap API
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather`;
        const response = await axios.get(apiUrl, {
            params: {
                lat: parseFloat(lat as string),
                lon: parseFloat(lon as string),
                appid: apiKey,
                units: 'metric'
            }
        });

        const data = response.data;

        // Format the weather data
        const weatherData: WeatherData = {
            city: data.name,
            country: data.sys.country,
            temperature: Math.round(data.main.temp),
            feels_like: Math.round(data.main.feels_like),
            temp_min: Math.round(data.main.temp_min),
            temp_max: Math.round(data.main.temp_max),
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            wind_speed: data.wind.speed,
            clouds: data.clouds.all,
            visibility: data.visibility,
            sunrise: data.sys.sunrise,
            sunset: data.sys.sunset,
            timezone: data.timezone,
            coordinates: {
                lat: data.coord.lat,
                lon: data.coord.lon
            }
        };

        res.status(200).json({
            success: true,
            data: weatherData
        });
    } catch (error) {
        console.error('Weather API error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch weather data',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
