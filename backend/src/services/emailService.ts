import sgMail from '@sendgrid/mail';
import logger from '../config/logger';

class EmailService {
    private isConfigured: boolean = false;

    constructor() {
        this.initialize();
    }

    private initialize() {
        const apiKey = process.env.SENDGRID_API_KEY;
        
        if (!apiKey) {
            logger.warn('📧 SendGrid API key not configured - email service disabled');
            logger.info('💡 Set SENDGRID_API_KEY environment variable to enable emails');
            return;
        }

        try {
            sgMail.setApiKey(apiKey);
            this.isConfigured = true;
            logger.info('✅ Email service initialized with SendGrid');
        } catch (error) {
            logger.error('❌ Failed to initialize SendGrid:', error);
        }
    }

    /**
     * Send email using SendGrid
     */
    private async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
        if (!this.isConfigured) {
            logger.warn('📧 Email service not configured - email not sent');
            return false;
        }

        try {
            const msg = {
                to,
                from: {
                    email: process.env.EMAIL_FROM || 'noreply@weatherdashboard.com',
                    name: process.env.EMAIL_FROM_NAME || 'Weather Dashboard'
                },
                subject,
                html,
            };

            await sgMail.send(msg);
            logger.info(`✅ Email sent successfully to ${to}`);
            return true;
        } catch (error: any) {
            logger.error('❌ SendGrid email error:', error);
            if (error.response) {
                logger.error('SendGrid error details:', error.response.body);
            }
            return false;
        }
    }

    /**
     * Send verification email (deprecated - using OTP now)
     */
    async sendVerificationEmail(email: string, username: string, token: string): Promise<boolean> {
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🌤️ Welcome to Weather Dashboard!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${username}!</h2>
                        <p>Thank you for registering with Weather Dashboard. To complete your registration, please verify your email address.</p>
                        <p style="text-align: center;">
                            <a href="${verificationUrl}" class="button">Verify Email Address</a>
                        </p>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
                            ${verificationUrl}
                        </p>
                        <p><strong>This link will expire in 24 hours.</strong></p>
                        <p>If you didn't create an account, you can safely ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 Weather Dashboard. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail(email, 'Verify Your Email - Weather Dashboard', html);
    }

    /**
     * Send OTP for email verification or password reset
     */
    async sendOTPEmail(email: string, username: string, otp: string, type: 'registration' | 'password_reset'): Promise<boolean> {
        const subject = type === 'registration' 
            ? 'Email Verification Code - Weather Dashboard'
            : 'Password Reset Code - Weather Dashboard';

        const title = type === 'registration'
            ? 'Email Verification'
            : 'Password Reset';

        const description = type === 'registration'
            ? 'Use this code to verify your email and complete your registration:'
            : 'Use this code to reset your password:';

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; border: 2px solid #3b82f6; }
                    .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #3b82f6; font-family: monospace; }
                    .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
                    .warning { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 20px 0; color: #856404; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🌤️ ${title}</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${username}!</h2>
                        <p>${description}</p>
                        <div class="otp-box">
                            <p style="margin: 0; color: #666; font-size: 12px; margin-bottom: 10px;">Enter this code:</p>
                            <div class="otp-code">${otp}</div>
                        </div>
                        <div class="warning">
                            <strong>⚠️ Security Notice:</strong> Never share this code with anyone. Our team will never ask for your OTP.
                        </div>
                        <p style="color: #999; font-size: 12px;">This code will expire in <strong>5 minutes</strong>. If you didn't request this code, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 Weather Dashboard. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail(email, subject, html);
    }

    /**
     * Send welcome email (after verification)
     */
    async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .features { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to Weather Dashboard!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${username}!</h2>
                        <p>Your email has been verified successfully! You're all set to start using Weather Dashboard.</p>
                        <div class="features">
                            <h3>Here's what you can do:</h3>
                            <ul>
                                <li>🌤️ Check current weather for any city worldwide</li>
                                <li>⭐ Save your favorite cities for quick access</li>
                                <li>🌡️ View detailed weather information</li>
                                <li>📱 Access from any device</li>
                            </ul>
                        </div>
                        <p style="text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">Go to Dashboard</a>
                        </p>
                        <p>Have questions or need help? Feel free to reach out to our support team.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2026 Weather Dashboard. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail(email, 'Welcome to Weather Dashboard!', html);
    }
}

export default new EmailService();
