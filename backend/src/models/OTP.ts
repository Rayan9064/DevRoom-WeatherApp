import db from '../config/database';
import bcrypt from 'bcryptjs';
import logger from '../config/logger';

interface OTPRecord {
    id?: number;
    email: string;
    otp_hash: string;
    type: 'registration' | 'password_reset';
    is_verified: boolean;
    expires_at: Date;
    created_at?: Date;
}

class OTPModel {
    /**
     * Hash OTP code using bcrypt
     */
    private static async hashOTP(otp: string): Promise<string> {
        const saltRounds = 10;
        return await bcrypt.hash(otp, saltRounds);
    }

    /**
     * Create OTP record with hashed OTP
     * @param email - User email
     * @param otpCode - Plain OTP code (will be hashed before storing)
     * @param type - OTP type: 'registration' or 'password_reset'
     * @param expiresIn - Expiration time in seconds (default 300 = 5 minutes)
     */
    static async create(
        email: string,
        otpCode: string,
        type: 'registration' | 'password_reset',
        expiresIn: number = 300
    ): Promise<void> {
        try {
            // Hash OTP before storing
            const otpHash = await this.hashOTP(otpCode);
            const expiresAt = new Date(Date.now() + expiresIn * 1000);
            
            // Delete any existing unverified OTPs for this email and type
            await db.query(
                `DELETE FROM otps WHERE email = $1 AND type = $2 AND is_verified = false`,
                [email, type]
            );
            
            await db.query(
                `INSERT INTO otps (email, otp_hash, type, is_verified, expires_at)
                 VALUES ($1, $2, $3, $4, $5)`,
                [email, otpHash, type, false, expiresAt]
            );
            
            logger.info(`OTP created and hashed for ${email} (type: ${type})`);
        } catch (error) {
            logger.error('OTP creation error:', error);
            throw error;
        }
    }

    /**
     * Verify OTP by comparing provided OTP with stored hash
     * @param email - User email
     * @param otpCode - Plain OTP code submitted by user
     * @param type - OTP type: 'registration' or 'password_reset'
     * @returns true if OTP is valid, false otherwise
     */
    static async verify(email: string, otpCode: string, type: 'registration' | 'password_reset'): Promise<boolean> {
        try {
            // Get the OTP record
            const result = await db.query(
                `SELECT * FROM otps 
                 WHERE email = $1 AND type = $2 
                 AND is_verified = false AND expires_at > NOW()
                 ORDER BY created_at DESC LIMIT 1`,
                [email, type]
            );
            
            if (result.rows.length === 0) {
                logger.warn(`No valid OTP found for ${email} (type: ${type})`);
                return false;
            }
            
            const otpRecord = result.rows[0] as OTPRecord;
            
            // Compare provided OTP with stored hash
            const isValid = await bcrypt.compare(otpCode, otpRecord.otp_hash);
            
            if (!isValid) {
                logger.warn(`OTP verification failed for ${email} - hash mismatch`);
                return false;
            }
            
            // Mark OTP as verified
            await db.query(
                `UPDATE otps SET is_verified = true WHERE id = $1`,
                [otpRecord.id]
            );
            
            logger.info(`OTP verified successfully for ${email}`);
            return true;
        } catch (error) {
            logger.error('OTP verification error:', error);
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
            
            logger.info(`OTP deleted for ${email} (type: ${type})`);
        } catch (error) {
            logger.error('OTP deletion error:', error);
            throw error;
        }
    }
}

export default OTPModel;


