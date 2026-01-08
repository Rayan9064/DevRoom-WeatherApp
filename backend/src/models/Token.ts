import pool from '../config/database';

export interface EmailVerification {
    id: number;
    user_id: number;
    token: string;
    expires_at: Date;
    created_at: Date;
}

class TokenModel {
    /**
     * Create email verification token
     */
    async createEmailVerificationToken(userId: number, token: string): Promise<void> {
        // Token expires in 24 hours
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const query = `
            INSERT INTO email_verification_tokens (user_id, token, expires_at)
            VALUES ($1, $2, $3)
        `;

        await pool.query(query, [userId, token, expiresAt]);
    }

    /**
     * Find email verification token
     */
    async findEmailVerificationToken(token: string): Promise<EmailVerification | null> {
        const query = `
            SELECT * FROM email_verification_tokens
            WHERE token = $1 AND expires_at > NOW()
        `;

        const result = await pool.query(query, [token]);
        return result.rows[0] || null;
    }

    /**
     * Delete email verification token
     */
    async deleteEmailVerificationToken(token: string): Promise<void> {
        const query = 'DELETE FROM email_verification_tokens WHERE token = $1';
        await pool.query(query, [token]);
    }
}

export default new TokenModel();
