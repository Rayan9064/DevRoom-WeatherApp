export interface User {
    id: number;
    username: string;
    email: string;
    created_at: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

export interface WeatherData {
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

export interface Favorite {
    id: number;
    user_id: number;
    city_name: string;
    country_code: string;
    latitude: number;
    longitude: number;
    created_at: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    errors?: string[];
}
