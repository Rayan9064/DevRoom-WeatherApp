import api from './authService';
import type { Favorite, ApiResponse } from '../types';

export const favoritesService = {
    async getFavorites(): Promise<ApiResponse<{ favorites: Favorite[]; count: number }>> {
        const response = await api.get<ApiResponse<{ favorites: Favorite[]; count: number }>>('/favorites');
        return response.data;
    },

    async addFavorite(
        city_name: string,
        country_code: string,
        latitude: number,
        longitude: number
    ): Promise<ApiResponse<{ favorite: Favorite }>> {
        const response = await api.post<ApiResponse<{ favorite: Favorite }>>('/favorites', {
            city_name,
            country_code,
            latitude,
            longitude,
        });
        return response.data;
    },

    async removeFavorite(id: number): Promise<ApiResponse<void>> {
        const response = await api.delete<ApiResponse<void>>(`/favorites/${id}`);
        return response.data;
    },

    async getFavoritesCount(): Promise<ApiResponse<{ count: number }>> {
        const response = await api.get<ApiResponse<{ count: number }>>('/favorites/count');
        return response.data;
    },
};
