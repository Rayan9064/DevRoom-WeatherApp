import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface RefreshToken {
    id: number;
    user_id: number;
    token: string;
    expires_at: Date;
    created_at: Date;
}

class RefreshTokenModel {
    /**
     * Create a new refresh token
     */
    async create(userId: number): Promise<string> {
        // Generate a secure random token
        const token = crypto.randomBytes(64).toString('hex');
        
        // Refresh tokens expire in 30 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const query = `
            INSERT INTO refresh_tokens (user_id, token, expires_at)
            VALUES ($1, $2, $3)
            RETURNING token
        `;

        const result = await pool.query(query, [userId, token, expiresAt]);
        return result.rows[0].token;
    }

    /**
     * Find a refresh token
     */
    async findByToken(token: string): Promise<RefreshToken | null> {
        const query = `
            SELECT * FROM refresh_tokens
            WHERE token = $1 AND expires_at > NOW()
        `;

        const result = await pool.query(query, [token]);
        return result.rows[0] || null;
    }

    /**
     * Delete a specific refresh token (logout)
     */
    async deleteByToken(token: string): Promise<void> {
        const query = 'DELETE FROM refresh_tokens WHERE token = $1';
        await pool.query(query, [token]);
    }

    /**
     * Delete all refresh tokens for a user (logout from all devices)
     */
    async deleteAllByUserId(userId: number): Promise<void> {
        const query = 'DELETE FROM refresh_tokens WHERE user_id = $1';
        await pool.query(query, [userId]);
    }

    /**
     * Clean up expired tokens (can be run periodically)
     */
    async deleteExpired(): Promise<void> {
        const query = 'DELETE FROM refresh_tokens WHERE expires_at <= NOW()';
        await pool.query(query);
    }
}

export default new RefreshTokenModel();
