import pool from '../config/database';

export interface Favorite {
    id: number;
    user_id: number;
    city_name: string;
    country_code: string | null;
    latitude: number | null;
    longitude: number | null;
    created_at: Date;
}

export interface CreateFavoriteDTO {
    user_id: number;
    city_name: string;
    country_code?: string;
    latitude?: number;
    longitude?: number;
}

class FavoriteModel {
    /**
     * Get all favorites for a user
     */
    async getAllByUserId(userId: number): Promise<Favorite[]> {
        const query = `
            SELECT * FROM favorite_cities 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        `;

        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    /**
     * Add a city to favorites
     */
    async create(favoriteData: CreateFavoriteDTO): Promise<Favorite> {
        const { user_id, city_name, country_code, latitude, longitude } = favoriteData;

        const query = `
            INSERT INTO favorite_cities (user_id, city_name, country_code, latitude, longitude)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const values = [
            user_id,
            city_name,
            country_code || null,
            latitude || null,
            longitude || null
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    /**
     * Delete a favorite by ID
     */
    async delete(id: number, userId: number): Promise<boolean> {
        const query = 'DELETE FROM favorite_cities WHERE id = $1 AND user_id = $2';
        const result = await pool.query(query, [id, userId]);

        return result.rowCount !== null && result.rowCount > 0;
    }

    /**
     * Check if a city is already in favorites
     */
    async exists(userId: number, cityName: string): Promise<boolean> {
        const query = `
            SELECT id FROM favorite_cities 
            WHERE user_id = $1 AND LOWER(city_name) = LOWER($2)
        `;

        const result = await pool.query(query, [userId, cityName]);
        return result.rows.length > 0;
    }

    /**
     * Get a specific favorite by ID
     */
    async findById(id: number, userId: number): Promise<Favorite | null> {
        const query = 'SELECT * FROM favorite_cities WHERE id = $1 AND user_id = $2';
        const result = await pool.query(query, [id, userId]);

        return result.rows[0] || null;
    }

    /**
     * Get count of favorites for a user
     */
    async getCount(userId: number): Promise<number> {
        const query = 'SELECT COUNT(*) as count FROM favorite_cities WHERE user_id = $1';
        const result = await pool.query(query, [userId]);

        return parseInt(result.rows[0].count);
    }
}

export default new FavoriteModel();
