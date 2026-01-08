import db from '../config/database';
import logger from '../config/logger';

interface OTP {
    id?: number;
    email: string;
    otp_code: string;
    type: 'registration' | 'password_reset';
    user_id?: number;
    username?: string;
    password_hash?: string;
    is_verified: boolean;
    expires_at: Date;
    created_at?: Date;
}

class OTPModel {
    /**
     * Create OTP record
     */
    static async create(
        email: string,
        otpCode: string,
        type: 'registration' | 'password_reset',
        expiresIn: number = 300 // 5 minutes in seconds
    ): Promise<boolean> {
        try {
            const expiresAt = new Date(Date.now() + expiresIn * 1000);
            
            await db.query(
                `INSERT INTO otps (email, otp_code, type, is_verified, expires_at)
                 VALUES ($1, $2, $3, $4, $5)`,
                [email, otpCode, type, false, expiresAt]
            );
            
            logger.info(`OTP created for ${email} (type: ${type})`);
            return true;
        } catch (error) {
            logger.error('OTP creation error:', error);
            throw error;
        }
    }

    /**
     * Create OTP with registration data
     */
    static async createWithRegistrationData(
        email: string,
        otpCode: string,
        username: string,
        passwordHash: string,
        expiresIn: number = 300
    ): Promise<boolean> {
        try {
            const expiresAt = new Date(Date.now() + expiresIn * 1000);
            
            await db.query(
                `INSERT INTO otps (email, otp_code, type, username, password_hash, is_verified, expires_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [email, otpCode, 'registration', username, passwordHash, false, expiresAt]
            );
            
            logger.info(`OTP created for registration: ${email}`);
            return true;
        } catch (error) {
            logger.error('OTP creation error:', error);
            throw error;
        }
    }

    /**
     * Verify OTP
     */
    static async verify(email: string, otpCode: string, type: 'registration' | 'password_reset'): Promise<OTP | null> {
        try {
            const result = await db.query(
                `SELECT * FROM otps 
                 WHERE email = $1 AND otp_code = $2 AND type = $3 
                 AND is_verified = false AND expires_at > NOW()
                 ORDER BY created_at DESC LIMIT 1`,
                [email, otpCode, type]
            );
            
            if (result.rows.length === 0) {
                logger.warn(`OTP verification failed for ${email}`);
                return null;
            }
            
            const otp = result.rows[0];
            
            // Mark as verified
            await db.query(
                `UPDATE otps SET is_verified = true WHERE id = $1`,
                [otp.id]
            );
            
            logger.info(`OTP verified for ${email}`);
            return otp;
        } catch (error) {
            logger.error('OTP verification error:', error);
            throw error;
        }
    }

    /**
     * Get registration data from verified OTP
     */
    static async getRegistrationData(email: string, otpCode: string): Promise<{ username: string; password_hash: string } | null> {
        try {
            const otp = await this.verify(email, otpCode, 'registration');
            
            if (!otp || !otp.username || !otp.password_hash) {
                return null;
            }
            
            return {
                username: otp.username,
                password_hash: otp.password_hash
            };
        } catch (error) {
            logger.error('Get registration data error:', error);
            throw error;
        }
    }

    /**
     * Clean up expired OTPs
     */
    static async deleteExpired(): Promise<void> {
        try {
            const result = await db.query(
                `DELETE FROM otps WHERE expires_at < NOW()`
            );
            
            logger.info(`Cleaned up ${result.rowCount} expired OTPs`);
        } catch (error) {
            logger.error('OTP cleanup error:', error);
            throw error;
        }
    }

    /**
     * Delete OTP by email and type
     */
    static async deleteByEmailAndType(email: string, type: 'registration' | 'password_reset'): Promise<void> {
        try {
            await db.query(
                `DELETE FROM otps WHERE email = $1 AND type = $2`,
                [email, type]
            );
            
            logger.info(`OTP deleted for ${email}`);
        } catch (error) {
            logger.error('OTP deletion error:', error);
            throw error;
        }
    }
}

export default OTPModel;
